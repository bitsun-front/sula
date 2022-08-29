import React from 'react';
import { Cascader as ACascader } from 'antd';
import { CascaderProps as ACascaderProps } from 'antd/lib/cascader';

export type CascaderSourceItem = {
  text: any;
  value: any;
};

export interface CascaderSource {
  text: any;
  value: any;
  children: CascaderSourceItem[];
}

export interface CascaderProps extends ACascaderProps {
  source: CascaderSource[];
}

export default class Cascader extends React.Component<CascaderProps> {
  static defaultProps = {
    fieldNames: {
      label: 'text',
    },
  };

  getValueLabel = () => {
    const { value, source } = this.props;
    return Array.isArray(value) ? value.map(item => this.getItemLabel(source, item)).join('/') : value;
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
        {this.getValueLabel()}
      </span> : <ACascader options={source} {...restProps} />;
  }
}
