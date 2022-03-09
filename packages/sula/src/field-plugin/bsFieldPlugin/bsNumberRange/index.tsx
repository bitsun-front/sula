// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { InputNumber } from 'antd';
import styles from './index.less';

const BitsunNumberRange = (props: any) => {
  const { onChange, value } = props;
  const [value1, setValue1] = useState(undefined);
  const [value2, setValue2] = useState(undefined);
  const [maxValue1, setMaxValue1] = useState(undefined);
  const [minValue2, setMinValue2] = useState(0);

  useEffect(() => {
    if (
      value &&
      Array.isArray(value) &&
      JSON.stringify(value) !== JSON.stringify([value1, value2])
    ) {
      setValue1(value[0]);
      setValue2(value[1]);
    }
  }, [value]);

  useEffect(() => {
    setMinValue2(value1);
  }, [value1]);

  useEffect(() => {
    setMaxValue1(value2 || undefined);
  }, [value2]);

  const onChange1 = (value) => {
    if (value > maxValue1) {
      setValue1(maxValue1);
      onChange([maxValue1, value2]);
    } else {
      setValue1(value);
      onChange([value, value2]);
    }
  };

  const onChange2 = (value) => {
    if (value < minValue2) {
      setValue2(minValue2);
      onChange([value1, minValue2]);
    } else {
      setValue2(value);
      onChange([value1, value]);
    }
  };

  return (
    <div className={styles.number_range}>
      <InputNumber value={value1} min={0} precision={props.precision} onChange={onChange1} placeholder="请输入" />
      &nbsp;—&nbsp;
      <InputNumber value={value2} min={0} precision={props.precision} onChange={onChange2} placeholder="请输入" />
    </div>
  );
};

export default BitsunNumberRange;