import React, { useState, useEffect, useRef, useCallback } from 'react'
import { EventType } from '@logicflow/core'
import { EllipsisOutlined } from '@ant-design/icons'
import {
  nodeIconMap,
  IconBackgroundColor,
  NodeBackground,
  TypeCategoryEnum,
  Elements,
  INodeCustomEvent,
} from '../config'

export default function CustomFlowNode(props: { node: any; graph: any }) {
  const { node, graph } = props
  const [state, setState] = useState({
    popoverVisible: false,
    isSilentMode: false,
    activeType: 'false',
    type: '',
    branchList: [] as any[],
    responseContent: null,
    nodeLabel: '',
  })

  const popoverRef = useRef<any>(null)
  const nodeRef = useRef<any>(null)

  const nodeIcon = nodeIconMap[state.type]
  const nodeCategory = TypeCategoryEnum[state.type]

  const handleClick = (eventType: INodeCustomEvent) => {
    if (popoverRef.current) {
      popoverRef.current.hide()
    }
    graph.eventCenter.emit(eventType, node)
  }

  const goSopDetail = (responseContent: any) => {
    window.open(
      `/#/sop-production/process-management/sop-detail/view/${responseContent.flow_info.flow_id}?sopProductionSpaceId=${responseContent.flow_info.flow_space_id}`,
      '_blank',
    )
  }

  const updateNodeViewData = useCallback(() => {
    const currentNode = graph.getElement(node.id) || node
    const { properties = {} } = currentNode

    setState((prev) => ({
      ...prev,
      type: properties.nodeType,
      activeType: properties.activated,
      isSilentMode: graph?.editConfigModel?.isSilentMode || false,
      nodeLabel: properties.node_name,
      branchList: properties.branches || [],
      responseContent: properties.response_list
        ? properties.response_list[0]?.config_info
        : null,
    }))
  }, [graph, node])

  const updateJudgeNode = useCallback(() => {
    if (TypeCategoryEnum[state.type] !== 'JUDGE') {
      return
    }

    const currentNode = graph.getElement(node.id)
    currentNode.setAttributes()

    const { edges } = graph
    const currentNodeAsTargetEdges = edges.filter(
      (edge: any) => edge.targetNodeId === currentNode.id,
    )
    if (currentNodeAsTargetEdges.length > 0) {
      const { anchors } = currentNode
      const leftAnchor = anchors.find((anchor: any) =>
        anchor.id.includes('left'),
      )
      currentNodeAsTargetEdges.forEach((edge: any) => {
        edge.updateEndPoint({
          x: leftAnchor.x,
          y: leftAnchor.y,
        })
      })
    }

    const currentNodeAsSourceEdges = edges.filter(
      (edge: any) => edge.sourceNodeId === currentNode.id,
    )
    if (currentNodeAsSourceEdges.length > 0) {
      const { anchors } = currentNode
      const rightAnchors = anchors.filter((anchor: any) =>
        anchor.id.includes('right'),
      )
      currentNodeAsSourceEdges.forEach((edge: any) => {
        const sourceAnchorId = rightAnchors.find(
          (anchor: any) => anchor.id === edge.sourceAnchorId,
        )
        if (sourceAnchorId) {
          edge.updateStartPoint({
            x: sourceAnchorId.x,
            y: sourceAnchorId.y,
          })
        }
      })
    }
  }, [graph, node, state.type])

  useEffect(() => {
    updateNodeViewData()
    const handleNodePropertiesChange = (eventData: any) => {
      if (eventData.id !== node.id) return
      const { properties } = eventData

      setState((prev) => ({
        ...prev,
        nodeLabel: properties.node_name,
        activeType: properties.activated,
        branchList: properties.branches || [],
        responseContent: properties.response_list[0].config_info,
      }))

      updateJudgeNode()
    }

    const handleHistoryChange = () => {
      setTimeout(() => {
        updateNodeViewData()
        updateJudgeNode()
      }, 0)
    }

    graph.eventCenter.on(
      EventType.NODE_PROPERTIES_CHANGE,
      handleNodePropertiesChange,
    )
    graph.eventCenter.on('history:undo,history:redo', handleHistoryChange)

    return () => {
      graph.eventCenter.off(
        EventType.NODE_PROPERTIES_CHANGE,
        handleNodePropertiesChange,
      )
      graph.eventCenter.off('history:undo,history:redo', handleHistoryChange)
    }
  }, [node, graph, updateNodeViewData, updateJudgeNode])

  const renderResponseContent = () => {
    if (nodeCategory !== 'LEAF') return null

    switch (state.type) {
      case Elements.LLM_RESPONSE:
      case Elements.RAG_RESPONSE:
        return (
          <div className="response-item">
            <div className="response-label">模型名称</div>
            <div>
              {state.responseContent &&
              state.responseContent.model_config &&
              state.responseContent.model_config.model_name ? (
                state.responseContent.model_config.model_name
              ) : (
                <div className="response-default">未配置</div>
              )}
            </div>
          </div>
        )

      case Elements.SOP_SOLUTION_RESPONSE:
        return (
          <div className="response-item">
            <div className="response-label">解决方案</div>
            <div>
              {state.responseContent &&
              state.responseContent.flow_info &&
              state.responseContent.flow_info.flow_key ? (
                <div className="response-value">
                  <div
                    onClick={() => goSopDetail(state.responseContent)}
                    className="ellipsis-one-line sop-name"
                  >
                    {state.responseContent.flow_info.flow_name}
                  </div>
                  <div className="sop-key">
                    ({state.responseContent.flow_info.flow_key})
                  </div>
                </div>
              ) : (
                <div className="response-default">未配置</div>
              )}
            </div>
          </div>
        )

      case Elements.TEXT_RESPONSE:
        return (
          <div>
            {state.responseContent &&
            state.responseContent.robot_reply_info &&
            state.responseContent.robot_reply_info.script ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: state.responseContent.robot_reply_info.script,
                }}
                className="text-response"
              />
            ) : (
              <div className="response-default">未配置</div>
            )}
          </div>
        )

      case Elements.CALL_RESPONSE:
        return (
          <div className="response-item">
            <div className="response-label">调用模块</div>
            <div>
              {state.responseContent && state.responseContent.next_module ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: state.responseContent.next_module,
                  }}
                  className="text-response"
                />
              ) : (
                <div className="response-default">未配置</div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderBranchList = () => {
    if (nodeCategory !== 'JUDGE') return null

    return (
      <div className="branch-list">
        {state.branchList.map((item: any, index: number) => (
          <div key={item.id} className="branch-item">
            <div className="branch-index">分支{index + 1}</div>
            {item.branch_name ? (
              <div className="branch-name">{item.branch_name}</div>
            ) : (
              <div className="branch-name-default">未配置</div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={nodeRef}
      className={`node-box node-box-${state.type} ${state.isSilentMode ? 'node-box-disabled' : ''} node-box-${state.activeType}`}
      style={{ backgroundImage: NodeBackground[state.type] }}
    >
      <div className="title-box">
        <div className="title-left">
          <img
            className="node-icon"
            src={nodeIcon}
            alt=""
            style={{ backgroundColor: IconBackgroundColor[state.type] }}
          />
          <div className="node-label">{state.nodeLabel}</div>
        </div>
        <div
          className="more-box"
          onClick={() =>
            setState((prev) => ({
              ...prev,
              popoverVisible: !prev.popoverVisible,
            }))
          }
        >
          <EllipsisOutlined />
        </div>
      </div>

      {state.popoverVisible && (
        <div className="hover-btn-box">
          {state.type !== 'START' && !state.isSilentMode && (
            <div
              className="hover-btn"
              onClick={() => handleClick(INodeCustomEvent.CopyNode)}
            >
              创建副本
            </div>
          )}
          <div
            className="hover-btn"
            onClick={() => handleClick(INodeCustomEvent.CopyId)}
          >
            复制节点ID
          </div>
          {state.type !== 'START' && !state.isSilentMode && (
            <div
              className="hover-btn"
              onClick={() => handleClick(INodeCustomEvent.DeleteNode)}
            >
              删除
            </div>
          )}
        </div>
      )}

      <div className="response-content">{renderResponseContent()}</div>

      {renderBranchList()}
    </div>
  )
}
