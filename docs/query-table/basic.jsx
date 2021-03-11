import React from 'react';
import { QueryTable } from 'bssula';

export default () => {
  const config = {
    remoteDataSource: {
      url: 'https://randomuser.me/api',
      method: 'GET',
      convertParams({ params }) {
        return {
          results: params.pageSize,
          ...params,
        };
      }),
      total: 100,
    };
  },
};

export const columns = [
  {
    title: '序号',
    key: 'index',
  },
  {
    title: '国家',
    key: 'nat',
  },
  {
    title: '名字',
    key: 'name',
    ellipsis: true,
    width: 200,
  },
  {
    title: '年龄',
    key: 'age',
    render: (ctx) => {
      return <span>{ctx.record.registered.age}</span>;
    },
    layout: 'vertical',
    fields: [
      {
        name: 'name',
        label: '姓名',
        field: 'input',
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
      <QueryTable {...config} />
    </div>
  );
};