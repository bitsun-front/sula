import React from 'react';
import { Select as ASelect } from 'antd';
import { SelectProps as ASelectProps, OptionProps } from 'antd/lib/select';
import { judgeIsEmpty } from './fieldUtils';

export type SelectSourceItem = {
  text: any;
} & Omit<OptionProps, 'children'>;

export interface SelectGroupItem {
  text: any;
  children: SelectSourceItem[];
}

export interface SelectProps extends ASelectProps<any> {
  source: Array<SelectSourceItem | SelectGroupItem>;
}

export default class Select extends React.Component<SelectProps> {
  renderOption = (item: SelectSourceItem) => {
    const { text, label, value, ...restProps } = item;
    return (
      <ASelect.Option value={value} key={value} {...restProps}>
        {text || label}
      </ASelect.Option>
    );
  };

  renderGroupOptions = (group: SelectGroupItem) => {
    return (
      <ASelect.OptGroup key={group.text} label={group.text}>
        {(group.children as SelectSourceItem[]).map((item) => {
          return this.renderOption(item);
        })}
      </ASelect.OptGroup>
    );
  };

  getFinalValueLabel = (props) => {
    const { source = [], options = [], value } = props;
    const handleSource = source?.length && source || options;
    let newSource: any[] = [];
    handleSource.map(item => {
      if ((item as SelectGroupItem).children) {
        newSource.push([...item.children])
      } else {
        newSource.push(item);
      }
    })
    const getItem = (key) => newSource.find(item => item.value == key);
    const getShowText = (key) => getItem(key)?.text || getItem(key)?.label || key;
    return Array.isArray(value) ? value.map(itemValue => getShowText(itemValue)).join(',') : getShowText(value);
  }

  render() {
    const { source = [], options = [], ctx, viewPageEdit=false, ...restProps } = this.props;
    const handleSource = source?.length && source || options;
    return ctx?.mode === 'view' && !viewPageEdit ?
      <span
        style={{
          fontSize: '14px',
          color: '#000000',
          fontFamily: 'PingFangSC'
        }}
      >
        {this.getFinalValueLabel(this.props)}
      </span> : (
      <ASelect {...restProps} >
        {handleSource.map((item) => {
          if ((item as SelectGroupItem).children) {
            return this.renderGroupOptions(item as SelectGroupItem);
          }
          return this.renderOption(item as SelectSourceItem);
        })}
      </ASelect>
    );
  }
}
