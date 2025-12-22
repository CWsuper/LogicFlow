/* eslint-disable class-methods-use-this */
import { RectNodeModel, BezierEdgeModel } from '@logicflow/core'
import { getJudgeNodeHeight } from '../util'
import { nodeTitleMap, TypeCategoryEnum } from '../config'

// 节点model自定义-基础节点，其他集成基础节点，触发事件节点可以直接使用此节点
export class NodeBaseModel extends RectNodeModel {
  setAttributes() {
    this.width = 190
    if (
      this.properties &&
      this.properties.branches &&
      Array.isArray(this.properties.branches)
    ) {
      let newHeight = getJudgeNodeHeight(this.properties.branches.length)
      newHeight = newHeight > 100 ? newHeight : 100
      this.height = newHeight
      this.y += (newHeight - this.height) / 2
    } else {
      this.height = 100
    }
  }
  getOutlineStyle() {
    const style = super.getOutlineStyle()
    style.stroke = 'none'
    style.hover.stroke = 'none'
    return style
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    const { id, x, y, height, width, properties } = this
    // 左侧锚点
    const leftAnchor = {
      x: x - width / 2,
      y,
      id: `${id}_1_left`,
    }
    const rightAnchors = []
    const { branches = [] } = properties as {
      branches?: { anchorId: string }[]
    }
    if (branches.length > 0) {
      branches.forEach((item, index) => {
        rightAnchors.push({
          x: x + width / 2,
          y: y - height / 2 + 20 + 10 + 8 + 1 + 11 + 30 * index,
          id: item.anchorId,
        })
      })
    }
    return [leftAnchor, ...rightAnchors]
  }
}

export class StartNodeModel extends NodeBaseModel {
  setAttributes() {
    this.width = 190
    this.height = 44
  }
  // 连线规则-作为起点-都不允许连线
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    const onlyUniqueSource = {
      message: `${nodeTitleMap[this.type]}节点只能与一个节点相连`,
      validate: () => {
        const { edges } = this.outgoing
        return !(edges && edges.length > 0)
      },
    }
    rules.push(onlyUniqueSource)
    return rules
  }
  // 连线规则-作为终点-都不允许连线
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    const notAsTarget = {
      message: `${nodeTitleMap[this.type]}不能连入`,
      validate: () => false,
    }
    rules.push(notAsTarget)
    return rules
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    const { id, x, y, width } = this
    // 右侧锚点
    const rightAnchor = {
      x: x + width / 2,
      y,
      id: `${id}_1_right`,
    }
    return [rightAnchor]
  }
}
// 触发事件节点
export class JudgeNodeModel extends NodeBaseModel {
  // 连线规则-作为起点-都不允许连线
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    // 分支条件节点只能连出
    const leftAnchorNotAsSource = {
      message: `${nodeTitleMap[this.type]}节点只能在分支条件连出`,
      validate: (sourceNode, targetNode, sourceAnchor) =>
        sourceAnchor.id.includes('right'),
    }
    rules.push(leftAnchorNotAsSource)
    // 分支条件节点只能连出一个连线
    const onlyUniqueSource = {
      message: `${nodeTitleMap[this.type]}节点每个分支只能与一个节点相连`,
      validate: (sourceNode, targetNode, sourceAnchor) => {
        const { edges } = this.outgoing
        const isHaveBranchEdge =
          edges &&
          edges.length > 0 &&
          edges.some((edge) => {
            const { sourceAnchorId } = edge
            return sourceAnchorId === sourceAnchor.id
          })
        return !isHaveBranchEdge
      },
    }
    rules.push(onlyUniqueSource)
    // ood分支只能连接应答服务节点(叶子节点)
    const onlySolutionNode = {
      message: `${nodeTitleMap[this.type]}节点 ood 分支只能连接应答服务节点`,
      validate: (sourceNode, targetNode, sourceAnchor) => {
        const { properties = {} } = sourceNode
        const { branches = [] } = properties as {
          branches?: { anchorId: string; is_out_of_domain: boolean }[]
        }
        // 判断当前锚点是否是ood分支
        const currentBranch = branches.find(
          (branch) => branch.anchorId === sourceAnchor.id,
        )
        const isOodBranch = currentBranch?.is_out_of_domain
        if (isOodBranch) {
          // 只允许连线到应答服务节点
          const isLeafNode = TypeCategoryEnum[targetNode.type] === 'LEAF'
          return isLeafNode
        }
        return true
      },
    }
    rules.push(onlySolutionNode)
    return rules
  }
  // 连线规则-作为终点-不允许开始节点连入
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    const rightAnchorNotAsTarget = {
      message: `${nodeTitleMap[this.type]}节点分支条件不能连入`,
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) =>
        !targetAnchor.id.includes('right'),
    }
    rules.push(rightAnchorNotAsTarget)
    return rules
  }
}

// 应答服务，对应后端模型里的叶子节点，也是流程图里的结束节点
export class ResponseNodeModel extends NodeBaseModel {
  setAttributes() {
    this.width = 190
    this.height = 100
  }
  // 连线规则-作为起点-都不允许连线
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    const leafOnlyAsTarget = {
      message: `${nodeTitleMap[this.type]}节点不能作为连线起点`,
      validate: () => false,
    }
    rules.push(leafOnlyAsTarget)
    return rules
  }
  // 连线规则-作为终点-不允许开始节点连入
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    const notAsStartTarget = {
      message: `${nodeTitleMap.START}不能连接${nodeTitleMap[this.type]}节点`,
      validate: (sourceNode) => sourceNode.type !== 'START',
    }
    rules.push(notAsStartTarget)
    return rules
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    const { id, x, y, width } = this
    // 左侧锚点
    const leftAnchor = {
      x: x - width / 2,
      y,
      id: `${id}_1_left`,
    }
    return [leftAnchor]
  }
}

export class virtualNodeModel extends NodeBaseModel {
  getAnchorStyle() {
    return { visibility: 'hidden' }
  }
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    const geteWayOnlyAsTarget = {
      message: '该节点不能连线',
      validate: () => false,
    }
    rules.push(geteWayOnlyAsTarget)
    return rules
  }
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    const notAsTarget = {
      message: '该节点不能连线',
      validate: () => false,
    }
    rules.push(notAsTarget)
    return rules
  }
  setAttributes() {
    this.width = 64
    this.height = 49
  }
}
// 连线model自定义
export class SequenceFlowModel extends BezierEdgeModel {
  setAttributes() {
    this.properties = {
      nodeType: 'SequenceFlow',
      ...(this.properties ?? {}),
    }
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle()
    style.stroke = '#2961EF'
    style.strokeWidth = 1
    const { isHovered, isSelected } = this
    if (isSelected || isHovered) {
      style.strokeWidth = 2
    }
    if (isSelected) {
      style.stroke = 'blue'
    }
    return style
  }
  getOutlineStyle() {
    const style = super.getOutlineStyle()
    style.stroke = 'none'
    style.hover.stroke = 'none'
    return style
  }
}
