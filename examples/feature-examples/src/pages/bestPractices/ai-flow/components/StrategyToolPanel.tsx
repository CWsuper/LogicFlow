import React, { useEffect, useRef, useState } from 'react'
import { Button, Popover } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import DragMenu from './dragMenu'

interface StrategyToolPanelProps {
  lfInstance: any
  isDisabled: boolean
  zoomNum: string
  isFullScreen: boolean
  onUpdateFullScreen: () => void
}

export default function StrategyToolPanel({
  lfInstance,
  isDisabled,
  zoomNum,
  isFullScreen,
  onUpdateFullScreen,
}: StrategyToolPanelProps) {
  const [showMinimap, setShowMinimap] = useState(false)
  const [showDragMenu, setShowDragMenu] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // 上一步
  const handleUndo = () => {
    if (!lfInstance.current) return
    // 自定义事件-撤销-使用logicflow的消息中心
    lfInstance.current.graphModel.eventCenter.emit('history:undo')
    lfInstance.current.undo()
  }

  // 下一步
  const handleRedo = () => {
    // 自定义事件-重做-使用logicflow的消息中心
    lfInstance.current.graphModel.eventCenter.emit('history:redo')
    if (!lfInstance.current) return
    lfInstance.current.redo()
  }

  // 缩小
  const handleZoomOut = () => {
    if (!lfInstance.current) return
    lfInstance.current.zoom(false)
  }

  // 放大
  const handleZoomIn = () => {
    if (!lfInstance.current) return
    lfInstance.current.zoom(true)
  }

  // 重置大小
  const handleResetZoom = () => {
    if (!lfInstance.current) return
    lfInstance.current.resetZoom()
  }

  // 小地图
  const handleMiniMap = () => {
    if (!lfInstance.current) return
    if (showMinimap) {
      lfInstance.current.extension.miniMap.hide()
    } else {
      lfInstance.current.extension.miniMap.show()
    }
    setShowMinimap(!showMinimap)
  }

  // 全屏
  const handleFullScreen = () => {
    if (isFullScreen) {
      const exitMethod =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen
      if (exitMethod) {
        exitMethod.call(document)
      }
    } else {
      const element: any = document.getElementById('logicflow-contanier')
      // 开启全屏
      const requestMethod =
        element.requestFullscreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen
      if (requestMethod) {
        requestMethod.call(element)
      }
    }
  }

  const handleFullScreenChange = () => {
    onUpdateFullScreen()
  }

  // 拖拽新建节点
  const handleDragItem = (node: any) => {
    console.log('000', lfInstance.current)
    console.log('1111', node)
    if (!lfInstance.current) return
    console.log('2222', node)
    lfInstance.current.dnd.startDrag(node)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node)
    ) {
      setShowDragMenu(false)
    }
  }

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      if (lfInstance.current) {
        lfInstance.current.off('')
      }
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [lfInstance.current])

  return (
    <div className="bottom-container">
      <div className={`menu-box ${isDisabled ? 'menu-box-disabled' : ''}`}>
        <div
          className="menu-btn menu-btn-undo"
          onClick={handleUndo}
          style={{ display: isDisabled ? 'none' : 'block' }}
        ></div>
        <div
          className="menu-btn menu-btn-redo"
          onClick={handleRedo}
          style={{ display: isDisabled ? 'none' : 'block' }}
        ></div>
        <div
          className="menu-btn menu-btn-zoomout"
          onClick={handleZoomOut}
        ></div>
        <div className="zoom-num">{zoomNum}</div>
        <div className="menu-btn menu-btn-zoomin" onClick={handleZoomIn}></div>
        <div className="menu-btn menu-btn-11" onClick={handleResetZoom}></div>
        <div
          className={`menu-btn ${isFullScreen ? 'menu-btn-fullactive' : 'menu-btn-full'}`}
          onClick={handleFullScreen}
        ></div>
        <div
          className={`menu-btn menu-btn-mini-item ${showMinimap ? 'menu-btn-miniactive' : 'menu-btn-mini'}`}
          onClick={handleMiniMap}
        ></div>
      </div>
      <div
        className="split"
        style={{ display: isDisabled ? 'none' : 'block' }}
      ></div>
      <Popover
        content={
          <div className="add-node-container" style={{ width: '218px' }}>
            <DragMenu
              onHandleDragItem={handleDragItem}
              lfInstance={lfInstance}
            />
          </div>
        }
        trigger="hover"
        open={showDragMenu}
        onOpenChange={setShowDragMenu}
        placement="bottom"
      >
        <Button
          className="add-node-btn"
          style={{ display: isDisabled ? 'none' : 'block' }}
          onClick={() => setShowDragMenu(!showDragMenu)}
        >
          <PlusOutlined />
          添加节点
        </Button>
      </Popover>
    </div>
  )
}
