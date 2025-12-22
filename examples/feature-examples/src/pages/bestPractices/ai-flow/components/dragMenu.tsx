import React, { useRef } from 'react'
import { patternItems, IconBackgroundColor } from '../config'

interface DragMenuProps {
  lfInstance: any
  onHandleDragItem: (node: any) => void
}

const DragMenu: React.FC<DragMenuProps> = ({
  lfInstance,
  onHandleDragItem,
}) => {
  const dragMenuBoxRef = useRef<HTMLDivElement>(null)

  // 点击节点，监听点击事件的位置，将节点添加到点击位置
  const handleClickItem = (node: any, index: number) => {
    console.log('-----', lfInstance.current)
    const dragMenuBox = dragMenuBoxRef.current
    // 获取drag-menu-box的坐标
    const { left, top } = dragMenuBox?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    }
    const { transformModel } = lfInstance.current.graphModel
    const lineIndex = Math.ceil((index + 1) / 2)
    const [x, y] = transformModel.HtmlPointToCanvasPoint([
      left + 320,
      top - 80 + lineIndex * 35,
    ])
    lfInstance.current.addNode({
      ...node,
      x,
      y,
    })
  }

  // 拖拽新建节点
  const handleDragItem = (node: any) => {
    onHandleDragItem(node)
  }

  return (
    <div className="drag-menu-box" ref={dragMenuBoxRef}>
      {patternItems.map((item, index) => (
        <div
          key={item.label}
          className="drag-menu-item"
          onClick={() =>
            handleClickItem(
              {
                type: item.type,
                text: item.label,
                properties: item.properties,
              },
              index,
            )
          }
          onMouseDown={() =>
            handleDragItem({
              type: item.type,
              text: item.label,
              properties: item.properties,
            })
          }
        >
          <img
            src={item.icon}
            alt=""
            className="menu-img"
            style={{
              backgroundColor:
                IconBackgroundColor[
                  item.type as keyof typeof IconBackgroundColor
                ],
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default DragMenu
