import React from 'react';
import { Form, FormInstance, FormProps } from '../form';
import BasicQueryFields, { QueryFieldsProps } from './BasicQueryFields';

export interface QueryFormProps
  extends Omit<FormProps, 'fields' | 'actionsPosition' | 'actionsRender'>,
    Omit<QueryFieldsProps, 'getFormInstance'> {}

const BasicQueryForm: React.ForwardRefRenderFunction<FormInstance, QueryFormProps> = (props, ref) => {
  const {
    layout,
    itemLayout = {
      cols: 5,
      wrapperCol: { span: 24 }
    },
    fields,
    initialValues,
    visibleFieldsCount,
    actionsRender,
    hasBottomBorder,
    ...restProps
  } = props;
  const [form] = Form.useForm(restProps.form);

  React.useImperativeHandle(ref, () => form);

  return (
    <Form
      {...restProps}
      form={form}
      initialValues={initialValues}
      itemLayout={itemLayout}
      layout={layout}
    >
      <BasicQueryFields
        fields={fields}
        visibleFieldsCount={visibleFieldsCount}
        getFormInstance={() => form}
        hasBottomBorder={hasBottomBorder}
        actionsRender={actionsRender}
      />
    </Form>
  );
};

export default React.forwardRef(BasicQueryForm);
