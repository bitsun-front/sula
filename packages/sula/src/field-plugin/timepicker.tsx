import React from 'react';
import moment from 'moment';
import { TimePicker } from 'antd';
import { TimePickerProps } from 'antd/lib/time-picker';

export interface SulaTimePickerProps extends TimePickerProps {
  valueFormat?: 'utc' | boolean;
}

export default class SulaTimePicker extends React.Component<SulaTimePickerProps> {
  static defaultProps = {
    format: 'HH:mm:ss',
  };
  onFormatChange = (time, timeString) => {
    const { valueFormat, onChange } = this.props;
    let finalTime;

    if (valueFormat === 'utc') {
      finalTime = time ? time.valueOf() : null;
    } else {
      finalTime = timeString;
    }

    if (onChange) {
      onChange(finalTime, timeString);
    }
  };

  getDateStr = (dateValue: any) => {
    const format = this.props?.format;
    return dateValue ? moment(dateValue).format(format) : dateValue;
  }

  render() {
    const { ctx, viewPageEdit=false, valueFormat, value, ...restProps } = this.props;
    let finalValue = value;
    if (value) {
      if (valueFormat === true) {
        // timeString
        finalValue = moment(value, restProps.format);
      } else {
        finalValue = moment(value);
      }
    }
    return ctx?.mode === 'view' && !viewPageEdit ? 
      <span
        style={{
          fontSize: '14px',
          color: '#000000',
          fontFamily: 'PingFangSC'
        }}
      >
        {this.getDateStr(finalValue)}
      </span> : (
      <TimePicker
        {...restProps}
        {...(valueFormat ? { onChange: this.onFormatChange } : {})}
        value={finalValue}
      />
    );
  }
}
