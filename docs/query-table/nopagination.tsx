import React from 'react';
import { QueryTable } from 'sula';
import { UserOutlined } from '@ant-design/icons';

const queryFields: QueryTableProps['fields'] = [
  {
    name: 'nat',
    label: '国家国家国',
    initialSource: [
      {
        text: '国家A',
        value: '0001'
      },
      {
        text: '国家B',
        value: '0002'
      },
      {
        text: '国家C',
        value: '0003'
      },
      {
        text: '国家D',
        value: '0004'
      },
    ],
    field: 'select',
  },
  {
    name: 'name',
    label: '国家国家国',
    initialSource: [
      {
        text: 'name1',
        value: '0001'
      },
      {
        text: 'name2',
        value: '0002'
      },
      {
        text: 'name3',
        value: '0003'
      },
      {
        text: 'name4',
        value: '0004'
      },
    ],
    field: {
      type: 'select',
      props: {
        mode: 'multiple',
      }
    },
  },
  {
    name: 'qp-createUserName-eq',
    label: '制单人',
    field:{
      type: 'bs-searchSelect',
      props: {
        requestConfig: {
          url: `http://bitsun.cb21419868b8b483f9e04b769406afe73.cn-shanghai.alicontainer.com/drp-ops/employee`,
          filter: 'qp-name-like',
          otherParams:{
            enable:10
          },
          mappingTextField: 'name',
          mappingValueField: 'name',
        },
      },
    },
  },
  {
    name: 'qp-settlementCompanyCode-eq',
    label: '销售组织',
    field: {
      type: 'select',
      props: {
        allowClear: true,
        showSearch: true,
        filterOption: (input: any, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      },
    },
    remoteSource: {
      url: 'http://bitsun.cb21419868b8b483f9e04b769406afe73.cn-shanghai.alicontainer.com/drp-ops/orgViewNode/listNoPage?qp-orgViewCode-eq=sales-organizational-view',
      headers: {
        'sso-sessionid': '987315074787315712_1_1_1',
       },
      converter: ({ data }: any) =>
        data.map((i: any) => ({
          text: i.name,
          value: i.code,
        })),
    },
  },
  {
    name: 'age',
    label: '年龄',
    field: 'input',
  },
  {
    name: 'age1',
    label: '年龄',
    field: 'input',
  },
  {
    name: 'age2',
    label: '年龄',
    field: 'input',
  },
  {
    name: 'age3',
    label: '年龄',
    field: 'input',
  },
  {
    name: 'age4',
    label: '年龄',
    field: 'input',
  },
  {
    name: 'age15',
    label: '年龄',
    field: 'input',
  },
  {
    name: 'age6',
    label: '年龄',
    field: 'input',
  },
];

export const remoteDataSource = {
  url: 'https://randomuser.me/api',
  method: 'GET',
  convertParams({ params }) {
    return {
      results: 20,
      ...params,
    };
  },
  converter({ data }) {
    return data.results.map((item, index) => {
      return {
        ...item,
        id: `${index}`,
        name: `${item.name.first} ${item.name.last}`,
        index,
      };
    });
  },
};

export const columns = [
  {
    title: '序号',
    key: 'index',
    sorter: true,
  },
  {
    title: '国家',
    key: 'nat',
    tableHeadFilterKey: 'nat',
    customerDropFilterProps: {
      type: 'radio',
      customerFilterOptions: [
        {
          label: '选项一',
          value: 1
        },
        {
          label: '选项二',
          value: 2
        },
        {
          label: '选项三',
          value: 3
        },
        {
          label: '选项四',
          value: 4
        },
      ]
    }
  },
  {
    title: '名字',
    key: 'name',
    copyable: true,
    ellipsis: true,
    tableHeadFilterKey: 'name',
    customerDropFilterProps: {
      customerFilterOptions: [
        {
          label: 'name1',
          value: '0001'
        },
        {
          label: 'name2',
          value: '0002'
        },
        {
          label: 'name3',
          value: '0003'
        },
        {
          label: 'name4',
          value: '0004'
        },
      ],
      type: 'checkbox',
    },
    width: 200,
  },
  {
    title: '年龄',
    key: 'age',
    tableHeadFilterKey: 'age',
    customerDropFilterProps: {
      type: 'input'
    },
    render: (ctx) => {
      return <span>{ctx.record.registered.age}</span>;
    },
  },
  {
    title: '制单人',
    key: 'user',
    tableHeadFilterKey: 'qp-createUserName-eq'
  },
  {
    title: '销售组织',
    key: 'tesaaaa',
    tableHeadFilterKey: 'qp-settlementCompanyCode-eq'
  },
  {
    title: '操作',
    key: 'operation',
    width: 300,
    render: [
      {
        confirm: '是否删除？',
        type: 'link',
        props: {
           children: '测试',
           icon: <UserOutlined />,    
        },
      },
      {
        confirm: '是否删除？',
        type: 'link',
        props: {
          children: '测试',
          icon: <UserOutlined />, 
        },
      },
      {
        confirm: '是否删除？',
        type: 'link',
        props: {
          children: '测试'
        },
        action: [
          {
            type: 'request',
            url: 'https://www.mocky.io/v2/5185415ba171ea3a00704eed',
            method: 'POST',
            params: {
              id: '#{record.id}',
            },
            successMessage: '删除成功',
          },
          'refreshTable',
        ],
      },
      {
        confirm: '是否删除？',
        type: 'link',
        props: {
          children: '测试'
        },
        action: [
          {
            type: 'request',
            url: 'https://www.mocky.io/v2/5185415ba171ea3a00704eed',
            method: 'POST',
            params: {
              id: '#{record.id}',
            },
            successMessage: '删除成功',
          },
          'refreshTable',
        ],
      },
      {
        confirm: '是否删除？',
        type: 'link',
        props: {
          children: '测试'
        },
        action: [
          {
            type: 'request',
            url: 'https://www.mocky.io/v2/5185415ba171ea3a00704eed',
            method: 'POST',
            params: {
              id: '#{record.id}',
            },
            successMessage: '删除成功',
          },
          'refreshTable',
        ],
      },
    ],
  },
];

const actions = [
  {
    type: 'button',
    disabled: (ctx) => {
      const selectedRowKeys = ctx.table.getSelectedRowKeys();
      return !(selectedRowKeys && selectedRowKeys.length);
    },
    props: {
      type: 'primary',
      children: '批量注册',
    },
    action: [
      {
        type: 'modalform',
        title: '信息',
        resultPropName: 'modalform', // 加入results
        fields: [
          {
            name: 'name',
            label: '名称',
            field: 'input',
          },
        ],
        submit: {
          url: 'https://www.mocky.io/v2/5185415ba171ea3a00704eed',
          method: 'POST',
          convertParams: (ctx) => {
            const uuids = ctx.table.getSelectedRows().map((item) => item.login.uuid);
            return {
              ...ctx.params,
              uuids,
            };
          },
        },
      },
      (ctx) => {
        console.log('result', ctx.result);
        console.log('results', ctx.results);
      },
      'refreshTable',
    ],
  },
];

export default class BasicDemo extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div style={{ background: 'rgb(241, 242, 246)', padding: 16, marginTop: 16 }}>
        <QueryTable
          isHorizontally={false}
          statusMapping={[
            {
              label: '全部',
              key: 'status',
              value: undefined
            },
            {
              label: '状态1',
              key: 'status',
              value: 1
            },
            {
              label: '状态2',
              key: 'status',
              value: 2
            },
            {
              label: '状态3',
              key: 'status',
              value: 3
            }
          ]}
          layout="horizontal"
          visibleFieldsCount={3}
          columns={columns}
          remoteDataSource={remoteDataSource}
          fields={queryFields}
          rowKey="id"
          actionsRender={actions}
          tableProps={{
            initialPaging: {
              pagination: false,
            },
          }}
        />
      </div>
    );
  }
}
