/*
 * @Description: 
 * @Author: rodchen
 * @Date: 2022-07-01 11:39:28
 * @LastEditTime: 2022-07-04 01:08:08
 * @LastEditors: rodchen
 */
import React, { useState } from 'react';
import { Form, FormInstance, FormProps } from '../form';
import QueryFields, { QueryFieldsProps } from './QueryFields';

export interface QueryFormProps
  extends Omit<FormProps, 'fields' | 'actionsPosition' | 'actionsRender'>,
    Omit<QueryFieldsProps, 'getFormInstance'> {}

const QueryForm: React.ForwardRefRenderFunction<FormInstance, QueryFormProps> = (props, ref) => {
  const {
    layout,
    itemLayout = {
      cols: 3,
    },
    fields,
    initialValues,
    visibleFieldsCount,
    actionsRender,
    hasBottomBorder,
    getFilterKeyLabel,
    getFilterValueLabel,
    isHorizontally=true,
    isQueryTableForm,
    ...restProps
  } = props;
  const [form] = Form.useForm(restProps.form);
  const [hasFieldsValue, setHasFieldValue] = useState(false);

  const judgeIsEmpty = (value: any) => {
    if (value == null || value == undefined || String(value).trim() == '') {
      return true;
    }
    return false;
  };

  const checkFieldsValue = (allValues) => {
    let hasFieldValue = true;
    if (!allValues || Object.keys(allValues).length === 0 || Object.keys(allValues).every(item => judgeIsEmpty(allValues[item]))) {
      hasFieldValue = false;
    }
    setHasFieldValue(hasFieldValue)
  }


  React.useImperativeHandle(ref, () => form);

  const innerlayout = layout || {}
  return (
    <Form
      {...restProps}
      checkFieldsValue={checkFieldsValue}
      form={form}
      initialValues={initialValues}
      itemLayout={itemLayout}
      layout={isHorizontally ? innerlayout : 'vertical'}
    >
      <QueryFields
        fields={fields}
        isQueryTableForm={isQueryTableForm}
        hasFieldsValue={hasFieldsValue}
        ctxGetter={restProps.ctxGetter}
        getFilterKeyLabel={getFilterKeyLabel}
        getFilterValueLabel={getFilterValueLabel}
        visibleFieldsCount={visibleFieldsCount}
        getFormInstance={() => form}
        hasBottomBorder={hasBottomBorder}
        actionsRender={actionsRender}
        isHorizontally={isHorizontally}
      />
    </Form>
  );
};

export default React.forwardRef(QueryForm);
