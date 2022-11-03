import React from 'react';
import { Table as ATable, Tag } from 'antd';
import { TableProps as ATableProps, ColumnProps as AColumnProps } from 'antd/lib/table';
import { SortOrder } from 'antd/lib/table/interface';
import { PaginationConfig } from 'antd/lib/pagination';
import omit from 'lodash/omit';
import isUndefined from 'lodash/isUndefined';
import assign from 'lodash/assign';
import useTableContext, { HOOK_MARK } from './useTableContext';
import { triggerTableRowRenderPlugin, triggerPlugin } from '../rope/triggerPlugin';
import TableAction from './TableAction';
import ModalForm from '../modalform';
import { SulaConfigContext } from '../config-provider/context';
import { RenderPlugin, FilterPlugin } from '../types/plugin';
import { RequestConfig } from '../types/request';
import styles from './style/bs_table.less'
import cx from 'classnames';

type RowRecord = Record<string, any>;
type DataSource = RowRecord[];
export interface TableProps extends Omit<ATableProps<RowRecord>, 'title' | 'dataSource' | 'pagination' | 'columns'> {
  columns: ColumnProps[];
  remoteDataSource?: RequestConfig;
  initialPaging?:
    | false
    | {
        pagination?: PaginationConfig;
        sorter?: Sorter;
        filters?: Filters;
      };
  initialDataSource?: DataSource;
  initialSelectedRowKeys?: string[];
  actionsRender?: RenderPlugin | RenderPlugin[];
  leftActionsRender?: RenderPlugin | RenderPlugin[];
  ctxGetter?: () => Record<string, any>;
  onCloseTag?: any;
  getCurrentFormValue?: any;
  getFilterValueLabel?: any;
  getFilterKeyLabel?: any;
}

export interface ColumnProps extends Omit<AColumnProps<any>, 'render'> {
  filterRender?: FilterPlugin;
  render?: RenderPlugin | RenderPlugin[];
  tableHeadFilterKey?: string;
  customerFilterOptions?: filterOption[];
  customerFilterType?: string;
  customerDropFilterProps?: any;
}

export interface filterOption {
  label: string;
  value: string | number;
}

export interface Sorter {
  columnKey: string;
  order: SortOrder;
}

export interface Filters {
  [columnKey: string]: any[] | null;
}

export type Pagination = PaginationConfig;

export interface Paging {
  pagination?: Pagination;
  filters?: Filters;
  sorter?: Sorter;
}

export interface DataSourceResponse {
  list: DataSource;
  total: number;
  pageSize?: number;
}

export interface TableControlProps {
  dataSource: DataSource;
  selectedRowKeys?: string[];
  pagination?: PaginationConfig;
  filters?: Filters;
  sorter?: SortOrder;
}

export interface TableInstance {
  setDataSource: (dataSource: DataSource) => void;
  getDataSource: () => DataSource;

  setPagination: (pagination: PaginationConfig) => void;
  setFilters: (filters: Filters) => void;
  setSorter: (sorter: Sorter) => void;

  getSelectedRowKeys: () => string[];
  clearRowSelection: () => void;

  getSelectedRows: () => DataSource;

  getPaging: () => Paging;

  refreshTable: (
    pagination?: PaginationConfig,
    filters?: Filters,
    sorter?: Sorter,
  ) => Promise<undefined>;
  resetTable: (isRefresh?: boolean) => void | Promise<undefined>;
}

const RefTable: React.FunctionComponent<TableProps> = (props, ref) => {
  const [context] = useTableContext();

  const mountRef = React.useRef<boolean>(false);

  const modalFormRef = React.useRef(null);
  const drawerFormRef = React.useRef(null);

  const {
    getCtx,
    saveTableProps,
    setControls,
    getControls,
    getInternalControls,
    onRowSelectionChange,
    onChange,
    saveModalFormRef,
    saveDrawerFormRef,
  } = context.getInternalHooks(HOOK_MARK);

  React.useImperativeHandle(ref, context.getTable);

  saveTableProps(props);

  if (!mountRef.current) {
    mountRef.current = true;

    saveModalFormRef(modalFormRef);
    saveDrawerFormRef(drawerFormRef);

    const tableControls: TableControlProps = parseTableControls(props);
    setControls(tableControls);
  }

  React.useEffect(() => {
    if (props.remoteDataSource && props.remoteDataSource.init !== false) {
      const table = context.getTable();
      // 初始化数据源不能清空选中项
      table.refreshTable(null, null, null, true);
    }
  }, []);

  const tableProps = omit(props, [
    'remoteDataSource',
    'initialDataSource',
    'initialPaging',
    'initialSelectedRowKeys',
    'ctxGetter',
  ]);

  const configContext = React.useContext(SulaConfigContext);

  // =============== Table 级别 ===============

  const controls = getControls();
  tableProps.dataSource = controls.dataSource;
  tableProps.pagination = controls.pagination;

  const internalControls = getInternalControls();

  tableProps.loading = internalControls.loading;

  tableProps.onChange = onChange;

  if (tableProps.rowSelection) {
    tableProps.rowSelection = {
      ...tableProps.rowSelection,
      onChange: onRowSelectionChange,
      selectedRowKeys: controls.selectedRowKeys,
    };
  }

  // 1.x版本屏蔽该功能
  const judgeIsEmpty = (value: any) => {
    if (value == null || value == undefined || String(value).trim() == '') {
      return true;
    }
    return false;
  };
  let filterValues = tableProps?.getCurrentFormValue?.() || {};
  const filterFields = Object.keys(filterValues).filter(item => {
    let formFields = props.queryFormFields || [];
    if (formFields.find(field => item === field.name)?.notShowLabel) return false;
    if (item === 'extensionFields') return false;
    return !judgeIsEmpty(filterValues[item]);
  });

  if (!tableProps.title && (props.actionsRender || props.leftActionsRender)) {
    tableProps.title = (currentPageData) => {
      const ctx = getCtx({ dataSource: currentPageData, history: configContext.history });
      return (
        <>
          <TableAction
            leftActionsRender={props.leftActionsRender}
            actionsRender={props.actionsRender}
            ctx={ctx}
          />
          {
            !!filterFields.length && (
              <div key={filterFields.length}  style={{marginTop:'-8px', height: '40px', display: 'flex', alignItems: 'center', overflow: 'hidden'}}>
                {
                  filterFields
                  .map(item => (
                    <Tag style={{padding: '3px 5px', backgroundColor:'#F7F8FB', border: '1px solid #CFCFD0', color: '#000000', height: '24px', lineHeight: '18px'}} closable onClose={() => {tableProps?.onCloseTag?.(item)}}>
                        {`${tableProps?.getFilterKeyLabel?.(item)}: ${tableProps?.getFilterValueLabel?.(item, filterValues[item])}`}
                        &nbsp;&nbsp;
                    </Tag>
                  ))
                }
              </div>
            )
          }
        </>
      );
    };
  }

  // =============== Column 级别 ===============
  const getColumns = (columns: ColumnProps[]): AColumnProps<any>[] => {
    return columns.map((column) => {
      const { children, key, sorter, filters } = column;

      const newColumn = {} as AColumnProps<any>;

      if (children) {
        newColumn.children = (getColumns(children) as unknown) as AColumnProps<any>['children'];
      } else {
        if (!column.hasOwnProperty('dataIndex')) {
          newColumn.dataIndex = key;
        }

        const sorterColumnKey = controls && controls.sorter ? controls.sorter.columnKey : '';
        if (sorter && sorterColumnKey === key) {
          newColumn.sortOrder = controls.sorter.order;
        }

        if ((filters && filters.length) || column.filterRender) {
          newColumn.filteredValue =
            controls && controls.filters ? controls.filters[key!] : undefined;
        }

        if (column.filterRender) {
          const filterOptions = triggerPlugin('filter', getCtx(), column.filterRender);
          assign(newColumn, filterOptions);
        }

        if (column.render) {
          newColumn.render = (text, record, index) => {
            const ctx = getCtx({
              text,
              record,
              index,
              history: configContext.history,
            });

            return triggerTableRowRenderPlugin(ctx, column.render);
          };
        }
      }

      return assign({}, column, newColumn);
    });
  };

  tableProps.columns = getColumns(tableProps.columns as ColumnProps[]);
  return (
    <React.Fragment>
      <div className={styles.bs_table_styl} style={{paddingTop: tableProps.title ? 0 : '16px', paddingBottom: tableProps?.pagination ? 0 : '16px'}}>
        {/* <img src={bgImg} /> */}
        <ATable {...tableProps} />
      </div>
      <ModalForm type="drawer" ref={drawerFormRef} />
      <ModalForm ref={modalFormRef} />
    </React.Fragment>
  );
};

const defaultPagination = {
  current: 1,
  pageSize: 10,
};

function parseTableControls(props: TableProps) {
  const selectedRowKeys = props.initialSelectedRowKeys;
  const dataSource = props.initialDataSource || [];
  if (props.initialPaging === false) {
    return {
      selectedRowKeys,
      dataSource,
    };
  }

  let pagination;
  if (isUndefined(props.initialPaging)) {
    pagination = assign({}, defaultPagination);
  } else if (props.initialPaging.pagination === false) {
    pagination = false;
  } else {
    pagination = assign({}, defaultPagination, props.initialPaging.pagination);
  }

  return assign({}, props.initialPaging, { pagination, selectedRowKeys, dataSource });
}

export default RefTable;
