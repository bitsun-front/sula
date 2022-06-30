import React from 'react';
import DownOutlined from '@ant-design/icons/DownOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import { Button, Modal, Form, Row, Col, Input, Dropdown, Tooltip } from 'antd';
import cx from 'classnames';
import { getItemSpan } from '../form/utils/layoutUtil';
import FieldGroupContext from '../form/FieldGroupContext';
import { FieldGroup, Field, FormAction, FieldProps, FormInstance, FormProps } from '../form';
import './style/query-fields.less';
import LocaleReceiver from '../localereceiver';
import { toArray } from '../_util/common';
import { history } from 'umi';
import ConditionList from './conditionList';

export interface QueryFieldsProps {
  fields: FieldProps[];
  visibleFieldsCount?: number | true;
  hasBottomBorder?: boolean;
  actionsRender: FormProps['actionsRender'],
  /** @private */
  getFormInstance: () => FormInstance;
}

export default class QueryFields extends React.Component<QueryFieldsProps> {
  static contextType = FieldGroupContext;

  static defaultProps = {
    visibleFieldsCount: 5,
    fields: [],
  };

  formRef = React.createRef<FormInstance>();

  state = {
    collapsed: true,
    modalInfo: {
      modalVisible: false,
      type: 'create',
      title: '',
      callBack: null,
    },
    currentUserName: localStorage.getItem('currentName') ? `${localStorage.getItem('currentName')}-condition` : 'noUser-condition',
    currentPage: history?.location?.pathname || '',
  };

  getVisibleFieldsCount = (): number => {
    if (this.props.visibleFieldsCount === true) {
      return this.props.fields.length;
    }

    return this.props.visibleFieldsCount!;
  };

  renderFields = () => {
    const { fields } = this.props;

    const { matchedPoint, itemLayout } = this.context;

    const fieldsNameList = [];

    let allSpan = 0;
    let visibleAllSpan = 0;

    const visibleFieldsCount = this.getVisibleFieldsCount();

    const finalFields = fields.map((field, index) => {
      fieldsNameList.push(field.name);
      const isVisible = index < visibleFieldsCount;
      const itemSpan = getItemSpan(itemLayout, matchedPoint, field.itemLayout);
      allSpan += itemSpan;
      if (isVisible) {
        visibleAllSpan += itemSpan;
      }
      return <Field {...field} initialVisible={isVisible} key={field.name} />;
    });
    this.expandSpan = 24 - (allSpan % 24);
    this.collapseSpan = 24 - (visibleAllSpan % 24);

    return finalFields;
  };

  hasMoreQueryFields() {
    const visibleFieldsCount = this.getVisibleFieldsCount();
    return visibleFieldsCount < this.props.fields.length;
  }

  updateVisibleFields() {
    const { getFormInstance, fields } = this.props;
    const formInstance = getFormInstance();

    const visibleFieldsCount = this.getVisibleFieldsCount();

    fields.forEach((field, index) => {
      if (index >= visibleFieldsCount) {
        formInstance.setFieldVisible(field.name, !this.state.collapsed);
      }
    });
  }

  saveCondition = (ctx: any, name: string) => {
    const { currentPage, currentUserName } = this.state;
    const fieldsValue = ctx.form.getFieldsValue();
    let totalCondition = JSON.parse(localStorage.getItem(currentUserName) || '{}');
    if (totalCondition[currentPage]) {
      totalCondition[currentPage][name] = fieldsValue;
    } else {
      totalCondition[currentPage] = {
        [name]: fieldsValue
      }
    }
    localStorage.setItem(currentUserName, JSON.stringify(totalCondition))
  }

  renderFormAction = (locale) => {
    const { layout } = this.context;
    const { collapsed, currentPage, currentUserName } = this.state;
    const { ctxGetter, getFilterKeyLabel, getFilterValueLabel } = this.props;
    const actionsRender = [
      ...(toArray(this.props.actionsRender)),
      ...(this.hasMoreQueryFields()
        ? [
            {
              type: () => (
                <a>
                  <span>{collapsed ? locale.expandText : locale.collapseText}</span>
                  <DownOutlined
                    style={{
                      transition: '0.3s all',
                      transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
                    }}
                  />
                </a>
              ),
              action: () => {
                this.setState(
                  {
                    collapsed: !collapsed,
                  },
                  () => {
                    this.updateVisibleFields();
                  },
                );
              },
            },
          ]
        : []),
        {
          type: 'button',
          props: {
            type: 'default',
            children: '保存为条件',
          },
          action: (ctx: any) => {
            const { modalInfo } = this.state;
            this.setState({
              modalInfo: {
                ...modalInfo,
                modalVisible: true,
                callBack: (name: string) => {
                  this.saveCondition(ctx, name);
                  this.setState({
                    modalInfo: {
                      ...modalInfo, 
                      modalVisible: false
                    }
                  })
                }
              }
            })
          }
        },
        {
          type: (ctx: any) => (
            <ConditionList 
              formRef={ctx} 
              tableRef={ctxGetter} 
              currentPage={currentPage} 
              currentUserName={currentUserName}
              getFilterValueLabel={getFilterValueLabel}
              getFilterKeyLabel={getFilterKeyLabel}
            />
            ),
          // props: {
          //   children: (<Button>sss</Button>)
          //   // children: (ctx: any) => (<ConditionList  currentPage={currentPage} currentUserName={currentUserName} />),
          // },
        },
        {
          type: 'button',
          props: {
            type: 'default',
            children: '排序',
          },
          action: (ctx: any) => {
            console.log(history)
          }
        },
    ];

    const finalSpan = this.state.collapsed ? this.collapseSpan : this.expandSpan;
    const layoutProps = {} as any;

    layoutProps.actionsPosition = 'right';
    layoutProps.style = {
      marginBottom: 24,
    };
    // if (finalSpan === 24) {
    // } else {
    //   layoutProps.style = {
    //     display: 'flex',
    //     justifyContent: 'flex-end',
    //     ...(layout === 'vertical' ? { marginTop: 30 } : {}),
    //   };
    // }

    return (
      <FormAction
        itemLayout={{
          span: finalSpan,
        }}
        {...layoutProps}
        actionsRender={actionsRender}
      />
    );
  };

  handleSubmit = () => {

    const {
      modalInfo: { callBack },
    } = this.state;
    this.formRef?.current?.validateFields()
      .then(values => {
        callBack && callBack(values.name);
      });

  }

  handleModalClose = () => {
    this.setState({
      modalInfo: {
        modalVisible: false
      }
    })
  }

  render() {
    const { hasBottomBorder } = this.props;
    const { modalInfo } = this.state;
    return (
      <>
        <LocaleReceiver>
          {(locale) => {
            return (
              
              <FieldGroup
                container={{
                  type: 'div',
                  props: {
                    className: cx(`sula-template-query-table-fields-wrapper`, {
                      [`sula-template-query-table-fields-divider`]: hasBottomBorder,
                    }),
                  },
                }}
              >
                {this.renderFields()}
                {this.renderFormAction(locale)}
              </FieldGroup>
            );
          }}
          
        
        </LocaleReceiver>
        <Modal
          width={600}
          bodyStyle={{ paddingTop: '32px', backgroundColor: '#F7F7F7' }}
          destroyOnClose
          title={modalInfo.title || ''}
          visible={modalInfo.modalVisible}
          onOk={this.handleSubmit}
          onCancel={this.handleModalClose}
        >
          <Form ref={this.formRef}>
            <Row>
              <Col span={24}>
                <Form.Item name='name' label="名称">
                  <Input style={{ width: '200px' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </>
    );
  }
}
