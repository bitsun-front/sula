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
    const { text, value, ...restProps } = item;
    return (
      <ASelect.Option value={value} key={value} {...restProps}>
        {text}
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
    const { source = [], value } = props;
    let newSource: any[] = [];
    source.map(item => {
      if ((item as SelectGroupItem).children) {
        newSource.push([...item.children])
      } else {
        newSource.push(item);
      }
    })
    return Array.isArray(value) ? 
    value.map(itemValue => newSource.find(item => item.value === itemValue)?.text || itemValue)
    .join(',')
     :
    newSource.find(item => item.value === value)?.text || value;
  }

  render() {
    const { source = [], ctx, viewPageEdit=false, ...restProps } = this.props;
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
        {source.map((item) => {
          if ((item as SelectGroupItem).children) {
            return this.renderGroupOptions(item as SelectGroupItem);
          }
          return this.renderOption(item as SelectSourceItem);
        })}
      </ASelect>
    );
  }
}
