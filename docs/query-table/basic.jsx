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
      },
      converter({ data }) {
        return {
          list: data.results.map((item, index) => {
            return {
              ...item,
              id: `${index}`,
              name: `${item.name.first} ${item.name.last}`,
            };
          }),
          total: 100,
        };
      },
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