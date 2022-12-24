import React from 'react';
import { Checkbox } from 'antd';

const CheckboxGroup = Checkbox.Group;

export default class SulaCheckboxGroup extends React.Component {
  getValue = (props) => {
    const { source = [], value } = props;
    return Array.isArray(value) ?
      value.map(itemValue => source.find(item => item.value === itemValue)?.text || itemValue)
        .join(',')
      :
      source.find(item => item.value === value)?.text || value;
  }

  render() {
    const { source = [], ctx, viewPageEdit=false,  ...restProps } = this.props;
    return ctx?.mode === 'view' && !viewPageEdit ?
      <span
        style={{
          fontSize: '14px',
          color: '#000000',
          fontFamily: 'PingFangSC'
        }}
      >
        {this.getValue(this.props)}
      </span> : (
      <CheckboxGroup
        {...restProps}
        options={source.map((item) => {
          return {
            ...item,
            label: item.text,
          };
        })}
      />
    );
  }
}
