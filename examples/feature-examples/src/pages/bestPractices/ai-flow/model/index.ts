import { register } from '@logicflow/react-node-registry'
import { BezierEdge } from '@logicflow/core'
import {
  StartNodeModel,
  ResponseNodeModel,
  JudgeNodeModel,
  SequenceFlowModel,
  virtualNodeModel,
} from './nodeModel'
import virtualNode from '../node/virtualNode'
import customFlowNode from '../node/customFlowNode'
import CustomNodeView from './nodeView'

class SequenceFlowNodeView extends BezierEdge {}

export default function registerNode(lfInstance: any) {
  register(
    {
      type: 'START',
      component: customFlowNode,
      model: StartNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'USER_EXPRESSION',
      component: customFlowNode,
      model: JudgeNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'FEATURE_LIST',
      component: customFlowNode,
      model: JudgeNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'DIALOG_STATUS',
      component: customFlowNode,
      model: JudgeNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'TEXT_RESPONSE',
      component: customFlowNode,
      model: ResponseNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'SOP_SOLUTION_RESPONSE',
      component: customFlowNode,
      model: ResponseNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'LLM_RESPONSE',
      component: customFlowNode,
      model: ResponseNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'RAG_RESPONSE',
      component: customFlowNode,
      model: ResponseNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )
  register(
    {
      type: 'FakeNodeUserTask',
      component: virtualNode,
      model: virtualNodeModel,
    },
    lfInstance,
  )
  register(
    {
      type: 'CALL_RESPONSE',
      component: customFlowNode,
      model: ResponseNodeModel,
      view: CustomNodeView,
    },
    lfInstance,
  )

  lfInstance.register({
    type: 'SequenceFlow',
    model: SequenceFlowModel,
    view: SequenceFlowNodeView,
  })
}
