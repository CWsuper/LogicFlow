import LogicFlow, { createUuid } from '@logicflow/core'
import { SelectionSelect, MiniMap } from '@logicflow/extension'
import { Button, Card, message, Drawer } from 'antd'
import { useEffect, useRef, useState } from 'react'
import ContextMenu from './contextMenu'
import ToolPanel from './components/StrategyToolPanel'
import registerNode from './model/index'
import {
  TypeCategoryEnum,
  INodeCustomEvent,
  EditDisableElementList,
} from './config'
import { addFakeNode } from './util'
import styles from './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const data = {
  nodes: [],
  edges: [],
}

export default function SelectionSelectExample() {
  const [isDisabled, setIsDisabled] = useState(false)
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodeDrawerVisible, setNodeDrawerVisible] = useState(false)
  const [currentNodeData, setCurrentNodeData] = useState<any>({})
  const [branchList, setBranchList] = useState<any>([])
  const [zoomNum, setZoomNum] = useState('100%')
  const [isFullScreen, setIsFullScreen] = useState(false)

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      lfRef.current = new LogicFlow({
        container: containerRef.current!,
        tool: { control: true },
        autoExpand: true,
        stopMoveGraph: true,
        textEdit: false,
        nodeTextEdit: false,
        edgeTextEdit: false,
        isSilentMode: false,
        grid: false,
        background: {
          backgroundImage:
            "url('https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/sop/flow-bg.png')",
          backgroundRepeat: 'repeat',
        },
        keyboard: {
          enabled: true,
          shortcuts: [
            {
              keys: ['cmd + c', 'ctrl + c'],
              callback: () => {
                handleLfCopy()
              },
            },
            {
              keys: ['cmd + v', 'ctrl + v'],
              callback: () => {
                handleLfPaste()
              },
            },
            {
              keys: ['cmd + z', 'ctrl + z'],
              callback: () => {
                if (isDisabled) return
                // 自定义事件-撤销-使用logicflow的消息中心
                lf.graphModel.eventCenter.emit('history:undo')
                lf.undo()
              },
            },
            {
              keys: ['cmd + y', 'ctrl + y'],
              callback: () => {
                if (isDisabled) return
                // 自定义事件-重做-使用logicflow的消息中心
                lf.graphModel.eventCenter.emit('history:redo')
                lf.redo()
              },
            },
            {
              keys: ['backspace'],
              callback: () => {
                if (isDisabled) return
                if (nodeDrawerVisible) {
                  setNodeDrawerVisible(false)
                }
                const { nodes, edges } = lf.getSelectElements(true)
                if (nodes.length === 0 && edges.length === 0) return
                lf.clearSelectElements()
                edges.forEach((edge) => {
                  lf.deleteEdge(edge.id)
                })
                nodes.forEach((node) => {
                  if (node.type === 'START') return
                  lf.deleteNode(node.id)
                })
              },
            },
          ],
        },
        plugins: [SelectionSelect, MiniMap, ContextMenu],
        pluginsOptions: {
          miniMap: {
            width: 207,
            height: 185,
            headerTitle: '导航',
            isShowHeader: true,
            showEdge: true,
          },
        },
        edgeType: 'SequenceFlow',
      })
      lfRef.current.setTheme({
        polyline: {
          stroke: '#2961EF',
        },
        anchor: {
          stroke: '#FFFFFF',
          fill: '#2961EF',
          r: 4,
          hover: {
            stroke: '#FFFFFF',
            fill: '#2961EF',
            fillOpacity: 0.5,
            r: 10,
          },
        },
      })
      registerNode(lfRef.current)
      setTimeout(() => {
        lfRef.current.extension.selectionSelect.openSelectionSelect()
      }, 0)
      // 画布缩放
      console.log('lfRef.current', lfRef.current)
      lfRef.current.on('graph:transform', (data) => {
        console.log('vvvvvv', data)
        if (data?.type === 'zoom' && data?.transform)
          setZoomNum(`${Math.ceil(data.transform.SCALE_X * 100)}%`)
      })
      // 拖拽添加节点
      lfRef.current.on('node:dnd-add', (data) => {
        if (['USER_EXPRESSION', 'FEATURE_LIST'].includes(data?.data?.type)) {
          addFakeNode(lfRef.current, data.data)
        }
      })
      // 锚点添加节点
      lfRef.current.on(INodeCustomEvent.AnchorAddNode, ({ data }) => {
        if (['USER_EXPRESSION', 'FEATURE_LIST'].includes(data?.type)) {
          addFakeNode(lfRef.current, data)
        }
      })
      // 边删除，如果边的目标节点是FakeNodeUserTask，则删除该节点
      lfRef.current.on('edge:delete', ({ data }) => {
        const { targetNodeId } = data
        const targetNode: any = lfRef.current.getNodeModelById(targetNodeId)
        if (targetNode.type === 'FakeNodeUserTask') {
          lfRef.current.deleteNode(targetNode.id)
        }
      })
      // 元素点击
      lfRef.current.on('element:click', ({ data }) => {
        console.log('element:click', data)
        const { type } = data
        if (EditDisableElementList.includes(type)) {
          if (nodeDrawerVisible) {
            setNodeDrawerVisible(false)
          }
          return
        }
        showNodeDrawer(data)
      })
      // 临时节点hover状态就要展示节点菜单
      lfRef.current.on('node:mouseenter', ({ data }) => {
        const { type } = data
        if (type === 'FakeNodeUserTask') {
          lfRef.current.showContextMenu(data)
        }
      })
      // 锚点点击展示节点菜单
      lfRef.current.on('anchor:click', ({ data, nodeModel }) => {
        const { id: nodeId } = nodeModel
        lfRef.current.showContextMenu(null, { ...nodeModel, ...data, nodeId })
      })
      // 点击画布
      lfRef.current.on('blank:mousedown', () => {
        if (nodeDrawerVisible) {
          setNodeDrawerVisible(false)
        }
      })
      // 边的连接不允许
      lfRef.current.on('connection:not-allowed', (data) => {
        const { msg } = data
        message.error(msg)
      })
      // 复制ID
      lfRef.current.on(INodeCustomEvent.CopyId, (data) => {
        const ele = document.createElement('textarea')
        document.body.appendChild(ele)
        ele.value = `${data.id}`
        ele.select()
        document.execCommand('copy')
        document.body.removeChild(ele)
        message.success('ID复制成功！')
      })
      // 复制节点
      lfRef.current.on(INodeCustomEvent.CopyNode, async (data) => {
        const newNode: any = lfRef.current.cloneNode(data.id)
        // 重新生成判断节点properties.branches中的anchorId
        const nodeModel: any = lfRef.current.graphModel.getNodeModelById(
          newNode.id,
        )
        if (nodeModel.type === 'judge') {
          const { properties } = nodeModel
          const newBranches = (properties.branches || []).map((branch: any) => {
            branch.anchorId = `${createUuid()}_right`
            return branch
          })
          nodeModel.setProperties({
            ...properties,
            branches: newBranches,
          })
        }
      })
      // 删除节点
      lfRef.current.on(INodeCustomEvent.DeleteNode, (data) => {
        lfRef.current.deleteNode(data.id)
      })
      // 元素点击
      lfRef.current.on('element:click', ({ data }) => {
        console.log('element:click', data)
        const { type } = data
        if (EditDisableElementList.includes(type)) {
          if (nodeDrawerVisible) {
            setNodeDrawerVisible(false)
          }
          return
        }
        showNodeDrawer(data)
      })
      lfRef.current.render(data)
    }
    setIsDisabled(false)
  }, [])

  const nodeDrawerHide = () => {
    // nodeComponentRef.value.updateLfNodeData();
  }
  const showNodeDrawer = async (nodeData: any) => {
    const { type, id } = nodeData
    // 如果正在编辑当前节点不进行操作
    if (nodeDrawerVisible && id === currentNodeData.value.id) return
    // 如果当前节点正在编辑，关闭当前节点抽屉
    if (nodeDrawerVisible) {
      nodeDrawerHide()
      currentNodeData.value = {}
    }
    // 如果是触发事件类的分支判断节点
    if ((TypeCategoryEnum as any)[type] === 'JUDGE') {
      setBranchList([...branchList.value])
    }
    setCurrentNodeData({ ...nodeData })
    setNodeDrawerVisible(true)
  }

  useEffect(() => {
    if (!nodeDrawerVisible) {
      nodeDrawerHide()
    }
  }, [nodeDrawerVisible])

  const getData = () => {
    console.log('lf 实例', lfRef.current)
    console.log('当前data数据', lfRef.current?.getGraphRawData())
  }
  const updateFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <Card title="ai 工作流实践" className={styles.viewport}>
      <div
        ref={containerRef}
        id="logicflow-contanier"
        className="lf-graph"
      ></div>
      <Button onClick={getData}>获取数据</Button>
      <ToolPanel
        lfInstance={lfRef}
        isDisabled={false}
        zoomNum={zoomNum}
        isFullScreen={isFullScreen}
        onUpdateFullScreen={updateFullScreen}
      />
      <Drawer
        title=""
        placement="right"
        closable={false}
        onClose={() => setNodeDrawerVisible(false)}
        open={nodeDrawerVisible}
        width={580}
        mask={false}
      >
        <div>
          {/* 这里应该根据实际节点类型显示对应的内容 */}
          <pre>{JSON.stringify(currentNodeData, null, 2)}</pre>
        </div>
      </Drawer>
    </Card>
  )
}
