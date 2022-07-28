import React from 'react';
import { Input as AInput } from 'antd';

export default class SulaTextArea extends React.Component {
  render() {
    const {ctx, viewPageEdit=false, ...restProps } = this.props;
    return ctx?.mode === 'view' && !viewPageEdit ? 
      <span
        style={{
          fontSize: '14px',
          color: '#000000',
          fontFamily: 'PingFangSC'
        }}
      >
        {this.props.value}
      </span> : <AInput.TextArea {...restProps} />
  }
}
