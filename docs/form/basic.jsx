import React from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Form } from 'sula';

const initialSource = [
  {
    text: '苹果 🍎',
    value: 'apple',
  },
  {
    text: '桃子 🍑',
    value: 'peach',
  },
  {
    text: '西瓜 🍉',
    value: 'watermelon',
    disabled: true,
  },
];

const cascaderSource = [
  {
    value: 'fruits',
    text: '水果',
    children: initialSource,
  },
];

export default class BasicDemo extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <Form
        mode="create"
        initialValues = {{
          treeselect: 'apple',
          cascader: ['fruits', 'peach']
        }}
        // remoteValues={{
        //   url: 'https://www.mocky.io/v2/5ed7a8b63200001ad9274ab5',
        //   method: 'post',
        //   converter() {
        //     return { radiogroup: 'peach' };
        //   },
        // }}
        onRemoteValuesStart={() => {
          console.log('onRemoteValuesStart');
        }}
        onFinish={(values) => {
          console.log('Success:', values);
        }}
        fields={[
          { name: 'input', label: 'input', field: 'input' },
          {
            name: 'inputnumber',
            label: 'inputnumber',
            field: {
              type: 'inputnumber',
              props: {
                style: {
                  width: 300,
                },
              },
            },
          },
          {
            name: 'checkbox',
            label: 'checkbox',
            field: 'checkbox',
            valuePropName: 'checked',
          },
          {
            name: 'password',
            label: 'password',
            field: {
              type: 'password',
              props: {
                // viewPageEdit: true,
              }
            },
          },
          {
            name: 'textarea',
            label: 'textarea',
            field: 'textarea',
          },
          {
            name: 'radio',
            label: 'radio',
            field: 'radio',
            valuePropName: 'checked',
          },
          {
            name: 'switch',
            label: 'switch',
            field: 'switch',
            valuePropName: 'checked',
          },
          {
            name: 'bitsun-numberRange',
            label: 'bitsun-numberRange',
            field: 'bitsun-numberRange',
            // field: {
            //   type: 'bitsun-searchSelect',
            //   props: {
            //     requestConfig: {
            //       url: `/api/advertisingArea/getAdvertisingAreaList`,
            //       filter: 'qp-areaName-like',
            //       mappingTextField: 'areaName',
            //       mappingValueField: 'id',
            //     },
            //   },
            // },
            initialSource,
          },
          {
            name: 'bitsun-uploadList',
            label: 'bitsun-uploadList',
            field: 'bitsun-uploadList',
          },
          {
            name: 'cascader',
            label: 'cascader',
            field: 'cascader',
            initialSource: cascaderSource,
          },
          {
            name: 'treeselect',
            label: 'treeselect',
            field: 'treeselect',
            initialSource: cascaderSource,
          },
          {
            name: 'checkboxgroup',
            label: 'checkboxgroup',
            field: 'checkboxgroup',
            initialSource,
            initialValue: ['peach'], // antd 4.2.0开始支持
          },
          {
            name: 'radiogroup',
            label: 'radiogroup',
            field: 'radiogroup',
            initialSource,
          },
          {
            name: 'slider',
            label: 'slider',
            field: 'slider',
          },
          {
            name: 'rate',
            label: 'rate',
            field: 'rate',
          },
          {
            name: 'timepicker',
            label: 'timepicker',
            field: {
              type: 'timepicker',
              props: {
                valueFormat: 'utc',
              },
            },
          },
          {
            name: 'datepicker',
            label: 'datepicker',
            field: {
              type: 'datepicker',
              props: {
                valueFormat: 'utc',
                format: 'YYYY-MM-DD HH:mm',
              },
            },
          },
          {
            name: 'rangepicker',
            label: 'rangepicker',
            field: {
              type: 'rangepicker',
              props: {
                valueFormat: 'utc',
              },
            },
          },
          {
            name: 'upload',
            label: 'upload',
            field: {
              type: 'upload',
              props: {
                request: {
                  url: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
                  params: {
                    name: 'sula',
                  },
                  converter: (ctx) => {
                    // 可以访问ctx
                    return ctx.data;
                  },
                },
                multiple: true,
                children: <Button icon={<UploadOutlined />}>Click to upload</Button>,
              },
            },
            valuePropName: 'fileList',
          },
          {
            label: ' ',
            colon: false,
            render: {
              type: 'button',
              props: {
                htmlType: 'submit',
                type: 'primary',
                children: 'submit',
              },
            },
          },
        ]}
      />
    );
  }
}
