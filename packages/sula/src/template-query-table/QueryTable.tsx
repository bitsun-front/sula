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
import LayourContext from './LayoutContext';
import { Input, Space, Button, Radio, Checkbox, Tabs, Badge  } from 'antd';
import { MoreOutlined, SearchOutlined, CaretDownOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import DropFilterSelect from './dropFilterComponent/dropFilterSelect';
import moment from 'moment';
import arrow_top from '../assets/arrow_top.png';

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
  statusMapping?: any;
  setVisibleColumn?: any;
  queryActionCallback?: any;
  resetActionCallback?: any;
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

  constructor(props) {
    super(props);
    this.state = {
      isHorizontally: props.isHorizontally === undefined ? true : props.isHorizontally,
      status: {},
      showSideMenu: true,
      sliderFormHeight: 500
    }
  }

  updateLayout = () => {
    const { isHorizontally } = this.state;
    this.setState({
      isHorizontally: !isHorizontally
    })

  }

  //监测是否按 下esc键
  checkFull = () => {
    var isFull =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;
    if (isFull == undefined) isFull = false;
    return isFull;
  }

  componentDidMount() {
    const { autoInit, initialValues, isFullScreen } = this.props;
    if (autoInit && this.remoteDataSource) {
      this.tableRef.current.refreshTable(null, initialValues, null, true);
    }
    this.setSliderFormHeight(isFullScreen);

  }

  componentWillReceiveProps(nextProps) {
    if (!this.judgeIsEmpty(nextProps.isFullScreen) && nextProps.isFullScreen !== this.props.isFullScreen) {
      this.setSliderFormHeight(nextProps.isFullScreen);
    }
  }

  judgeIsEmpty = (value: any) => {
    if (value == null || value == undefined || String(value).trim() == '') {
      return true;
    }
    return false;
  };

  setSliderFormHeight = (isFullScreen: boolean) => {
    setTimeout(() => {
      const clientHeight = document.documentElement.clientHeight;
      const outerHeight = window.screen.height;
      let newHeight = 500;
      let cancelHeight = window.top == window ? 142 : 62;
      if (isFullScreen) {
        newHeight = outerHeight - cancelHeight;
      } else {
        newHeight = clientHeight - cancelHeight;
      }
      this.setState({
        sliderFormHeight: newHeight
      })
    }, 0)
  }

  hasActionsRender = () => {
    const { actionsRender, leftActionsRender, rowSelection } = this.props;

    return (
      rowSelection ||
      (actionsRender && actionsRender.length) ||
      (leftActionsRender && leftActionsRender.length)
    );
  };

  getExportParams = () => {
    const formValues = this.formRef.current.getFieldsValue();
    const paramsTable = this.tableRef.current.getExportParams()
    const needConvertParams = {
      ...paramsTable,
      filters: {
        ...paramsTable.filters,
        ...formValues
      }
    }

    const params = { ...needConvertParams.filters };
    // 数组对象处理,对带有特殊标记的name进行处理
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const element = params[key];
        if (element && key.indexOf('*number*') >= 0) {
          const dataParams = key.split('*number*');
          dataParams.forEach((value, index) => {
            params[value] = element[index];
          });
          delete params[key];
        } else if (element && key.indexOf('*address*') >= 0) {
          const dataParams = key.split('*address*');
          dataParams.forEach((value, index) => {
            params[value] = element.PCDCode[index];
          });
          delete params[key];
        } else if (element && key.indexOf('*costType*') >= 0) {
          const dataParams = key.split('*costType*');
          // eslint-disable-next-line prefer-destructuring
          params[dataParams[0]] = element[1];
          delete params[key];
        } else if (element && key.indexOf('*fullDate*') >= 0) {
          const dataParams = key.split('*fullDate*');
          dataParams.forEach((value, index) => {
            if (index === 0) {
              params[value] = moment(element[index])
                .millisecond(0)
                .second(0)
                .minute(0)
                .hour(0)
                .format('YYYY-MM-DD HH:mm:ss');
            } else {
              params[value] = moment(element[index])
                .millisecond(59)
                .second(59)
                .minute(59)
                .hour(23)
                .format('YYYY-MM-DD HH:mm:ss');
            }
          });
          delete params[key];
        } else if (element && key.indexOf('*date*') >= 0) {
          const dataParams = key.split('*date*');
          dataParams.forEach((value, index) => {
            if (index === 0) {
              params[value] = moment(element[index]).format('YYYY-MM-DD');
            } else {
              params[value] = moment(element[index]).format('YYYY-MM-DD');
            }
          });
          delete params[key];
        } else if (element && key.indexOf('*size*') >= 0) {
          const dataParams = key.split('*size*')[0];
          params[dataParams] = typeof element === 'string' ? element.toUpperCase() : element;
          delete params[key];
        } else if (element && key.indexOf('*') >= 0) {
          const dataParams = key.split('*');
          dataParams.forEach((value, index) => {
            params[value] = element[index].format('YYYY-MM-DD HH:mm:ss');
          });
          delete params[key];
        } else if (Array.isArray(element)) {
          params[key] = element.join(',');
        }
      }
    }

    let finalParams = {};

    if (JSON.stringify(params) === '{}') {
      finalParams = { ...finalParams };
    }

    for (const key in params) {
      if (this.isValidateValue(params[key])) {
        finalParams[key] = params[key];
      }
    }

    // 排序动作触发
    let sorter;
    if (Object.keys(needConvertParams.sorter).length) {
      if (needConvertParams.sorter.order === 'ascend') {
        sorter = `asc-${needConvertParams.sorter.columnKey}`;
      } else if (needConvertParams.sorter.order === 'descend') {
        sorter = `desc-${needConvertParams.sorter.columnKey}`;
      }
    }
    return {
      pageSize: needConvertParams.pageSize,
      currentPage: needConvertParams.current,
      ...finalParams,
      sorter,
      selectedRows: this.tableRef.current.getSelectedRows()
    };
  }

  isValidateValue = (value: any) => {
    if (value == null || value === undefined || String(value).trim() === '') {
      return false;
    }
    return true;
  };

  renderForm = (locale, isHorizontally) => {
    const { showSideMenu } = this.state;
    const { formProps, layout, itemLayout, fields, initialValues, visibleFieldsCount, triggerResetData, queryActionCallback, resetActionCallback, noConditionOpts } = this.props;
    const formActionsRender = formProps?.actionsRender ?? [
      {
        type: 'button',
        props: {
          type: 'primary',
          children: locale.queryText,
          style: {
            width: '68px',
            marginRight: '10px'
          }
        },
        action: [
          { type: 'validateQueryFields', resultPropName: '$queryFieldsValue' },
          {
            type: 'refreshTable',
            args: [{ current: 1 }, '#{result}'],
          },
          (ctx: any) => {
            if(queryActionCallback) {
              const querySearchParams = ctx?.result;
              queryActionCallback(querySearchParams)
            }
          },
        ],
      },
      {
        type: 'button',
        props: {
          children: locale.resetText,
          style: {
            width: '68px',
            marginRight: '10px'
          }
        },
        action: [
          'resetFields',
          {
            type: 'resetTable',
            args: [false],
          },
          {
            type: 'refreshTable',
            args: [{ current: 1 }, triggerResetData ? {} :'#{form.getFieldsValue(true)}'],
          },
          () => {
            if(resetActionCallback) {
              resetActionCallback()
            }
          },
        ],
      },
    ];
    return (
      <div style={{position: 'relative'}}>
        <div 
          className='queryFormContainer' 
          style={!isHorizontally ? {
            background: '#ffffff', 
            borderTop: '1px #E1E2E3 solid', 
            height: `${this.state.sliderFormHeight}px`, 
            overflow: 'hidden', 
            width: showSideMenu ? '288px' : '0px',
            opacity: showSideMenu ? 1 : 0,
            } : {}}
        >
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
            actionsRender={formActionsRender}
            getFilterKeyLabel={this.getFilterKeyLabel}
            getFilterValueLabel={this.getFilterValueLabel}
            isQueryTableForm={this.judgeIsEmpty(noConditionOpts) ? true : !noConditionOpts}
            isHorizontally={isHorizontally}
          />
        </div>
        {
          !isHorizontally && 
          <div 
            className='queryFormCollapse'
            onClick={() => {
              this.setState({
                showSideMenu: !showSideMenu
              })
            }}
          >
            <img 
              src={arrow_top}
              style={{
                width: '14px',
                transform: showSideMenu ? 'rotate(270deg)' : 'rotate(90deg)'
              }}
            />
          </div>
        }
      </div>
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



  getColumnSearchProps = (item: ColumnProps, setVisibleColumn: any) => ({
    filterDropdown: ({ selectedKeys, confirm }) => (
      <div>
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            {
              this.renderDropFilter(item)
            }
          </Space>
        </div>
        <div
          style={{height: '36px', lineHeight: '36px', paddingLeft: '8px', cursor:'pointer'}}
          onClick={() => {
            setVisibleColumn && setVisibleColumn(item.title);
            confirm();
          }}
        >
          <EyeInvisibleOutlined /> &nbsp;&nbsp;
          隐藏该字段
        </div>
      </div>
    ),
    filterIcon: filtered => <CaretDownOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  })

  // 表头查询规则:
  // 1. 如果开发自定义customerDropFilterProps属性则根据customerDropFilterProps渲染
  // 2. 如果没有customerDropFilterProps属性，则默认根据tableHeadFilterKey属性查询对应查询表单的渲染规则来渲染表头查询项，
  // 3. 如果根据tableHeadFilterKey没有找到对应formField项，则默认渲染Input查询
  renderDropFilter = (column: ColumnProps) => {
    const { customerDropFilterProps } = column;
    if (customerDropFilterProps) {
      const { type='input' } = customerDropFilterProps;

      if (type === 'checkbox') {
        return (
          <div className='header-filter-radio'>
            <Checkbox.Group options={customerDropFilterProps.customerFilterOptions || []} onChange={(value) => {this.handleFieldsValueChange(value, column)}} />
          </div>
        )
      }

      if (type === 'radio') {
        return (
          <div className='header-filter-radio'>
              <Radio.Group options={customerDropFilterProps.customerFilterOptions || []} onChange={(e) => {this.handleFieldsValueChange(e.target.value, column)}} />
          </div>
        )
      }

    } else {
      const formFields = this.props.fields || [];
      let fieldInfo = formFields.find(item => item.name === column.tableHeadFilterKey) || {};
      let fieldType = fieldInfo?.field?.type || 'input';
      if (fieldType === 'select' || fieldType === 'bs-searchSelect') {
        let requestConfig = fieldInfo?.field?.props?.requestConfig || undefined;
        let config = {
          isFormField: true,
          tableHeadFilterKey: column.tableHeadFilterKey,
          ...requestConfig,
        }
        return (<DropFilterSelect
                  column={column}
                  config={config}
                  currentFormRef={this.formRef.current}
                  handleFieldsValueChange={this.handleFieldsValueChange}
                />)
      }
    }

    return (
      <div style={{width: '260px', boxSizing: 'border-box', padding: '8px'}}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={`请输入 按Enter确认`}
          // value={selectedKeys[0]}
          // onChange={this.handleInputChange}
          onPressEnter={(e) => {this.handleFieldsValueChange(e.target.value, column)}}
          style={{ display: 'flex' }}
        />
      </div>
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

  isTimeString = (str: any) => {
    if (str && str._isAMomentObject) return true;
    return false;
  }

  getSourceName = (source, value) => {
    let labelName = value;
    const loop = (data: Array<any>) => {
      data.forEach(item => {
        if (item.value === value) {
          labelName = item.text || item.name || item.label || item.title || item.value;
        } else if (item.children && Array.isArray(item.children)) {
          loop(item.children);
        }
      })
    }
    loop(source);
    return labelName;
  }

  //获取form筛选条件值对应label
  getFilterValueLabel = (key: string, value: any) => {
    const { getFieldSource } = this.formRef.current || {};
    const { columns, fields } = this.props;
    let fieldSource;
    if (fields.find(item => item.name === key)) {
      fieldSource = getFieldSource?.(key);
    }
    //获取筛选条件数据源只考虑source为数组情况
    let source;
    if (fieldSource && Array.isArray(fieldSource)) {
      source = [...fieldSource]
    }

    let customerFilterOptions = columns.find(item => item.tableHeadFilterKey === key)?.customerDropFilterProps?.customerFilterOptions;
    if (customerFilterOptions) {
      source = JSON.parse(JSON.stringify(customerFilterOptions));
    }
    //当筛选条件项存在
    if (source) {
      if (typeof(value) === 'number' || typeof(value) === 'string' || typeof(value) === 'boolean') {
        return this.getSourceName(source, value);
      }
      if (Array.isArray(value)) {
        return value.map(itemValue => this.getSourceName(source, itemValue))
      }
    }

    //没有数据源的情况下判断是否为日期格式
    if (Array.isArray(value)) {
      return value.map(item => {
        return this.isTimeString(item) ? moment(item).format('YYYY-MM-DD') : item
      })
    }

    return this.isTimeString(value) ? moment(value).format('YYYY-MM-DD') : value;
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

  onChange = (item: any) => {
    if(item.value === this.state.status.value) return;
    this.setState({
      status: item
    })
    const { getFieldsValue, setFieldsValue } = this.formRef.current || {};
    let currentFieldsValue = getFieldsValue(true);
    this.tableRef?.current?.setFilters({[item.key]: item.value});
    this.tableRef?.current?.clearRowSelection();
    this.tableRef?.current?.refreshTable(null, currentFieldsValue, null, true);
  };


  renderTable = () => {
    const { status, isHorizontally } = this.state;
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
      statusMapping,
      setVisibleColumn,
      triggerQueryData,
      triggerResetData,
      summary
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
          ...this.getColumnSearchProps(item, setVisibleColumn),
        }
      }
    })

    const suitStyle = {
      position: 'relative',
    }

    return (
        <div className={!isHorizontally ? 'suitClass' : ''} style={tableWrapperStyle ? {...suitStyle, ...tableWrapperStyle} : {...suitStyle, padding: '0 16px', background: '#ffffff'}}>
          {!isHorizontally && statusMapping && <div className="sula-table-status">
            {statusMapping && statusMapping.map(item => <div className={status.value === item.value ? 'span-active' : ''} onClick={() => {this.onChange(item)}}>
              <Badge count={item.count} size="small" offset={[5, -5]} overflowCount={Number.MAX_SAFE_INTEGER}> {item.label}</Badge>
            </div>)}
            <div></div>
          </div>}

          <div style={{position: 'relative'}}>
            <Table
              {...tableProps}
              className={cx(tableProps.className, `${prefixCls}`, `${summary ? 'has-bssula-summary' : ''}`)}
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
              queryFormFields={this.props.fields || []}
              tagColor={tagColor}
              triggerQueryData={triggerQueryData}
              triggerResetData={triggerResetData}
            />
             {summary &&
              <div className='table-bssula-summary'>
                {summary.map(item => (
                  <span>
                    {item.label}: <span className='table-bssula-summary-count'>{item.count}</span>
                  </span>
                ))}
              </div>}
          </div>
        </div>
    );
  };

  render() {
    const { isHorizontally } = this.state;

    return (
      <LocaleReceiver>
        {(locale) => {
          return (
            <React.Fragment>
              <LayourContext.Provider value={{
                isHorizontally: isHorizontally,
                updateLayout: this.updateLayout
              }}>
                <div style={(!isHorizontally) ? {display: 'flex', background: 'rgb(243, 243, 243)' } : {}}>
                  {this.props.fields && this.props.fields.length ? this.renderForm(locale, isHorizontally) : null}
                  {this.renderTable()}
                </div>
              </LayourContext.Provider>
            </React.Fragment>
          );
        }}
      </LocaleReceiver>
    );
  }
}
