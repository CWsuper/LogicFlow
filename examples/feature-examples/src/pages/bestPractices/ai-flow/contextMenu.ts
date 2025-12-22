/* eslint-disable consistent-return */
/* eslint-disable arrow-parens */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { message } from 'antd'
import {
  getJudgeNodeList,
  getLeafNodeList,
  IconBackgroundColor,
  TypeCategoryEnum,
  INodeCustomEvent,
} from './config'
import { addFakeNode, addNodeXGap } from './util'

const JudgeNodeList = getJudgeNodeList()
const LeftNodeList = getLeafNodeList()

class ContextMenu {
  static pluginName = 'ContextMenu'
  canShowMenu = true
  _activeData = null
  _activeAnchorData = null
  constructor({ lf }) {
    this.lf = lf
    this.__menuDOM = document.createElement('div')
    this.__menuDOM.className = 'lf-inner-context-quick-node'
    this.lf.showContextMenu = (nodeData, anchorData) => {
      console.log('222')
      if (!nodeData?.id && !anchorData?.id) {
        console.warn('请检查传入的参数')
        return
      }
      this._activeData = nodeData
      this._activeAnchorData = anchorData
      console.log('this._activeData', this._activeData)
      console.log('this._activeAnchorData', this._activeAnchorData)
      if (
        !(this._activeAnchorData && this._activeAnchorData.id.includes('left'))
      ) {
        this.createContextMenu()
      }
    }

    this.lf.hideContextMenu = () => {
      this.hideMenu()
    }
  }
  render(lf, container) {
    this.container = container
    lf.on('blank:click', () => {
      this.hideMenu()
    })
  }
  /**
   * 获取新菜单位置
   */
  getContextMenuPosition() {
    let x
    let y
    if (this._activeData) {
      // 虚拟节点hover菜单
      const data = this._activeData
      const Model = this.lf.graphModel.getElement(data.id)
      if (!Model) {
        console.warn(`找不到元素${data.id}`)
        return
      }
      if (data.type === 'FakeNodeUserTask') {
        x = data.x + Model.width / 2
        y = data.y - Model.height / 2
      }
    } else {
      // 锚点点击菜单
      // 菜单展示在锚点右侧
      x = this._activeAnchorData.x + 6
      y = this._activeAnchorData.y - 62
    }
    return this.lf.graphModel.transformModel.CanvasPointToHtmlPoint([x, y])
  }
  createContextMenu() {
    const { isShowContextMenu } = this.lf.graphModel
    // 静默模式不显示菜单
    if (isShowContextMenu === false) {
      return
    }
    const { type } = this._activeData || this._activeAnchorData
    const menus = document.createDocumentFragment()
    // 触发事件类节点
    ContextMenu.addMenuTypeTitle('触发事件', menus)
    JudgeNodeList.forEach((item) => {
      this.addMenuItem(item, menus)
    })
    if (type !== 'START') {
      // 应答服务类名称
      ContextMenu.addMenuTypeTitle('应答服务', menus)
      LeftNodeList.forEach((item) => {
        this.addMenuItem(item, menus)
      })
    }

    this.__menuDOM.innerHTML = ''
    this.__menuDOM.appendChild(menus)
    this.showMenu()
  }
  static addMenuTypeTitle(type, menus) {
    const menuTitle = document.createElement('div')
    menuTitle.className = 'lf-inner-context-quick-node-title'
    menuTitle.innerHTML = type
    menus.appendChild(menuTitle)
  }
  addMenuItem(item, menus) {
    const menuItem = document.createElement('div')
    menuItem.className = 'lf-inner-context-quick-node-item'
    const img = document.createElement('img')
    img.src = item.icon
    img.className = 'lf-inner-context-quick-node-item-img'
    img.style.background = IconBackgroundColor[item.type]
    const div = document.createElement('span')
    div.innerHTML = item.label
    div.className = 'lf-inner-context-quick-node-item-text'
    menuItem.appendChild(img)
    menuItem.appendChild(div)

    menuItem.addEventListener('click', () => {
      this.hideMenu()
      // 开始节点如果已经添加了下一个节点，则不允许添加
      if (this._activeAnchorData && this._activeAnchorData.type === 'START') {
        const edges = this.lf.getEdgeModels({
          sourceNodeId: this._activeAnchorData.nodeId,
        })
        if (edges.length > 0) {
          message.warning('开始节点只能添加一个下一个节点')
          return
        }
      }
      // 判断节点，分支只能连出一个节点
      if (
        this._activeAnchorData &&
        TypeCategoryEnum[this._activeAnchorData.type] === 'JUDGE'
      ) {
        const edges = this.lf.getEdgeModels({
          sourceNodeId: this._activeAnchorData.nodeId,
        })
        if (edges && edges.length > 0) {
          const anchorSourceEdge = edges.filter(
            (item) => item.sourceAnchorId === this._activeAnchorData.id,
          )
          if (anchorSourceEdge.length > 0) {
            message.warning('分支节点只能添加一个下一个节点')
            return
          }
          // ood分支只能连接应答服务节点
          const { properties = {} } = this._activeAnchorData
          const { branches = [] } = properties as {
            branches?: { anchorId: string; is_out_of_domain: boolean }[]
          }
          // 判断当前锚点是否是ood分支
          const currentBranch = branches.find(
            (branch) => branch.anchorId === this._activeAnchorData.id,
          )
          const isOodBranch = currentBranch?.is_out_of_domain
          if (isOodBranch) {
            // 只允许连线到应答服务节点
            const isLeafNode = TypeCategoryEnum[item.type] === 'LEAF'
            if (!isLeafNode) {
              message.warning('ood分支只能连接应答服务节点')
              return
            }
          }
        }
      }
      if (this._activeData) {
        this.addRealNode({
          sourceId: this._activeData.id,
          x: this._activeData.x,
          y: this._activeData.y,
          properties: { ...item.properties },
          type: item.type,
          name: item.label,
        })
      }
      if (this._activeAnchorData) {
        this.addAnchorNode(item)
      }
    })
    menus.appendChild(menuItem)
  }

  getHtmlPoint(point) {
    return this.lf.graphModel.transformModel.CanvasPointToHtmlPoint(point)
  }
  addAnchorNode(nodeConfig, gapNodeNum = 0) {
    const data = this._activeAnchorData
    const nodeWidth = 190
    const nodeYGap = TypeCategoryEnum[nodeConfig.type] === 'JUDGE' ? 260 : 150
    const x = data.x + addNodeXGap + nodeWidth / 2 + 60
    const y = data.y + gapNodeNum * nodeYGap
    // 判断新节点位置是否已有节点,如有则更换位置
    const leftTopX = x - 82 - 16
    const leftTopY = y - 46 - 10
    const rightBottomX = x + 82 + 16
    const rightBottomY = y + 46 + 10
    const existElements = this.lf.getAreaElement(
      this.getHtmlPoint([leftTopX, leftTopY]),
      this.getHtmlPoint([rightBottomX, rightBottomY]),
      true,
      false,
    )
    if (existElements.length) {
      this.addAnchorNode(nodeConfig, gapNodeNum + 1)
      return
    }

    const newNode = this.lf.addNode({
      type: nodeConfig.type,
      x,
      y,
      text: nodeConfig.label,
      properties: nodeConfig.properties,
    })
    const edgeData = {
      sourceNodeId: data.nodeId,
      targetNodeId: newNode.id,
      sourceAnchorId: data.id,
    }
    this.lf.addEdge({ ...edgeData })

    const { eventCenter } = this.lf.graphModel
    eventCenter.emit(INodeCustomEvent.AnchorAddNode, { data: newNode })
  }
  addRealNode(info) {
    const { sourceId, type, properties, name } = info
    this.lf.changeNodeType(sourceId, type)
    this.lf.updateText(sourceId, name)
    this.lf.setProperties(sourceId, {
      ...properties,
    })
    this.lf.graphModel.moveNode(sourceId, 60, 0)
    if (TypeCategoryEnum[type] === 'JUDGE') {
      addFakeNode(this.lf, { x: info.x, y: info.y, id: sourceId })
    }
    // 聚焦新添加的节点
    this.lf.selectElementById(sourceId)
    const data = this.lf.getNodeDataById(sourceId)
    const { eventCenter } = this.lf.graphModel
    eventCenter.emit('node:click', { data })
  }

  showMenu() {
    this.__menuDOM.style.display = 'block'
    const [x, y] = this.getContextMenuPosition()
    this.__menuDOM.style.top = `${y}px`
    this.__menuDOM.style.left = `${x + 10}px`
    this.container.appendChild(this.__menuDOM)
    // 菜单显示的时候，监听删除，同时隐藏
    if (!this.isShow) {
      this.lf.on(
        'node:delete,edge:delete,node:drag,graph:transform,anchor:dragstart',
        this.listenDelete,
      )
      this.isShow = true
    }
  }

  listenDelete = () => {
    this.hideMenu()
  }

  hideMenu() {
    this.__menuDOM.innerHTML = ''
    this.__menuDOM.style.display = 'none'
    if (this.isShow) {
      this.container.removeChild(this.__menuDOM)
    }
    this.lf.off(
      'node:delete,edge:delete,node:drag,graph:transform',
      this.listenDelete,
    )
    this.isShow = false
  }
}

export default ContextMenu
