/* eslint-disable default-case */
import { createUuid } from '@logicflow/core'
// 后端处理节点只分为这3大类
export const TypeCategoryEnum = {
  START: 'START',
  USER_EXPRESSION: 'JUDGE',
  FEATURE_LIST: 'JUDGE',
  DIALOG_STATUS: 'JUDGE',
  TEXT_RESPONSE: 'LEAF',
  SOP_SOLUTION_RESPONSE: 'LEAF',
  LLM_RESPONSE: 'LEAF',
  RAG_RESPONSE: 'LEAF',
  CALL_RESPONSE: 'LEAF',
}
const nodeTitleMap = {
  START: '开始节点',
  USER_EXPRESSION: '用户表达',
  FEATURE_LIST: '特征集合',
  DIALOG_STATUS: '对话状态',
  TEXT_RESPONSE: '固定话术',
  SOP_SOLUTION_RESPONSE: '解决方案',
  LLM_RESPONSE: '大模型',
  RAG_RESPONSE: 'RAG应答',
  SequenceFlow: '分支编辑',
  FakeNodeUserTask: '虚拟节点',
  CALL_RESPONSE: '模块调用应答',
}
// import { TypeCategoryEnum, nodeTitleMap } from './config';

/**
 * 移动节点到指定位置
 */
export function translationNodeData(nodeData, distanceX, distanceY) {
  nodeData.x += distanceX
  nodeData.y += distanceY
  if (nodeData.text) {
    nodeData.text.x = +nodeData.text.x + distanceX
    nodeData.text.y = +nodeData.text.y + distanceY
  }
  return nodeData
}

function translationEdgeData(edgeData, distanceX, distanceY) {
  if (edgeData.startPoint) {
    edgeData.startPoint.x += distanceX
    edgeData.startPoint.y += distanceY
  }
  if (edgeData.endPoint) {
    edgeData.endPoint.x += distanceX
    edgeData.endPoint.y += distanceY
  }
  if (edgeData.pointsList && edgeData.pointsList.length > 0) {
    edgeData.pointsList.forEach((point) => {
      point.x += distanceX
      point.y += distanceY
    })
  }
  if (edgeData.text) {
    edgeData.text.x = +edgeData.text.x + distanceX
    edgeData.text.y = +edgeData.text.y + distanceY
  }
  return edgeData
}

export const moveElementsToPoint = (elements, [centerX, centerY]) => {
  let [x1, y1] = [99999, 99999]
  elements.nodes.forEach(({ x, y }) => {
    if (x < x1) x1 = x
    if (y < y1) y1 = y
  })
  const distanceX = centerX - x1
  const distanceY = centerY - y1
  elements.nodes.forEach((node) => {
    translationNodeData(node, distanceX, distanceY)
  })
  elements.edges.forEach((edge) => {
    translationEdgeData(edge, distanceX, distanceY)
  })
  return elements
}

export const isElementInGraph = (element) => {
  let isIn = false
  if (element.className === 'lf-graph') {
    isIn = true
  } else if (element.parentNode) {
    isIn = isElementInGraph(element.parentNode)
  }
  return isIn
}

export const getAndConditionDefault = () => ({
  // 且条件默认数据
  fact_name: '', // 策略因子名称
  fact_key: '', // 策略因子Key
  operator: '', // 操作符  EQ:等于  GEQ:大于等于  GQ:大于  LQ:小于  LEQ:小于等于  CONTAINS:包含  NOT_CONTAINS:不包含
  fact_value: '', // 期望值，此值为object类型，根据data_type不同，该值类型不同
  data_type: '', // 数据类型  100:Integer,200:Long,300:Float,400:Double,500:String,600:List,601:Empty_List,602:List<Integer>,603:List<Long>,604:List<Double>,605:List<String>,700:BOOLEAN,800:Map,1000:NULL,1100:TIME
  fact_type: '', // 类型 1上下文  2特征
})
export const getDefaultCondition = () => ({
  condition_id: '', // 条件id
  condition_logic: 'OR', // 条件逻辑关系 AND并且  OR或者
  next_condition_id: '', // 下一个条件
  fact_logic: 'AND', // 策略因子逻辑关系
  facts: [
    {
      // 且条件默认数据
      fact_name: '', // 策略因子名称
      fact_key: '', // 策略因子Key
      operator: '', // 操作符  EQ:等于  GEQ:大于等于  GQ:大于  LQ:小于  LEQ:小于等于  CONTAINS:包含  NOT_CONTAINS:不包含
      fact_value: '', // 期望值，此值为object类型，根据data_type不同，该值类型不同
      data_type: '', // 数据类型  100:Integer,200:Long,300:Float,400:Double,500:String,600:List,601:Empty_List,602:List<Integer>,603:List<Long>,604:List<Double>,605:List<String>,700:BOOLEAN,800:Map,1000:NULL,1100:TIME
      fact_type: '', // 类型 1上下文  2特征
    },
  ], // 策略因子
})

// 增加系统判断后的虚拟线
export const addFakeFlow = (lf, edgeData = {}) => {
  lf.addEdge({ ...edgeData })
}
// 添加普通分支
export const getDefaultBranchData = (index?: number) => ({
  branch_name: `分支${index + 1}`,
  anchorId: `${createUuid()}_right`,
  is_deny_all: false,
  is_out_of_domain: false,
  conditions: [getDefaultCondition()],
})
// 添加OOD分支
export const getDefaultOodBranchData = () => ({
  branch_name: 'OOD分支',
  anchorId: `${createUuid()}_right`,
  is_deny_all: false,
  is_out_of_domain: true,
  conditions: [],
})
// 触发事件-判断分支节点的默认分支数据
export const triggerJudgeNodeDefaultBranch = () => {
  // TODO: 根据不同的节点类型，返回不同的默认分支数据
  const branches = []
  // 默认创建2个分支
  for (let i = 0; i < 2; i++) {
    branches.push(getDefaultBranchData(i))
  }
  return branches
}
const fakeNodeData = {
  type: 'FakeNodeUserTask',
  x: 0,
  y: 0,
  text: '添加节点',
  properties: {
    nodeType: 'FakeNodeUserTask',
    activated: 'false',
  },
}
// 增加系统判断后的FakeNode节点
export const addNodeXGap = 100
export const addNodeYGap = 140
export const nodeWidth = 190
export const branchNodeXGap = addNodeXGap + nodeWidth
export const branchNodeYGap = addNodeYGap
export const addFakeNode = (lf, curNode) => {
  const { x, y, id } = curNode
  const curNodeModel = lf.getNodeModelById(id)
  // 更新节点属性-分支条件
  const branches = triggerJudgeNodeDefaultBranch() || []
  lf.setProperties(id, {
    ...curNodeModel.properties,
    branches,
  })
  for (let i = 0; i < branches.length; i++) {
    const fakeNode = lf.addNode({
      ...{ ...fakeNodeData },
      x: x + branchNodeXGap,
      y: y + i * branchNodeYGap,
    })
    addFakeFlow(lf, {
      sourceNodeId: curNode.id,
      targetNodeId: fakeNode.id,
      sourceAnchorId: branches[i].anchorId,
    })
  }
}

export const addFakeNodeByBranch = (lf, curNode, branches) => {
  const { x, y } = curNode
  for (let i = 0; i < branches.length; i++) {
    const fakeNode = lf.addNode({
      ...{ ...fakeNodeData },
      x: x + branchNodeXGap,
      y: y + i * branchNodeYGap,
    })
    addFakeFlow(lf, {
      sourceNodeId: curNode.id,
      targetNodeId: fakeNode.id,
      sourceAnchorId: branches[i].anchorId,
    })
  }
}

// 计算新增节点坐标
export const getNextNodePosition = ({ lf, node, y }) => {
  const allNodes = lf.getGraphRawData().nodes
  let hasNode: any = false
  if (y) {
    hasNode = allNodes.filter((item) => item.y === y && item.x > node.x)
  } else {
    y = node.y
    hasNode = allNodes.filter((item) => item.y === y && item.x > node.x)
  }
  if (hasNode.length) {
    y += 90
    return getNextNodePosition({ lf, node, y })
  }
  return {
    x: node.x + 200,
    y,
  }
}
// 获取流程模板中的第一个节点 x坐标最小的节点
export const getFirstNodeInTemplate = (nodes) => {
  let firstNode = nodes[0]
  nodes.forEach((node) => {
    if (node.x < firstNode.x) {
      firstNode = node
    }
  })
  return firstNode
}

export const findMaxNodeY = (nodeList) => {
  let maxY = -999999
  nodeList.forEach((node) => {
    const { y } = node
    if (y > maxY) maxY = y
  })
  return maxY
}
export const createPointsList = (sNode, tNode, isFistNode) => {
  // 判断节点中点到锚点宽度80 82
  // 临时节点锚点到中点宽度80 32
  // 线折点距离上一个点x30
  const { x: sx, y: sy } = sNode
  const { x: tx, y: ty } = tNode
  const firstNode = { x: sx + 82, y: sy }
  const secondNode = { x: sx + 112, y: sy }
  const thirdNode = { x: sx + 112, y: ty }
  const fourNode = { x: tx - 32, y: ty }
  if (isFistNode) {
    return [firstNode, fourNode]
  }
  return [firstNode, secondNode, thirdNode, fourNode]
}

// 处理粘贴节点
export const formatPasteElements = (data) => {
  const selected = { ...data }

  // 刨除开始节点和开始节点连线
  const startNodeId =
    selected.nodes.find((node) => node.type === 'START')?.id || ''
  if (startNodeId) {
    selected.nodes = selected.nodes.filter((node) => node.id !== startNodeId)
    selected.edges = selected.edges.filter(
      (edge) => edge.sourceNodeId !== startNodeId,
    )
  }

  // 重新生成判断节点properties.branches中的anchorId 重置condition_id和next_condition_id
  const nodeBranchAnchorIdMap = {}
  selected.nodes.forEach((item) => {
    if (item?.properties?.branches) {
      item.properties.branches.forEach((branch) => {
        const newAnchorId = `${createUuid()}_right`
        nodeBranchAnchorIdMap[branch.anchorId] = newAnchorId
        branch.anchorId = newAnchorId
        branch.conditions.forEach((orCondition) => {
          orCondition.condition_id = ''
          orCondition.next_condition_id = ''
        })
      })
    }
  })
  // 重新赋值连线的sourceAnchorId
  // 由于LogicFlow的bug导致targetAnchorId没有更新，这里手动置为空
  selected.edges.forEach((item) => {
    item.sourceAnchorId = nodeBranchAnchorIdMap[item.sourceAnchorId]
    item.targetAnchorId = ''
  })

  return selected
}

// 流程校验
export const validateFlow = (data) => {
  const errList = []
  const { nodes, edges } = data
  const nodeMap = nodes.reduce((nMap, node, index) => {
    nMap[node.id] = {
      ...node,
      index,
      id: node.id,
      type: node.type,
      nextNodes: [],
      preNodes: [],
      properties: node.properties,
    }
    return nMap
  }, {})
  edges.forEach((edge) => {
    nodeMap[edge.sourceNodeId].nextNodes.push(edge.targetNodeId)
    nodeMap[edge.targetNodeId].preNodes.push(edge.sourceNodeId)
  })
  for (let i = 0; i < nodes.length; i++) {
    const {
      id,
      properties: { node_name, nodeType },
    } = nodes[i]
    const node = nodeMap[id]
    // 一个节点既没有前一个节点，也没有下一个节点。
    const errorMsg = []
    if (nodeType === 'FakeNodeUserTask') {
      errorMsg.push('虚拟节点不可预上线')
    } else if (!node.nextNodes.length && !node.preNodes.length) {
      errorMsg.push('节点没有和任何节点相连')
    } else if (
      !node.nextNodes.length &&
      !(TypeCategoryEnum[nodeType] === 'LEAF')
    ) {
      errorMsg.push('节点没有下一个节点')
    } else if (!node.preNodes.length && node.type !== 'START') {
      errorMsg.push('节点没有前一个节点')
    } else if (
      node.nextNodes.length > 1 &&
      !['USER_EXPRESSION', 'FEATURE_LIST', 'DIALOG_STATUS'].includes(node.type)
    ) {
      errorMsg.push('节点不能同时存在两个下一个节点')
    } else if (TypeCategoryEnum[nodeType] === 'JUDGE') {
      const branches = node.properties?.branches || []
      if (!branches.length) {
        errorMsg.push(`${nodeTitleMap[nodeType]}节点没有分支`)
      } else {
        const targetEdges = edges.filter((edge) => edge.sourceNodeId === id)
        branches.forEach((branch, index) => {
          if (!branch.branch_name) {
            errorMsg.push(`${nodeTitleMap[nodeType]}节点分支名称不能为空`)
          }
          const { conditions, is_out_of_domain, anchorId, is_deny_all } = branch
          // 分支有没有连线
          const branchAsSourceEdge = []
          targetEdges.forEach((edge) => {
            if (edge.sourceAnchorId === anchorId) {
              branchAsSourceEdge.push(edge)
            }
          })
          if (!branchAsSourceEdge.length) {
            errorMsg.push(
              `${nodeTitleMap[nodeType]}节点分支${index + 1}没有连线`,
            )
          }
          if (branchAsSourceEdge.length > 1) {
            errorMsg.push(
              `${nodeTitleMap[nodeType]}节点分支${index + 1}不能同时存在两个下一个节点`,
            )
          }
          // ood分支和默认分支不需要校验条件
          if (!is_out_of_domain && !is_deny_all) {
            if (!conditions.length) {
              errorMsg.push(`${nodeTitleMap[nodeType]}节点分支没有条件`)
            } else {
              conditions.forEach((condition) => {
                if (!condition.facts.length) {
                  errorMsg.push(`${nodeTitleMap[nodeType]}节点分支没有策略因子`)
                } else {
                  condition.facts.forEach((fact) => {
                    if (
                      !fact.fact_key ||
                      !fact.operator ||
                      fact.fact_value === undefined ||
                      fact.fact_value === null ||
                      fact.fact_value === '' ||
                      (Array.isArray(fact.fact_value) &&
                        fact.fact_value.length === 0) ||
                      !fact.data_type
                    ) {
                      errorMsg.push(
                        `${nodeTitleMap[nodeType]}节点分支有未完成的策略因子配置`,
                      )
                    }
                  })
                }
              })
            }
          }
        })
      }
    }
    // Validate leaf node properties requirement
    else if (TypeCategoryEnum[nodeType] === 'LEAF') {
      const { properties } = nodes[i]
      if (!properties.response_list || !properties.response_list.length) {
        errorMsg.push(`${nodeTitleMap[nodeType]}节点未配置内容`)
      } else {
        const configInfo = properties.response_list[0]?.config_info
        if (!configInfo || JSON.stringify(configInfo) === '{}') {
          errorMsg.push(`${nodeTitleMap[nodeType]}节点响应内容不完整`)
        } else {
          switch (node.type) {
            case 'TEXT_RESPONSE':
              if (
                !configInfo.robot_reply_info?.script ||
                configInfo.robot_reply_info?.script === '<p><br></p>'
              ) {
                errorMsg.push(
                  `${nodeTitleMap[nodeType]}节点固定话术配置不能为空`,
                )
              }
              break
            case 'SOP_SOLUTION_RESPONSE': {
              if (!configInfo.flow_info?.flow_id) {
                errorMsg.push(`${nodeTitleMap[nodeType]}节点未选择解决方案`)
              }
              if (
                !configInfo.default_answer?.answer_text ||
                configInfo.default_answer?.answer_text === '<p><br></p>'
              ) {
                errorMsg.push(
                  `${nodeTitleMap[nodeType]}节点兜底话术配置不能为空`,
                )
              }
              break
            }
            case 'LLM_RESPONSE': {
              const { model_config = {} } = configInfo
              if (!model_config.model_key) {
                errorMsg.push(`${nodeTitleMap[nodeType]}节点未选择模型`)
              }
              const promptValid =
                model_config.prompt &&
                (model_config.prompt.role ||
                  model_config.prompt.goal ||
                  model_config.prompt.work_flow ||
                  model_config.prompt.few_shot)
              if (!promptValid) {
                errorMsg.push(
                  `${nodeTitleMap[nodeType]}节点未配置模型任务提示词`,
                )
              }
              if (
                !configInfo.default_answer ||
                !configInfo.default_answer.answer_text ||
                configInfo.default_answer.answer_text === '<p><br></p>'
              ) {
                errorMsg.push(`${nodeTitleMap[nodeType]}节点未配置兜底话术`)
              }
              break
            }
            case 'CALL_RESPONSE': {
              if (!configInfo.next_module) {
                errorMsg.push(`${nodeTitleMap[nodeType]}节点未选择调用模块`)
              }
              break
            }
            case 'RAG_RESPONSE':
              {
                if (!configInfo.kb_name) {
                  errorMsg.push(`${nodeTitleMap[nodeType]}节点未选择知识库`)
                }
                if (configInfo.choose_version === 1 && !configInfo.kb_version) {
                  errorMsg.push(`${nodeTitleMap[nodeType]}节点未选择知识库版本`)
                }
                // 知识库为表格类型时
                if (
                  configInfo.dataset_type &&
                  configInfo.dataset_type === 'structured'
                ) {
                  if (
                    configInfo.custom_query_param &&
                    configInfo.custom_query_param.length > 0
                  ) {
                    configInfo.custom_query_param.forEach((item, index) => {
                      if (!item.target_field) {
                        errorMsg.push(
                          `${nodeTitleMap[nodeType]}节点检索条件${index + 1}未配置检索参数`,
                        )
                      }
                      if (item.field_load_type == null) {
                        errorMsg.push(
                          `${nodeTitleMap[nodeType]}节点检索条件${index + 1}未配置检索来源`,
                        )
                      }
                      if (!item.query_type) {
                        errorMsg.push(
                          `${nodeTitleMap[nodeType]}节点检索条件${index + 1}未配置检索操作符`,
                        )
                      }
                    })
                  }
                  // else {
                  //   errorMsg.push(`${nodeTitleMap[nodeType]}节点未配置检索条件`);
                  // }
                }
                if (configInfo.score == null) {
                  errorMsg.push(
                    `${nodeTitleMap[nodeType]}节点未配置检索采纳得分`,
                  )
                }
                const { model_config = {} } = configInfo
                if (!model_config.model_key) {
                  errorMsg.push(
                    `${nodeTitleMap[nodeType]}节点LLM应答配置未选择模型`,
                  )
                }
                const promptValid =
                  model_config.prompt &&
                  (model_config.prompt.role ||
                    model_config.prompt.goal ||
                    model_config.prompt.work_flow ||
                    model_config.prompt.few_shot)
                if (!promptValid) {
                  errorMsg.push(
                    `${nodeTitleMap[nodeType]}节点LLM应答配置未配置模型任务提示词`,
                  )
                }
                const { enhance_model_config = {}, enable_query_enhance } =
                  configInfo
                if (enable_query_enhance) {
                  if (!enhance_model_config.model_key) {
                    errorMsg.push(
                      `${nodeTitleMap[nodeType]}节点查询改写配置未选择模型`,
                    )
                  }
                  const promptEnhanceValid =
                    enhance_model_config.prompt &&
                    (enhance_model_config.prompt.role ||
                      enhance_model_config.prompt.goal ||
                      enhance_model_config.prompt.work_flow ||
                      enhance_model_config.prompt.few_shot)
                  if (!promptEnhanceValid) {
                    errorMsg.push(
                      `${nodeTitleMap[nodeType]}节点查询改写配置未配置模型任务提示词`,
                    )
                  }
                }
                if (
                  !configInfo.default_answer ||
                  !configInfo.default_answer.answer_text ||
                  configInfo.default_answer.answer_text === '<p><br></p>'
                ) {
                  errorMsg.push(`${nodeTitleMap[nodeType]}节点未配置兜底话术`)
                }
              }
              break
          }
        }
      }
    }
    if (errorMsg.length) {
      errList.push({
        nodeKey: id,
        nodeName: node_name,
        nodeType,
        errMsgList: errorMsg,
      })
    }
  }
  return errList
}

// 计算判断节点高度节点高度
export const getJudgeNodeHeight = (branchLength) => {
  const branchHeight = 22
  const branchMarginBottom = 8
  const titleHeight = 20
  const titleMarginTop = 10
  const titleMarginBottom = 8
  const nodeBorderHeight = 2
  const height =
    titleMarginTop +
    titleHeight +
    titleMarginBottom +
    nodeBorderHeight +
    branchLength * (branchHeight + branchMarginBottom)
  return height
}
