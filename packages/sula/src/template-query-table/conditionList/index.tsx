/*
 * @Description: 
 * @Author: rodchen
 * @Date: 2022-07-01 11:39:28
 * @LastEditTime: 2022-07-04 00:50:06
 * @LastEditors: rodchen
 */
import React from 'react';
import { Button, Modal, Form, Row, Col, Input, Dropdown, Tooltip, Menu, Popconfirm, message, } from 'antd';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import { EditOutlined, OrderedListOutlined, DeleteOutlined } from '@ant-design/icons';
import TableBg from '../../assets/condition.svg';
import editIcon from '../../assets/edit.svg';
import deleteIcon from '../../assets/delete.svg';
import viewIcon from '../../assets/conditon_detail.svg';
import editIcon1 from '../../assets/edit1.svg';
import deleteIcon1 from '../../assets/delete1.svg';
import viewIcon1 from '../../assets/condition_detail1.svg';
import condition_bg from '../../assets/condition_bg.svg';
import styles from './index.less';


export default class ConditionList extends React.Component {
  constructor(props: any) {
    super(props)
  }

  formRef = React.createRef();


  state = {
    modalInfo: {
      modalVisible: false,
      modalName: '',
      modalDetail: {}
    },
    editNameModal: {
      modalVisible: false,
      callBack: null,
      initVal: '',
    },
    menuVisible: false,
    currentPageCondition: {},
    currentChecked: '',
  }

  componentDidMount(props) {
    this.setConditionData();
  }

  setConditionData = () => {
    const { currentUserName, currentPage, } = this.props;
    let totalCondition = JSON.parse(localStorage.getItem(currentUserName) || '{}');
    let currentPageCondition = totalCondition[currentPage] || {};
    this.setState({
      currentPageCondition,
      currentChecked: ''
    })
  }

  //render条件菜单页
  getMenu = () => {
    const { currentUserName, currentPage, tableRef, formRef } = this.props;
    const { currentPageCondition, currentChecked } = this.state;
   
    return (
      <Menu>
        <div className={styles.condition_content}>
          <div className={styles.condition_title}>
            <span className={styles.condition_title_label}>我的自定义条件</span>
            <Button 
              style={{padding: '0px'}} 
              type='link'
              onClick={() => {
                let totalCondition = JSON.parse(localStorage.getItem(currentUserName) || '{}');
                delete totalCondition[currentPage];
                localStorage.setItem(currentUserName, JSON.stringify(totalCondition));
                this.setState({
                  currentPageCondition: {},
                  currentChecked: ''
                })
              }}
            >清空条件</Button>
          </div>
          <div className={styles.condition_main}>
            {
              Object.keys(currentPageCondition).map(key => {
                return (
                  <div
                    style={{
                      backgroundColor: currentChecked === key ? '#005CFF' : 'rgba(0,92,255,0.10)',
                      color: currentChecked === key ? '#ffffff' : '#005CFF'
                    }}
                    onClick={() => {
                      this.setState({
                        currentChecked: key
                      })
                      if (tableRef && formRef) {
                        formRef?.form.setFieldsValue(currentPageCondition[key]);
                        tableRef()?.table?.refreshTable(null, currentPageCondition[key], null, true)
                      }
                    }}
                    className={styles.conditon_item}
                    >
                      <span className={styles.item_l}>{key}</span>
                      <span className={styles.item_r}>
                        <img 
                          src={currentChecked === key ? editIcon1 : editIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            this.setState({
                              editNameModal: {
                                modalVisible: true,
                                initVal: key,
                                callBack: (newName) => {
                                  if (newName == key) {
                                    message.warning('名称未修改.');
                                    return;
                                  }
                                  let totalCondition = JSON.parse(localStorage.getItem(currentUserName) || '{}');
                                  totalCondition[currentPage][newName] =  JSON.parse(JSON.stringify(totalCondition?.[currentPage]?.[key] || {}));
                                  delete totalCondition[currentPage][key];
                                  localStorage.setItem(currentUserName, JSON.stringify(totalCondition));
                                  this.setState({
                                    currentPageCondition: totalCondition[currentPage] || {},
                                    editNameModal: {
                                      modalVisible: false
                                    },
                                    currentChecked: currentChecked === key ? newName : currentChecked,
                                  })
                                }
                              }
                            })
                          }}
                        />
                        {/* <img 
                          src={currentChecked === key ? viewIcon1 : viewIcon}
                          onClick={(e) => {
                            e.stopPropagation()
                            this.setState({
                              modalInfo: {
                                modalVisible: true,
                                modalName: key,
                                modalDetail: currentPageCondition[key]
                              }
                            })
                          }}
                        /> */}
                        <Popconfirm 
                          title="确认删除吗?" 
                          okText="确认" 
                          cancelText="取消"
                          onConfirm={(e) => {
                            e.stopPropagation();
                            let totalCondition = JSON.parse(localStorage.getItem(currentUserName) || '{}');
                            delete totalCondition[currentPage][key];
                            localStorage.setItem(currentUserName, JSON.stringify(totalCondition));
                            this.setState({
                              currentPageCondition: totalCondition[currentPage] || {},
                              currentChecked: currentChecked === key ? '' : currentChecked,
                            })
                          }}
                          onCancel={(e) => {e?.stopPropagation()}}
                        >
                          <img 
                            src={currentChecked === key ? deleteIcon1 : deleteIcon}
                            onClick={(e) => {e.stopPropagation()}}
                          />
                        </Popconfirm>
                      </span>
                    </div>
                )
              })
            }
            <div 
            style={{
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              margin: '-69px 0 0 -59px', 
              width: '118px', 
              textAlign: 'center',
              display: Object.keys(currentPageCondition).length === 0 ? 'block' : 'none'
            }}>
              <img  width={118} src={condition_bg} />
              <span style={{color: '#BFBFBF', lineHeight: '20px'}}>暂无条件</span>
            </div>
          </div>
          <div className={styles.condition_bottom}>
            <span style={{fontSize: '14px', color: '#BFBFBF'}}>共{Object.keys(currentPageCondition).length}个筛选条件</span>
            {/* <Button 
              type='primary'
              disabled={!currentChecked}
              onClick={() => {
                if (tableRef && formRef) {
                  formRef?.form.setFieldsValue(currentPageCondition[currentChecked]);
                  tableRef()?.table?.refreshTable(null, currentPageCondition[currentChecked], null, true)
                }
              }}
            >
              查询
            </Button> */}
          </div>
        </div>
      </Menu>
    ) 
  }

  renderConditionDetail = () => {
    const { 
      modalInfo: {
        modalName,
        modalDetail={}
      } 
    } = this.state;
    const { getFilterValueLabel, getFilterKeyLabel } = this.props;
    return (
      <div className={styles.condition_detail_content}>
        <Row className={styles.condition_detail_item}>
          <div className={styles.detail_item_label}>条件名称:</div>
          <div className={styles.detail_item_value}>
            <Input style={{height: '36px', width: '280px'}} disabled value={modalName} />
          </div>
        </Row>
        <div className={styles.condition_line}>
          <span className={styles.line_title}>条件</span>
        </div>
        {
          Object.keys(modalDetail).map(conditionKey => (
            <Row className={styles.condition_detail_item}>
              <div className={styles.detail_item_label}>{getFilterKeyLabel(conditionKey)}:</div>
              <div className={styles.detail_item_value}>
                <Input style={{height: '36px', width: '280px'}} disabled value={getFilterValueLabel(conditionKey, modalDetail[conditionKey])} />
              </div>
            </Row>
          ))
        }
      </div>
    )
  }

  handleSubmit = () => {

    const {
      editNameModal: { callBack },
    } = this.state;
    this.formRef?.current?.validateFields()
      .then(values => {
        callBack && callBack(values.name);
      });

  }

  handleModalClose = () => {
    this.setState({
      editNameModal: {
        modalVisible: false
      }
    })
  }

  render() {
    const { modalInfo, editNameModal } = this.state;
    return (
      <div >
        <Dropdown
          destroyPopupOnHide={true}
          placement={this.props.isHorizontally ? 'bottomRight': 'bottomLeft'}
          overlayClassName={'filterMenu'}
          visible={this.state.menuVisible} 
          onVisibleChange={(flag:boolean) => {
            const { 
              modalInfo,
              editNameModal,
            } = this.state;
            if (flag) {
               this.setConditionData();
            }
            if (modalInfo.modalVisible || editNameModal.modalVisible) {
            } else {
              this.setState({
                menuVisible: flag
              })
            }
            
          }} 
          overlay={this.getMenu()} trigger={['click']}
            
        >
            <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              <span 
                style={{
                  display: 'flex', 
                  alignItems:'center',
                  justifyContent: 'center',
                  width: '32px', 
                  height: '32px', 
                  border: '0.89px solid #D9D9D9',
                  boxSizing: 'border-box',
                  borderRadius: '5px',
                  marginTop: this.props.isHorizontally ? '0px' : '10px'
                }}
              >
                <Tooltip placement="top" title={'条件库'}>
                  <img width={28} src={TableBg} />
                </Tooltip>
              </span>
            </a>
        </Dropdown>
        <Modal
          title={<span className={styles.modal_title}>条件详情</span>}
          width={793}
          centered
          visible={modalInfo.modalVisible}
          footer={null}
          // onOk={}
          onCancel={(e) => {
            e.stopPropagation();
            e.preventDefault()
            this.setState({
              modalInfo: {
                modalVisible: false,
                modalName: '',
                modalDetail: {}
              },
            })
          }}
        >
         {this.renderConditionDetail()}
        </Modal>
        <Modal
          width={485}
          bodyStyle={{ paddingLeft: '48px'}}
          destroyOnClose
          title={<span style={{fontSize: '18px', color: '#000000', fontWeight: '500'}}>编辑条件名称</span>}
          visible={editNameModal.modalVisible}
          onOk={this.handleSubmit}
          onCancel={this.handleModalClose}
        >
          <Form initialValues={{name: editNameModal.initVal}} ref={this.formRef}>
            <Row>
              <Col span={24}>
                <Form.Item name='name' label="名称">
                  <Input style={{ width: '339px', marginLeft: '5px' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}