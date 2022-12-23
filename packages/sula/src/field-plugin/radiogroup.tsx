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
    return Array.isArray(value) ?
      value.map(itemValue => source.find(item => item.value === itemValue)?.text || itemValue)
        .join(',')
      :
      source.find(item => item.value === value)?.text || value;
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
            const { text, value, ...restProps } = item;
            return <Radio value={value} key={value} {...restProps}>{text}</Radio>;
          })}
        </RadioGroup>
      );
  }
}
