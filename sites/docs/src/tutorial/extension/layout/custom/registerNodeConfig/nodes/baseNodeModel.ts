import { RectNodeModel } from '@logicflow/core';

const getJudgeNodeHeight = (branchLength: number) => {
  const branchHeight = 22;
  const branchMarginBottom = 8;
  const titleHeight = 20;
  const titleMarginTop = 10;
  const titleMarginBottom = 8;
  const nodeBorderHeight = 2;
  const footerHeight = 24;
  const height =
    titleMarginTop +
    titleHeight +
    titleMarginBottom +
    nodeBorderHeight +
    branchLength * (branchHeight + branchMarginBottom) +
    footerHeight;
  return height;
};

// 节点model自定义-基础节点，其他集成基础节点，触发事件节点可以直接使用此节点
export class BaseNodeModel extends RectNodeModel {
  setAttributes() {
    this.width = 190;
    if (
      this.properties &&
      this.properties.branches &&
      Array.isArray(this.properties.branches)
    ) {
      const { branches = [] } = this.properties as {
        branches?: { anchorId: string }[];
      };
      let newHeight = getJudgeNodeHeight(branches.length);
      newHeight = newHeight > 100 ? newHeight : 100;
      this.height = newHeight;
    } else {
      this.height = 100;
    }
  }
  getOutlineStyle() {
    const style: any = super.getOutlineStyle();
    style.stroke = 'none';
    style.hover.stroke = 'none';
    return style;
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    const { id, x, y, width } = this;
    // 左侧锚点
    const leftAnchor = {
      x: x - width / 2,
      y,
      id: `${id}_1_left`,
    };
    // 右侧锚点
    const rightAnchor = {
      x: x + width / 2,
      y,
      id: `${id}_1_right`,
    };
    return [leftAnchor, rightAnchor];
  }
}
