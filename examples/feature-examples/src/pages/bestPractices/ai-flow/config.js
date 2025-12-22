import { createUuid } from '@logicflow/core'

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

export const nodeIconMap = {
  START:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/START.png',
  USER_EXPRESSION:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/USER_EXPRESSION.png',
  FEATURE_LIST:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/FEATURE_LIST.png',
  TEXT_RESPONSE:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/TEXT_RESPONSE.png',
  SOP_SOLUTION_RESPONSE:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/SOP_SOLUTION_RESPONSE.png',
  LLM_RESPONSE:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/LLM_RESPONSE.png',
  RAG_RESPONSE:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/RAG_RESPONSE.png',
  SequenceFlow:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/sop/node-edge.png',
  FakeNodeUserTask:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/sop/node-fake.png',
  CALL_RESPONSE:
    'https://s3-gzpu-inter.didistatic.com/tiyan-base-store/gaia/strategy/SOP_SOLUTION_RESPONSE.png',
}

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

export const getDefaultBranchData = (index) => ({
  branch_name: `分支${index + 1}`,
  anchorId: `${createUuid()}_right`,
  is_deny_all: false,
  is_out_of_domain: false,
  conditions: [getDefaultCondition()],
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

export const patternItems = [
  {
    type: 'START',
    label: '开始',
    icon: nodeIconMap.START,
    properties: {
      nodeType: 'START',
      node_name: '开始',
    },
  },
  {
    type: 'USER_EXPRESSION',
    label: '用户表达',
    icon: nodeIconMap.USER_EXPRESSION,
    properties: {
      nodeType: 'USER_EXPRESSION',
      node_name: '用户表达',
      activated: 'false',
      branches: triggerJudgeNodeDefaultBranch(),
    },
  },
  {
    type: 'FEATURE_LIST',
    label: '特征集合',
    icon: nodeIconMap.FEATURE_LIST,
    properties: {
      nodeType: 'FEATURE_LIST',
      node_name: '特征集合',
      activated: 'false',
      branches: triggerJudgeNodeDefaultBranch(),
    },
  },
  {
    type: 'TEXT_RESPONSE',
    label: '固定话术',
    icon: nodeIconMap.TEXT_RESPONSE,
    properties: {
      response_list: [
        {
          response_id: '', // 服务端生成id
          response_type: 1, // 应答类型 1:固定话术, 2:解决方案, 3:大模型, 4:RAG应答
          config_info: {},
        },
      ],
      nodeType: 'TEXT_RESPONSE',
      node_name: '固定话术',
      activated: 'false',
    },
  },
  {
    type: 'SOP_SOLUTION_RESPONSE',
    label: '解决方案',
    icon: nodeIconMap.SOP_SOLUTION_RESPONSE,
    properties: {
      response_list: [
        {
          response_id: '',
          response_type: 2,
          config_info: {},
        },
      ],
      nodeType: 'SOP_SOLUTION_RESPONSE',
      node_name: '解决方案',
      activated: 'false',
    },
  },
  {
    type: 'LLM_RESPONSE',
    label: '大模型',
    icon: nodeIconMap.LLM_RESPONSE,
    properties: {
      response_list: [
        {
          response_id: '',
          response_type: 3,
          config_info: {},
        },
      ],
      nodeType: 'LLM_RESPONSE',
      node_name: '大模型',
      activated: 'false',
    },
  },
  {
    type: 'RAG_RESPONSE',
    label: 'RAG应答',
    icon: nodeIconMap.RAG_RESPONSE,
    properties: {
      response_list: [
        {
          response_id: '',
          response_type: 4,
          config_info: {},
        },
      ],
      nodeType: 'RAG_RESPONSE',
      node_name: 'RAG应答',
      activated: 'false',
      disabled: false,
    },
  },
  {
    type: 'CALL_RESPONSE',
    label: '模块调用应答',
    icon: nodeIconMap.CALL_RESPONSE,
    properties: {
      response_list: [
        {
          response_id: '',
          response_type: 5,
          config_info: {},
        },
      ],
      nodeType: 'CALL_RESPONSE',
      node_name: '模块调用应答',
      activated: 'false',
    },
  },
]

export const INodeCustomEvent = {
  PreviewComponent: 'custom:previewComponent-click',
  Rename: 'custom:rename-click',
  CopyId: 'custom:copyId-click',
  CopyNode: 'custom:copyNode-click',
  DeleteNode: 'custom:deleteNode-click',
  AnchorAddNode: 'custom::anchor-addNode',
}

export const EditDisableElementList = [
  'START',
  'FakeNodeUserTask',
  'SequenceFlow',
]

// 节点icon的背景色
const BlueBackgroundColor = '#2064F3'
const OrangeBackgroundColor = '#F9A11D'
export const IconBackgroundColor = {
  START: BlueBackgroundColor,
  USER_EXPRESSION: OrangeBackgroundColor,
  FEATURE_LIST: OrangeBackgroundColor,
  TEXT_RESPONSE: BlueBackgroundColor,
  SOP_SOLUTION_RESPONSE: BlueBackgroundColor,
  LLM_RESPONSE: BlueBackgroundColor,
  RAG_RESPONSE: BlueBackgroundColor,
  CALL_RESPONSE: BlueBackgroundColor,
}

// 节点的背景色
const BlueLightBackground =
  'linear-gradient(180deg, rgba(32, 100, 243, 0.12) 0%, rgba(255, 255, 255, 0) 50%)'
const OrangeLightBackground =
  'linear-gradient(180deg, rgba(249, 161, 29, 0.15) 0%, rgba(255, 255, 255, 0) 57%)'
export const NodeBackground = {
  START: BlueLightBackground,
  USER_EXPRESSION: OrangeLightBackground,
  FEATURE_LIST: OrangeLightBackground,
  DIALOG_STATUS: OrangeLightBackground,
  TEXT_RESPONSE: BlueLightBackground,
  SOP_SOLUTION_RESPONSE: BlueLightBackground,
  LLM_RESPONSE: BlueLightBackground,
  RAG_RESPONSE: BlueLightBackground,
  CALL_RESPONSE: BlueLightBackground,
}

export const Elements = {
  START: 'START',
  USER_EXPRESSION: 'USER_EXPRESSION',
  FEATURE_LIST: 'FEATURE_LIST',
  DIALOG_STATUS: 'DIALOG_STATUS',
  TEXT_RESPONSE: 'TEXT_RESPONSE',
  SOP_SOLUTION_RESPONSE: 'SOP_SOLUTION_RESPONSE',
  LLM_RESPONSE: 'LLM_RESPONSE',
  RAG_RESPONSE: 'RAG_RESPONSE',
  FakeNodeUserTask: 'FakeNodeUserTask',
  FLOW: 'SequenceFlow',
  CALL_RESPONSE: 'CALL_RESPONSE',
}

export const nodeTipMap = {
  START: '开始节点',
  USER_EXPRESSION: '用户表达的意图识别，用于匹配对应的应答能力。',
  FEATURE_LIST: '当前对话的特征集合，用于识别对话中用户特征。',
  DIALOG_STATUS: '当前对话的状态，用于识别对话中各类状态。',
  TEXT_RESPONSE: '给出固定文案，进行回复。',
  SOP_SOLUTION_RESPONSE: '给出标准的SOP流程。',
  LLM_RESPONSE: '调用大语言模型,使用变量和提示词生成回复。',
  RAG_RESPONSE:
    '在选定的知识中,根据输入变量召回最匹配的信息,并以列表形式返回。',
  SequenceFlow: '分支编辑',
  FakeNodeUserTask: '虚拟节点',
  CALL_RESPONSE: '模块调用应答',
}

export const nodeTitleMap = {
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

export const ResponseNodeList = [
  'TEXT_RESPONSE',
  'SOP_SOLUTION_RESPONSE',
  'LLM_RESPONSE',
  'RAG_RESPONSE',
  'CALL_RESPONSE',
]
export const BranchNodeList = [
  'USER_EXPRESSION',
  'FEATURE_LIST',
  'DIALOG_STATUS',
]
// 获取判断节点
export const getJudgeNodeList = () =>
  patternItems.filter((item) => BranchNodeList.includes(item.type))
// 获取叶子节点
export const getLeafNodeList = () =>
  patternItems.filter((item) => ResponseNodeList.includes(item.type))
