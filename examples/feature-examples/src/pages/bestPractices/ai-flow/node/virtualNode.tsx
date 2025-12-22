import React, { useState, useEffect } from 'react'
import { BaseNodeModel, EventType, GraphModel } from '@logicflow/core'

interface VirtualNodeProps {
  node: BaseNodeModel
  graph: GraphModel
}

const VirtualNode: React.FC<VirtualNodeProps> = ({ node, graph }) => {
  const [title, setTitle] = useState<string>('添加节点')
  const [activeType, setActiveType] = useState<string>('false')

  useEffect(() => {
    // 设置初始标题
    if (node && node.text && node.text.value) {
      setTitle(node.text.value)
    }

    // 监听节点属性变化事件
    const handleNodePropertiesChange = (eventData: any) => {
      if (eventData.id !== node.id) return
      const { properties } = eventData
      setActiveType(properties.activated ? 'true' : 'false')
    }

    // 添加事件监听器
    graph.eventCenter.on(
      EventType.NODE_PROPERTIES_CHANGE,
      handleNodePropertiesChange,
    )

    // 组件卸载时移除事件监听器
    return () => {
      graph.eventCenter.off(
        EventType.NODE_PROPERTIES_CHANGE,
        handleNodePropertiesChange,
      )
    }
  }, [node, graph])

  return (
    <>
      <div className={`virtual-node-box virtual-node-box-${activeType}`}>
        <div className="virtual-node-bot-inner">
          <div className="title">{title}</div>
        </div>
      </div>

      <style>{`
        .virtual-node-box {
          width: 64px;
          height: 49px;
          border-radius: 8px;
          opacity: 1;
          box-sizing: border-box;
          border: 1px solid #DDDFE6;
          padding: 4px;
          font-family: PingFang SC;
          font-size: 12px;
          font-weight: normal;
          line-height: 17px;
          letter-spacing: 0px;
          background: #FFFFFF;
        }

        .virtual-node-bot-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          color: #A8ADBD;
          background: #FFFFFF;
        }

        .gaia-icon {
          font-size: 16px;
        }

        .virtual-node-box:hover .virtual-node-bot-inner {
          background: #F0F3F8;
          color: #5D6276;
        }

        .virtual-node-box-true {
          border-color: #FF8E5A;
          background: rgba(247, 148, 102, 0.08);
        }

        .virtual-node-box-true .virtual-node-bot-inner {
          background: transparent;
        }

        .lf-node.lf-node-selected .custom-vue-node-content .virtual-node-box {
          border: 1px solid #2961EF;
        }
      `}</style>
    </>
  )
}

export default VirtualNode
