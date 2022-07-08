import React from 'react';
import DownOutlined from '@ant-design/icons/DownOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import { Button, Modal, Form, Row, Col, Input, Dropdown, Tooltip, message } from 'antd';
import cx from 'classnames';
import { getItemSpan } from '../form/utils/layoutUtil';
import FieldGroupContext from '../form/FieldGroupContext';
import { MenuFoldOutlined } from '@ant-design/icons'
import { FieldGroup, Field, FormAction, FieldProps, FormInstance, FormProps } from '../form';
import './style/query-fields.less';
import LocaleReceiver from '../localereceiver';
import { toArray } from '../_util/common';
import { history } from 'umi';
import ConditionList from './conditionList';
import LayoutContext from './LayoutContext';
import position_left from '../assets/position_left.svg';
import position_top from '../assets/position_top.svg';

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

  componentDidMount(props) {
    console.log(this.props.formRef)
  }

  getVisibleFieldsCount = (): number => {
    let count = this.props.visibleFieldsCount;
    if (count === true) {
      return this.props.fields.length;
    }
    const clientWicth = document.documentElement.clientWidth;

    // let queryFieldsWidth = clientWicth - 520;

    // if(queryFieldsWidth > 1224) {
    //   count++;
    //   return count;
    // }

    return count!;
  };

  componentWillReceiveProps(nextProps) {
    if(!this.props.isHorizontally && nextProps.isHorizontally) {
      this.setState(
        {
          collapsed: false
        }
      )
      return 
    }
  }

  renderFields = () => {
    const { fields, isHorizontally, getFormInstance } = this.props;

    const { matchedPoint, itemLayout } = this.context;

    const fieldsNameList = [];

    let allSpan = 0;
    let visibleAllSpan = 0;

    let visibleFieldsCount = this.getVisibleFieldsCount();


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

    if(!isHorizontally) {
      const formInstance = getFormInstance();
      fields.forEach((field, index) => {
        if (index >= visibleFieldsCount) {
          formInstance.setFieldVisible(field.name, true);
        }
      });
    }

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
    const { ctxGetter, getFilterKeyLabel, getFilterValueLabel, isHorizontally, hasFieldsValue } = this.props;
    let actionsRender = []

    if (!isHorizontally) {
      
      actionsRender = [
        {
          type: 'button',
          props: {
            type: 'default',
            children: '保存为条件',
            style: {
              width: '94px',
              border: !hasFieldsValue ? '1px solid #d9d9d9' : '1px solid #005CFF',
              color: !hasFieldsValue ? 'rgba(0, 0, 0, 0.25)' : '#005CFF',
              padding: '0 12px',
              marginRight: '10px'
            },
          },
          disabled: !hasFieldsValue,
          action: (ctx: any) => {
            const { modalInfo } = this.state;
            this.setState({
              modalInfo: {
                ...modalInfo,
                modalVisible: true,
                callBack: (name: string) => {
                  this.saveCondition(ctx, name);
                  message.success('保存成功。');
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
        ...(toArray(this.props.actionsRender).concat([]).reverse()),
        {
          type: (ctx: any) => (
            <span>
              <LayoutContext.Consumer>
                {({ isHorizontally, updateLayout }: any) => <span
                  style={{
                    display: 'flex',
                    alignItems:'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    border: '0.89px solid #D9D9D9',
                    boxSizing: 'border-box',
                    borderRadius: '5px',
                    marginRight: '10px',
                    marginTop: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={position_left}
                    width={24}
                    onClick={() => {
                      updateLayout(!isHorizontally)
                    }} />
                </span>}
            </LayoutContext.Consumer>
            </span>
          )
        },
        {
          type: (ctx: any) => (
            <ConditionList
              formRef={ctx}
              isHorizontally={isHorizontally}
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
      ]
    } else {
      actionsRender = [
        ...(toArray(this.props.actionsRender)),
          {
            type: 'button',
            props: {
              type: 'default',
              children: '保存为条件',
              style: {
                width: '94px',
                border: !hasFieldsValue ? '1px solid #d9d9d9' : '1px solid #005CFF',
                color: !hasFieldsValue ? 'rgba(0, 0, 0, 0.25)' : '#005CFF',
                padding: '0 12px',
                marginRight: '10px'
              },
            },
            disabled: !hasFieldsValue,
            action: (ctx: any) => {
              const { modalInfo } = this.state;
              this.setState({
                modalInfo: {
                  ...modalInfo,
                  modalVisible: true,
                  callBack: (name: string) => {
                    this.saveCondition(ctx, name);
                    message.success('保存成功。');
                    this.setState({
                      modalInfo: {
                        ...modalInfo, 
                        modalVisible: false
                      }
                    })
                  }
                },
              })
            }
          },
          {
            type: (ctx: any) => (
              <ConditionList
                formRef={ctx}
                isHorizontally={isHorizontally}
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
            type: (ctx: any) => (
              <span>
                <LayoutContext.Consumer>
                  {({ isHorizontally, updateLayout }: any) => <span
                    style={{
                      display: 'flex',
                      alignItems:'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      border: '0.89px solid #D9D9D9',
                      boxSizing: 'border-box',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={position_top}
                      width={24}
                      onClick={() => {
                        updateLayout(!isHorizontally)
                      }} />
                  </span>}
              </LayoutContext.Consumer>
              </span>
            )
          }
          
      ];
    }


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
        landscape={!isHorizontally}
      />
      // <LayoutContext.Consumer>
      //   {({isHorizontally, updateLayout}: any) => (
      //   )}
      // </LayoutContext.Consumer>
      
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
    const { hasBottomBorder, isHorizontally } = this.props;
    console.log(isHorizontally)
    const { modalInfo, collapsed } = this.state;
    return (
      <>
        <LocaleReceiver>
          {(locale) => {
            return (
              <>
                <FieldGroup
                isHorizontally={isHorizontally}
                container={{
                  type: 'div',
                  props: {
                    className: cx(!isHorizontally ? 'sula-template-query-table-fields-wrapper isHorizontally' : `sula-template-query-table-fields-wrapper`),
                  },
                }}
              >
                {this.renderFields()}
                {this.renderFormAction(locale)}
              </FieldGroup>
              {this.hasMoreQueryFields() && isHorizontally
                ? <div className='sula-template-query-table-collapsed sula-template-query-table-fields-divider'>
                    <a onClick={() => {
                      this.setState(
                        {
                          collapsed: !collapsed,
                        },
                        () => {
                          this.updateVisibleFields();
                        },
                      );
                    }}>
                        <span>{collapsed ? locale.expandText : locale.collapseText}</span>
                        &nbsp;<DownOutlined
                          style={{
                            fontSize: '10px',
                            transition: '0.3s all',
                            transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
                          }}
                        />
                      </a>
                  </div> 
                : <></>
              }
              </>
            );
          }}
          
        
        </LocaleReceiver>
        <Modal
          width={485}
          bodyStyle={{ paddingLeft: '48px'}}
          destroyOnClose
          title={modalInfo.title || <span style={{fontSize: '18px', color: '#000000', fontWeight: '500'}}>新增条件</span>}
          visible={modalInfo.modalVisible}
          onOk={this.handleSubmit}
          onCancel={this.handleModalClose}
        >
          <Form ref={this.formRef}>
            <Row>
              <Col span={24}>
                <Form.Item name='name' label="名称">
                  <Input style={{ width: '339px',marginLeft: '5px' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </>
    );
  }
}
