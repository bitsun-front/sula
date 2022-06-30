import React from 'react';
import { Button, Modal, Form, Row, Col, Input, Dropdown, Tooltip, Menu, Popover } from 'antd';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import styles from './index.less';


export default class ConditionList extends React.Component {
  constructor(props: any) {
    super(props)
  }

  renderDetailContent = (condition) => {
    const { getFilterValueLabel, getFilterKeyLabel } = this.props;
    return Object.keys(condition).map(conditionKey => (
      <div>
        <span>{getFilterKeyLabel(conditionKey)}</span>:
        <span>{getFilterValueLabel(conditionKey, condition[conditionKey])}</span>
      </div>
    ))
  }

  getMenu = () => {
    const { currentUserName, currentPage, tableRef, formRef } = this.props;
    let totalCondition = JSON.parse(localStorage.getItem(currentUserName) || '{}');
    let currentPageCondition = totalCondition[currentPage] || {};
    return (
      <Menu>
        <div className={styles.condition_content}>
          <div className={styles.condition_title}>
            <span>我的自定义条件</span>
            <Button type='link'>清空条件</Button>
          </div>
          {
            Object.keys(currentPageCondition).map(key => {
              return (
                <Popover placement="right" title={key} content={this.renderDetailContent(currentPageCondition[key])}>
                  <div
                    onClick={() => {
                      if (tableRef && formRef) {
                        formRef?.form.setFieldsValue(currentPageCondition[key]);
                        tableRef()?.table?.refreshTable(null, currentPageCondition[key], null, true)
                      }
                      // if (ctxGetter && ctxGetter()) {
                      //   ctxGetter()?.table?.refreshTable(null, currentPageCondition[key], null, true)
                      // }
                      // ctx.table.refreshTable(null, currentPageCondition[key], null, true);
                    }}
                    className={styles.conditon_item}
                    >
                      <span>{key}</span>
                      {/* <SettingOutlined />
                      <SettingOutlined onClick={() => {

                      }} />
                      <SettingOutlined /> */}
                    </div>
                </Popover>
              )
            })
          }
        </div>
      </Menu>
    ) 
  }

  render() {
    return (
      <Dropdown overlay={this.getMenu()} trigger={['click']}>
          <a
            className="ant-dropdown-link"
            onClick={(e) => e.preventDefault()}
          >
            <SettingOutlined />
            {/* <img width={32} src={shezhi} /> */}
          </a>
      </Dropdown>
    )
  }
}