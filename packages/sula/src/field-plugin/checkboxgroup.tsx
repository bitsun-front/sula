import React from 'react';
import { Checkbox } from 'antd';

const CheckboxGroup = Checkbox.Group;

export default class SulaCheckboxGroup extends React.Component {
  getValue = (props) => {
    const { source = [], options = [], value } = props;
    const handleSource = source?.length && source || options;
    const getItem = (key) => handleSource.find(item => item.value == key);
    const getShowText = (key) => getItem(key)?.text || getItem(key)?.label || key;
    return Array.isArray(value) ? value.map(itemValue => getShowText(itemValue)).join(',') : getShowText(value);
  }

  render() {
    const { source = [], options = [], ctx, viewPageEdit=false,  ...restProps } = this.props;
    const handleSource = source?.length && source || options;
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
        options={handleSource.map((item) => {
          return {
            ...item,
            label: item.text || item.label,
          };
        })}
      />
    );
  }
}
