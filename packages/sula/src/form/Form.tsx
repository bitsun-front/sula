import React, { useState } from 'react';
import { Form as AForm } from 'antd';
import omit from 'lodash/omit';
import { FormProps as AFormProps, FormInstance as AFormInstance } from 'antd/lib/form';
import { FieldGroupProps } from './FieldGroup';
import FieldGroupContext, { rootGroupName, HOOK_MARK } from './FieldGroupContext';
import { getItemLayout } from './utils/layoutUtil';
import { NormalizedItemLayout } from './FieldGroup';
import { FieldGroup } from '.';
import useFormContext from './useFormContext';
import FormDependency from './dependency';
import { triggerActionPlugin } from '../rope/triggerPlugin';
import MediaQueries from './MediaQueries';
import label_icon_bottom from '../assets/label_icon_bottom.svg';
import { RequestConfig } from '../types/request';
import { FieldNamePath, Mode } from '../types/form';
import dragImg from '../assets/drag.svg';
import position_top from '../assets/position_top.svg';
import { InsertRowLeftOutlined } from '@ant-design/icons';
import './style/field.less'; 

export interface FormProps
  extends Omit<AFormProps, 'children' | 'fields' | 'form'>,
    Omit<FieldGroupProps, 'name' | 'initialVisible' | 'dependency'> {
  remoteValues?: RequestConfig;
  onRemoteValuesStart?: () => void;
  onRemoteValuesEnd?: () => void;
  ctxGetter?: () => Record<string, any>;
  form?: FormInstance;
  mode?: Mode;
}

export interface FormInstance extends Omit<AFormInstance, 'validateFields'> {
  validateFields: (nameList?: FieldNamePath[] | true) => Promise<any>;
  validateGroupFields: (groupName: string) => Promise<any>;
  setFieldValue: (name: FieldNamePath, value: any) => void;
  setFieldSource: (name: FieldNamePath, source: any) => void;
  setFieldVisible: (name: FieldNamePath, visible: boolean) => void;
  setFieldDisabled: (name: FieldNamePath, disabled: boolean) => void;
  getFieldSource: (name: FieldNamePath) => any;
  getFieldDisabled: (name: FieldNamePath) => any;
}

const Form: React.FunctionComponent<FormProps> = (props, ref) => {
  const [formInstance] = useFormContext(props.form);

  React.useImperativeHandle(ref, () => formInstance);

  const {
    saveFormProps,
    saveFormDependency,
    cascade,
    getCtx,
    getAFormInstance,
    getAsyncCascade,
    setAsyncCascade,
  } = formInstance.getInternalHooks(HOOK_MARK);

  const formDependencyRef = React.useRef(new FormDependency());

  saveFormDependency(formDependencyRef.current);

  saveFormProps(props);

  const {
    layout = 'horizontal',
    itemLayout,
    mode = 'create',
    remoteValues,
    initialValues,
    container,
    fields,
    children,
    actionsRender,
    actionsPosition,
    onRemoteValuesStart,
    onRemoteValuesEnd,
    checkFieldsValue,
    isFormPage,
    formStatusMapping,
  } = props;

  const [currentStatusIndex, setCurrentStatusIndex] = React.useState('');
  const [operater, setOperater] = React.useState('');
  const [modifyTime, setModifyTime] = React.useState('');

  React.useEffect(() => {
    const ctx = getCtx();
    if (initialValues) {
      ctx.form.setFieldsValue(initialValues);
    }
    
    if (mode !== 'create' && remoteValues && remoteValues.init !== false) {
      onRemoteValuesStart && onRemoteValuesStart();
      triggerActionPlugin(ctx, remoteValues)
      .then((fieldsValue: any) => {
        ctx.form.setFieldsValue(fieldsValue);
        onRemoteValuesEnd && onRemoteValuesEnd();
        // if (formStatusMapping) {
        //   const { operaterKey='modifyUserName', modifyTimeKey='modifyTime' } = formStatusMapping;
        //   getCurrentStatusValue(ctx);
        //   setOperater(ctx.form.getFieldValue(operaterKey) || '');
        //   setModifyTime(ctx.form.getFieldValue(modifyTimeKey) || '');
        // }
      })
      .catch(() => {
        onRemoteValuesEnd && onRemoteValuesEnd();
      });
    }
  }, []);

  // const getCurrentStatusValue = (ctx) => {
  //   const { statusEnum=[], fieldName } = formStatusMapping;
  //   if ( !statusEnum || !statusEnum.length || !fieldName) return;
  //   let statusFieldValue = ctx?.form?.getFieldValue(fieldName) || '';
  //   if (!judgeIsEmpty(statusFieldValue)) {
  //     let currentIndex = statusEnum.findIndex(statusItem => statusItem.value == statusFieldValue) || '';
  //     setCurrentStatusIndex(currentIndex);
  //   }
  // }

  // const judgeIsEmpty = React.useCallback((value: any) => {
  //   if (value == null || value == undefined || String(value).trim() == '') {
  //     return true;
  //   }
  //   return false;
  // }, [])

  const finalChildren = fields ? (
    <FieldGroup
      fields={fields}
      isFormPage={isFormPage}
      container={container}
      actionsRender={actionsRender}
      actionsPosition={actionsPosition}
    />
  ) : (
    children
  );

  const formProps = omit(props, [
    'itemLayout',
    'mode',
    'remoteValues',
    'container',
    'fields',
    'children',
    'actionsRender',
    'actionsPosition',
    'ctxGetter',
    'onRemoteValuesStart',
    'onRemoteValuesEnd',
  ]);

  const originValuesChange = formProps.onValuesChange;

  const prevAllValuesRef = React.useRef<any>({});

  formProps.onValuesChange = (changedValue, allValues) => {
    function onValuesChange() {
      checkFieldsValue && checkFieldsValue(allValues);
      cascade(changedValue, {
        cascadeTrigger: 'setFieldsValue',
        cascadeStore: changedValue,
        cascadePrevStore: prevAllValuesRef.current,
      });
      prevAllValuesRef.current = allValues;

      if (originValuesChange) {
        originValuesChange(changedValue, allValues);
      }
    }
    /**
     * Promise.resolve 原因，需要动态field有机会更新 fieldName和fieldKey link，
     * 那么才能用新的fieldName 找到 fieldKey，然后再找到depOfType去进行关联
     */
    const needAsyncCascade = getAsyncCascade();
    if (needAsyncCascade) {
      Promise.resolve().then(() => {
        onValuesChange();
        setAsyncCascade(false);
      });
    } else {
      onValuesChange();
    }
  };

  let cardGroups: any[] = [];
  fields?.forEach(field => {
    if (field?.container?.type === 'card') {
      cardGroups.push({
        name: field?.container?.props?.title || '未命名',
        id: field?.container?.props?.id || ''
      })
    }
  })

  // let statusEnums = formStatusMapping?.statusEnum;
  
  return (
    <MediaQueries>
      {(matchedPoint) => {
        const normalizedItemLayout: NormalizedItemLayout = getItemLayout(
          itemLayout,
          layout,
          matchedPoint,
        );
        const fieldGroupContext = {
          formContext: {
            getInternalHooks: formInstance.getInternalHooks,
          },
          layout,
          itemLayout: normalizedItemLayout,
          parentGroupName: rootGroupName,
          matchedPoint,
        };
        const wrapperChildren = (
          <FieldGroupContext.Provider value={fieldGroupContext}>
            {finalChildren}
          </FieldGroupContext.Provider>
        );

        return (
          <div>
            {
              mode !=='create' && formStatusMapping && !!formStatusMapping.length && (
                <div style={{display: 'flex', padding: '10px 60px 0px', background: '#FFFFFF'}}>
                  {
                    formStatusMapping.map((item, index) => {
                      return (
                        <div style={{width: `${(100/formStatusMapping.length).toFixed(2)}%`}} className={`form-status-label ${item.isDone ? 'choosed-status-label' : ''} ${formStatusMapping.length === 1 ? 'only-one-child' : ''}`}>
                          <div className='status-label-key'>
                            <span className='status-label-index'>{index+1}</span>
                          </div>
                          <div className='status-label-operate'>
                            <div>{item.text}</div>
                            {
                              item.isDone ? (
                                <div title={`${item.modifyUserName || '--'} ${item.modifyTime || '--'}`}>{`${item.modifyUserName || '--'} ${item.modifyTime || '--'}`}</div>
                              ) : null
                            }
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )
            }
            <AForm
              {...formProps}
              className={cardGroups.length && isFormPage ? 'bitsun-form-class' : ''}
              wrapperCol={normalizedItemLayout.wrapperCol}
              labelCol={normalizedItemLayout.labelCol}
              children={wrapperChildren}
              form={getAFormInstance()}
            />
            {
              !!cardGroups.length && isFormPage && (
                <div
                  className='form-guide'
                >
                  <div className='form-guide-top'>
                    <img src={dragImg} />
                  </div>
                  <div className='form-guide-center'>
                    {
                      cardGroups.map(item => {
                        return (
                          <span
                            className='form-guide-item'
                            onClick={() => {
                              let currentDom = document.getElementById(item.id);
                              currentDom && currentDom.scrollIntoView({block: 'center', behavior: 'smooth'});
                            }}
                          >
                            {item.name}
                          </span>
                        )
                      })
                    }
                  </div>
                  <div className='form-guide-bottom'>
                    <img width={24} src={label_icon_bottom} />
                    {/* <InsertRowLeftOutlined width={28} /> */}
                  </div>
                </div>
              )
            }
          </div>
        );
      }}
    </MediaQueries>
  );
};

export default Form;
