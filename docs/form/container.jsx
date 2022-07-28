import React from 'react';
import { Form } from 'sula';

export default class FieldContainer extends React.Component {
  render() {
    return (
      <Form
        isFormPage={true}
        mode='create'
        initialValues={{
          input2: 'hyhAAAAAAAAAAAAAAAA'
        }}
        formStatusMapping={[
          {
            text: '状态1',
            value: 1
          },
          {
            text: '状态2',
            value: 2
          },
          {
            text: '状态3',
            value: 3
          },
          {
            text: '状态4',
            value: 4
          },
          
        ]}
        fields={[
          {
            container: {
              type: 'card',
              props: {
                title: '外层容器1',
                level: 1,
                id: 'test111',
              },
            },
            fields: [
              {
                container: {
                  type: 'card',
                  props: {
                    title: '二层container1',
                    level: 2,
                  },
                },
                fields: [
                  {
                    label: '输入框container1',
                    name: 'input1',
                    field: 'select',
                    initialSource: [
                      {
                        text: 'aaa',
                        value: 'aaa'
                      }
                    ]
                  },
                  {
                    label: '输入框输入框container1',
                    name: 'input2',
                    field: 'input',
                  },
                ]
              },
              {
                container: {
                  type: 'card',
                  props: {
                    title: '二层container2',
                    level: 2,
                  },
                },
                fields: [
                  {
                    label: '输入框container2',
                    name: 'input1',
                    field: 'input',
                  },
                  {
                    label: '输入框container2',
                    name: 'input2',
                    field: 'input',
                  },
                ]
              }
            ]
          },
          {
            container: {
              type: 'card',
              props: {
                title: '外层容器2',
                level: 1,
                id: 'test222',
              },
            },
            fields: [
              {
                container: {
                  type: 'card',
                  props: {
                    title: '二层container1',
                    level: 2,
                  },
                },
                fields: [
                  {
                    label: '输入框container1',
                    name: 'input1',
                    field: 'input',
                  },
                  {
                    label: '输入框输入框container1',
                    name: 'input2',
                    field: 'input',
                  },
                ]
              },
              {
                container: {
                  type: 'card',
                  props: {
                    title: '二层container2',
                    level: 2,
                  },
                },
                fields: [
                  {
                    label: '输入框container2',
                    name: 'input1',
                    field: 'input',
                  },
                  {
                    label: '输入框container2',
                    name: 'input2',
                    field: 'input',
                  },
                ]
              }
            ]
          },
        ]}
      />
    );
  }
}
