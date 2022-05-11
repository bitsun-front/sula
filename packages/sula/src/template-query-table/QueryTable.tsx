import React from 'react';
import assign from 'lodash/assign';
import cx from 'classnames';
import { Field, FormProps } from '../form';
import { RequestConfig } from '../types/request';
import { ColumnProps, TableInstance, TableProps } from '../table/Table';
import { FormInstance } from '../types/form';
import { Table } from '../table';
import warning from '../_util/warning';
import './style/query-table.less';
import QueryForm from './QueryForm';
import LocaleReceiver from '../localereceiver';
import { Input, Space, Button, Radio, Checkbox } from 'antd';
import { MoreOutlined, SearchOutlined, CaretDownOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

type FormPropsPicks = 'fields' | 'initialValues' | 'layout' | 'itemLayout';
type TablePropsPicks =
  | 'remoteDataSource'
  | 'actionsRender'
  | 'leftActionsRender'
  | 'rowKey'
  | 'columns'
  | 'rowSelection';

export interface QueryTableProps
  extends Pick<FormProps, FormPropsPicks>,
    Pick<TableProps, TablePropsPicks> {
  visibleFieldsCount?: number | true;

  formProps?: Omit<FormProps, FormPropsPicks>;
  tableProps?: Omit<TableProps, TablePropsPicks>;
  autoInit?: boolean;
  tagColor?: string;
  tableWrapperStyle?: any;
}

const defaultProps = {
  formProps: {},
  tableProps: {},
  fields: [],
  columns: [],
  autoInit: true,
};

const prefixCls = 'sula-template-query-table';

type Props = QueryTableProps & typeof defaultProps;

export default class QueryTable extends React.Component<Props> {
  static defaultProps = defaultProps;

  private remoteDataSource: RequestConfig;

  private formRef = React.createRef<FormInstance>();
  private tableRef = React.createRef<TableInstance>();

  componentDidMount() {
    const { autoInit, initialValues } = this.props;
    if (autoInit && this.remoteDataSource) {
      this.tableRef.current.refreshTable(null, initialValues, null, true);
    }
  }

  hasActionsRender = () => {
    const { actionsRender, leftActionsRender, rowSelection } = this.props;

    return (
      rowSelection ||
      (actionsRender && actionsRender.length) ||
      (leftActionsRender && leftActionsRender.length)
    );
  };

  renderForm = (locale) => {
    const { formProps, layout, itemLayout, fields, initialValues, visibleFieldsCount } = this.props;

    return (
      <QueryForm
        {...formProps}
        ctxGetter={() => {
          return {
            table: this.tableRef.current,
          };
        }}
        ref={this.formRef}
        hasBottomBorder={this.hasActionsRender()}
        layout={layout}
        itemLayout={itemLayout}
        fields={fields}
        initialValues={initialValues}
        visibleFieldsCount={visibleFieldsCount}
        actionsRender={[
          {
            type: 'button',
            props: {
              type: 'primary',
              children: locale.queryText,
            },
            action: [
              { type: 'validateQueryFields', resultPropName: '$queryFieldsValue' },
              {
                type: 'refreshTable',
                args: [{ current: 1 }, '#{result}'],
              },
            ],
          },
          {
            type: 'button',
            props: {
              children: locale.resetText,
            },
            action: [
              'resetFields',
              {
                type: 'resetTable',
                args: [false],
              },
              {
                type: 'refreshTable',
                args: [{ current: 1 }, '#{form.getFieldsValue(true)}'],
              },
            ],
          },
        ]}
      />
    );
  };

  handleFieldsValueChange = (value, props: ColumnProps) => {
    const { getFieldsValue, setFieldsValue } = this.formRef.current || {};
    let columnKey = props.tableHeadFilterKey;
    let currentFieldsValue = getFieldsValue(true);
    let newFieldsValue = assign(currentFieldsValue, {
      [columnKey]: value
    });
    setFieldsValue({...newFieldsValue});
    this.tableRef?.current?.refreshTable(null, newFieldsValue, null, true);
  }

  

  getColumnSearchProps = (item: ColumnProps) => ({
    filterDropdown: ({ selectedKeys }) => (
      <div>
        <div style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            {
              this.renderDropFilter(item)
            }
          </Space>
        </div>
        {/* <div style={{borderTop: '1px solid #f0f0f0', height: '36px', lineHeight: '36px', paddingLeft: '8px', cursor:'pointer'}}>
          <EyeInvisibleOutlined /> &nbsp;&nbsp;
          隐藏该字段
        </div> */}
      </div>
    ),
    filterIcon: filtered => <CaretDownOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  })

  renderDropFilter = (column: ColumnProps) => {
    if (column.customerFilterOptions) {
      if (column.customerFilterType === 'checkbox') {
        return (
          <div style={{width: '200px'}}>
            <Checkbox.Group options={column.customerFilterOptions} onChange={(value) => {this.handleFieldsValueChange(value, column)}} />
          </div>
        )
      }
      return (
        <div style={{width: '200px'}}>
            <Radio.Group options={column.customerFilterOptions} onChange={(e) => {this.handleFieldsValueChange(e.target.value, column)}} />
        </div>
      )
    }
    return (
      <Input
        prefix={<SearchOutlined />}
        placeholder={`请输入 按Enter确认`}
        // value={selectedKeys[0]}
        // onChange={this.handleInputChange}
        onPressEnter={(e) => {this.handleFieldsValueChange(e.target.value, column)}}
        style={{ marginBottom: 8, display: 'flex' }}
      />
    )
  }

  onCloseTag = (key: string) => {
    const { getFieldsValue, setFieldsValue } = this.formRef.current || {};
    let currentFieldsValue = getFieldsValue(true);
    let newFieldsValue = assign(currentFieldsValue, {
      [key]: undefined
    });
    setFieldsValue({...newFieldsValue});
    this.tableRef?.current?.refreshTable(null, newFieldsValue, null, true);
  }

  //获取form筛选条件值对应label
  getFilterValueLabel = (key: string, value: any) => {
    const { getFieldSource } = this.formRef.current || {};
    const { columns, fields } = this.props;
    let fieldSource;
    if (fields.find(item => item.name === key)) {
      fieldSource = getFieldSource(key);
    }
    //获取筛选条件数据源只考虑source为数组情况
    let source;
    if (fieldSource && Array.isArray(fieldSource)) { 
      source = [...fieldSource]
    }
    
    let customerFilterOptions = columns.find(item => item.tableHeadFilterKey === key)?.customerFilterOptions;
    if (customerFilterOptions) {
      source = JSON.parse(JSON.stringify(customerFilterOptions));
    }
    //当筛选条件项存在
    if (source) {
      if (typeof(value) === 'number' || typeof(value) === 'string') {
        return source.find(item => item.value == value)?.text || source.find(item => item.value == value)?.label || value
      }
      if (Array.isArray(value)) {
        return value.map(itemValue => 
          source.find(sourceItem => sourceItem.value == itemValue)?.text || source.find(sourceItem => sourceItem.value == itemValue)?.label || itemValue)
      }
    }
    return value;
  }

  getFilterKeyLabel = (filterKey) => {
    const { fields, columns } = this.props;
    if (fields.find(field => field.name === filterKey)) {
      return fields.find(field => field.name === filterKey)?.label || filterKey; 
    }
    if (columns.find(column => column.tableHeadFilterKey === filterKey)) {
      return columns.find(column => column.tableHeadFilterKey === filterKey)?.title || filterKey; 
    }
    return filterKey;
  }

  getCurrentFormValue = () => {
    const { getFieldsValue } = this.formRef.current || {};
    if (getFieldsValue) {
      return getFieldsValue(true)
    }
    return null;
  }

  renderTable = () => {
    const {
      tableProps,
      columns,
      actionsRender,
      leftActionsRender,
      remoteDataSource,
      rowSelection,
      rowKey,
      tagColor,
      tableWrapperStyle,
    } = this.props;

    if (!remoteDataSource) {
      warning(false, 'QueryTable', '`remoteDataSource` is required.');
    }

    this.remoteDataSource = assign(remoteDataSource, { init: false });

    const finalColumns: ColumnProps[] = [...columns];
    finalColumns.forEach((item, index) => {
      if (item.tableHeadFilterKey) {
        finalColumns[index] = {
          ...item,
          ...this.getColumnSearchProps(item),
        }
      }
    })

    return (
        <div style={tableWrapperStyle ? tableWrapperStyle : {padding: '0 16px', background: '#ffffff'}}>
          <Table
            {...tableProps}
            className={cx(tableProps.className, `${prefixCls}`)}
            rowSelection={rowSelection}
            columns={finalColumns}
            actionsRender={actionsRender}
            leftActionsRender={rowSelection ? ['rowselection'] : leftActionsRender}
            remoteDataSource={this.remoteDataSource}
            rowKey={rowKey}
            ref={this.tableRef}
            onCloseTag={this.onCloseTag}
            getCurrentFormValue={this.getCurrentFormValue}
            getFilterValueLabel={this.getFilterValueLabel}
            getFilterKeyLabel={this.getFilterKeyLabel}
            tagColor={tagColor}
          />
        </div>
    );
  };

  render() {
    return (
      <LocaleReceiver>
        {(locale) => {
          return (
            <React.Fragment>
              {this.props.fields && this.props.fields.length ? this.renderForm(locale) : null}
              {this.renderTable()}
            </React.Fragment>
          );
        }}
      </LocaleReceiver>
    );
  }
}
