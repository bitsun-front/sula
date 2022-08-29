import React from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';


export type SulaDatePickerProps = DatePickerProps & {
  valueFormat?: 'utc' | boolean;
}

export default class SulaTimePicker extends React.Component<SulaDatePickerProps> {
  static defaultProps = {
    format: 'YYYY-MM-DD',
  }
  onFormatChange = (time, timeString) => {
    const {
      valueFormat,
      onChange,
    } = this.props;
    let finalTime;

    if(valueFormat === 'utc') {
      finalTime = time ? time.valueOf() : null;
    } else {
      finalTime = timeString;
    }

    if(onChange) {
      onChange(finalTime, timeString);
    }
    
  }

  getDateStr = (dateValue: any) => {
    const format = this.props?.format;
    return dateValue ? moment(dateValue).format(format) : dateValue;
  }

  render() {
    const {
      ctx, 
      valueFormat, 
      value,
      viewPageEdit=false,
      ...restProps
    } = this.props;
    let finalValue = value;
    if(value) {
      if(valueFormat === true) { // dateString
        finalValue = moment(value, restProps.format);
      } else {
        finalValue = moment(value);
      }
    }
    return  ctx?.mode === 'view' && !viewPageEdit ? 
      <span
        style={{
          fontSize: '14px',
          color: '#000000',
          fontFamily: 'PingFangSC'
        }}
      >
        {this.getDateStr(finalValue)}
      </span> : (
      <DatePicker 
      {...restProps}
      {...(valueFormat ? { onChange: this.onFormatChange } : {})}
      value={finalValue}
      />
    )
  }
}