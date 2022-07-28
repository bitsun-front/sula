import React from 'react';
import { TreeSelect as ATreeSelect } from 'antd';
import { TreeSelectProps as ATreeSelectProps } from 'antd/lib/tree-select';
import { AntTreeNodeProps } from 'antd/lib/tree';
import { judgeIsEmpty } from './fieldUtils';

export type TreeNodeSourceItem = {
  text: any;
  value: any;
  children?: TreeNodeSourceItem[];
} & AntTreeNodeProps;

export interface TreeSelectProps extends Omit<ATreeSelectProps<any>, 'treeData' | 'children'> {
  source: TreeNodeSourceItem[];
}

export default class TreeSelect extends React.Component<TreeSelectProps> {
  renderTreeNode = (item: TreeNodeSourceItem) => {
    const { children, text, value, ...otherProps } = item;
    if (children) {
      return (
        <ATreeSelect.TreeNode key={value} {...otherProps} title={text} value={value}>
          {children.map((it) => {
            return this.renderTreeNode(it);
          })}
        </ATreeSelect.TreeNode>
      );
    }
    return (
      <ATreeSelect.TreeNode key={value} {...otherProps} title={text} value={value} />
    );
  };

  getSelectValueLabel = () => {
    const { value, source } = this.props;
    if (judgeIsEmpty(value)) return value;

    let valueLabel;
    if (Array.isArray(value)) {
      valueLabel = value.map(item => this.getItemLabel(source, item)).join(',')
    } else {
      valueLabel = this.getItemLabel(source, value);
    }

    return valueLabel;
  }

  getItemLabel = (source, itemValue) => {
    let itemLabel = itemValue;

    const loop = (source, itemValue) => {
      source.forEach(item => {
        if (item.value === itemValue) {
          itemLabel = item.text;
          return;
        }
        if (item.children) {
          loop(item.children, itemValue)
        }
      })
    }
    
    loop(source, itemValue);
    return itemLabel;
  }

  render() {
    const { ctx, viewPageEdit=false, source = [], ...restProps } = this.props;
    return ctx?.mode === 'view' && !viewPageEdit ? 
      <span
        style={{
          fontSize: '14px',
          color: '#000000',
          fontFamily: 'PingFangSC'
        }}
      >
        {this.getSelectValueLabel()}
      </span> : (
        <ATreeSelect {...restProps}>
          {source.map((item) => {
            return this.renderTreeNode(item);
          })}
        </ATreeSelect>
      );
  }
}
