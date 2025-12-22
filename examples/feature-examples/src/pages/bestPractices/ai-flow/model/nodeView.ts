/* eslint-disable class-methods-use-this */
import { h } from '@logicflow/core'
import { ReactNodeView } from '@logicflow/react-node-registry'

export default class CustomNodeView extends ReactNodeView {
  // 自定义 anchor 的形状：鼠标 hover 上之后显示加号，并显示
  getAnchorShape(anchorData: any) {
    const { x, y } = anchorData
    // 如果是右边的锚点，支持展示新增连线快捷锚点
    if (anchorData.id.includes('right')) {
      return h('g', {}, [
        h('circle', {
          cx: x,
          cy: y,
          r: 5,
          stroke: '#fff',
          fill: '#2961EF',
          transformOrigin: `${x} ${y}`,
          className: 'lf-basic-shape lf-node-anchor',
        }),
        h('circle', {
          cx: x,
          cy: y,
          r: 10,
          stroke: '#2961EF',
          fill: '#2961EF',
          transformOrigin: `${x} ${y}`,
          className: 'lf-quick-anchor lf-node-anchor-hover',
        }),
        h('line', {
          x1: x - 5,
          y1: y,
          x2: x + 5,
          y2: y,
          stroke: '#fff',
          transformOrigin: `${x} ${y}`,
          className: 'lf-quick-anchor lf-node-anchor-hover',
        }),
        h('line', {
          x1: x,
          y1: y - 5,
          x2: x,
          y2: y + 5,
          stroke: '#fff',
          transformOrigin: `${x} ${y}`,
          className: 'lf-quick-anchor lf-node-anchor-hover',
        }),
      ])
    }
    return h('circle', {
      cx: x,
      cy: y,
      r: 5,
      stroke: '#fff',
      fill: '#2961EF',
      transformOrigin: `${x} ${y}`,
      className: 'lf-basic-shape lf-node-anchor',
    })
  }
}
