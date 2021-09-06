import React from 'react';
import assign from 'lodash/assign';
import cx from 'classnames';
import { FormProps } from '../form';
import { RequestConfig } from '../types/request';
import { TableInstance, TableProps } from '../table/Table';
import { FormInstance } from '../types/form';
import { Table } from '../table';
import warning from '../_util/warning';
import './style/query-table.less';
import BasicQueryForm from './BasicQueryForm';
import LocaleReceiver from '../localereceiver';

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
}

const defaultProps = {
  formProps: {},
  tableProps: {},
  fields: [],
  columns: [],
  autoInit: true,
};

const prefixCls = 'sula-basic-query-table';

type Props = QueryTableProps & typeof defaultProps;

export default class BasicQueryTable extends React.Component<Props> {
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

  renderForm = (locale) => {
    const { formProps, layout, itemLayout, fields, initialValues, visibleFieldsCount, isReset } =
      this.props;

    const actionsRen = isReset
      ? [
          {
            type: 'button',
            props: {
              type: 'primary',
              children: locale.basicQueryText,
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
        ]
      : [
          {
            type: 'button',
            props: {
              type: 'primary',
              children: locale.basicQueryText,
            },
            action: [
              { type: 'validateQueryFields', resultPropName: '$queryFieldsValue' },
              {
                type: 'refreshTable',
                args: [{ current: 1 }, '#{result}'],
              },
            ],
          },
        ];
    return (
      <BasicQueryForm
        {...formProps}
        ctxGetter={() => {
          return {
            table: this.tableRef.current,
          };
        }}
        ref={this.formRef}
        hasBottomBorder={false}
        layout={layout}
        itemLayout={itemLayout}
        fields={fields}
        initialValues={initialValues}
        visibleFieldsCount={visibleFieldsCount}
        actionsRender={[...actionsRen]}
      />
    );
  };

  renderTable = () => {
    const {
      tableProps,
      columns,
      actionsRender,
      leftActionsRender,
      remoteDataSource,
      rowSelection,
      rowKey,
    } = this.props;

    if (!remoteDataSource) {
      warning(false, 'BasicQueryTable', '`remoteDataSource` is required.');
    }

    this.remoteDataSource = assign(remoteDataSource, { init: false });

    return (
      <div style={{ padding: '0 16px', background: '#ffffff' }}>
        <Table
          {...tableProps}
          className={cx(tableProps.className, `${prefixCls}`)}
          rowSelection={rowSelection}
          columns={columns}
          actionsRender={actionsRender}
          leftActionsRender={rowSelection ? ['rowselection'] : leftActionsRender}
          remoteDataSource={this.remoteDataSource}
          rowKey={rowKey}
          ref={this.tableRef}
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
