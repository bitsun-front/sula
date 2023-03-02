import React from 'react';
import { Radio } from 'antd';
import { RadioGroupProps as ARadioGroupProps, RadioProps } from 'antd/lib/radio';

const RadioGroup = Radio.Group;

type RadioItemProps = {
  text: string;
} & RadioProps;

export interface RadioGroupProps extends ARadioGroupProps {
  source: RadioItemProps[];
}

export default class SulaRadioGroup extends React.Component<RadioGroupProps> {
  getValue = (props) => {
    const { source = [], value } = props;
    const getItem = (key) => source.find(item => item.value == key);
    const getShowText = (key) => getItem(key)?.text || getItem(key)?.label || key;
    return Array.isArray(value) ? value.map(itemValue => getShowText(itemValue)).join(',') : getShowText(value);
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
        {this.getValue(this.props)}
      </span> : (
        <RadioGroup {...restProps}>
          {source.map((item: RadioItemProps) => {
            const { text, label, value, ...restProps } = item;
            return <Radio value={value} key={value} {...restProps}>{text || label}</Radio>;
          })}
        </RadioGroup>
      );
  }
}
