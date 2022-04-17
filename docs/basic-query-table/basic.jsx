import React from 'react';
import { BasicQueryTable } from 'bstempsula';
import { remoteDataSource } from './utils';

export default () => {
  const config = {
    remoteDataSource,
    actionsRender: [
      {
        type: 'button',
        props: {
          type: 'primary',
          children: '新建',
        },
      },
      {
        type: 'button',
        props: {
          type: 'primary',
          children: '添加XX',
        },
      },
      {
        type: 'button',
        props: {
          type: 'primary',
          children: '操作按钮',
        },
      },
      {
        type: 'button',
        disabled: (ctx) => {
          const selectedRowKeys = ctx.table.getSelectedRowKeys() || [];
          return !selectedRowKeys.length;
        },
        props: {
          children: '批量删除',
          type: 'primary',
        },
        action: [
          (ctx) => {
            console.log(ctx.table.getSelectedRowKeys(), '批量删除');
          },
        ],
      },
      {
        type: 'button',
        disabled: (ctx) => {
          const selectedRowKeys = ctx.table.getSelectedRowKeys() || [];
          return !selectedRowKeys.length;
        },
        props: {
          children: '批量发布',
          type: 'primary',
        },
        action: [
          (ctx) => {
            console.log(ctx.table.getSelectedRowKeys(), '批量发布');
          },
        ],
      },
    ],
    rowSelection: {},
    fields: [
      {
        name: 'name',
        label: '',
        field: {
          type: 'input',
          props: {
            placeholder: '账户名称'
          }
        },
      },
      {
        name: 'nat',
        label: '',
        field: {
          type: 'input',
          props: {
            placeholder: '请输入'
          }
        },
      },
      {
        name: 'gender',
        label: '',
        field: {
          type: 'input',
          props: {
            placeholder: '请输入'
          }
        },
      },
      {
        name: 'id',
        label: '',
        field: {
          type: 'input',
          props: {
            placeholder: '请输入'
          }
        },
      },
    ],
    columns: [
      {
        key: 'id',
        title: 'ID',
      },
      {
        key: 'name',
        title: '姓名',
      },
      {
        key: 'nat',
        title: '国家',
      },
      {
        key: 'gender',
        title: '性别',
        render: ({ text }) => {
          return text === 'male' ? '男' : '女';
        },
      },
      {
        key: 'email',
        title: '邮箱',
      },
    ],
    rowKey: 'id',
  };
  return (
    <div
      style={{ background: 'rgb(241, 242, 246)', padding: 16, marginTop: 16 }}
    >
      <BasicQueryTable {...config} />
    </div>
  );
};
