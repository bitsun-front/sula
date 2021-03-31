import React from 'react';
import DownOutlined from '@ant-design/icons/DownOutlined';
import cx from 'classnames';
import { getItemSpan } from '../form/utils/layoutUtil';
import FieldGroupContext from '../form/FieldGroupContext';
import { FieldGroup, Field, FormAction, FieldProps, FormInstance } from '../form';
import './style/query-fields.less';
import LocaleReceiver from '../localereceiver';
import { ItemLayout, Layout } from '../form/FieldGroup';

interface QueryFieldsProps {
  fields: FieldProps[];
  visibleFieldsCount: number | true;
  itemLayout: ItemLayout;
  layout: Layout;
  getFormInstance: () => FormInstance;
  hasActionsRender: boolean;
}

export default class QueryFields extends React.Component<QueryFieldsProps> {
  static contextType = FieldGroupContext;

  static defaultProps = {
    visibleFieldsCount: 5,
    fields: [],
  };

  state = {
    collapsed: true,
  };

  getVisibleFieldsCount = () => {
    if (this.props.visibleFieldsCount === true) {
      return this.props.fields.length;
    }

    return this.props.visibleFieldsCount;
  };

  renderFields = () => {
    const { fields, itemLayout } = this.props;

    const { matchedPoint } = this.context;

    const fieldsNameList = [];

    let allSpan = 0;
    let visibleAllSpan = 0;

    const visibleFieldsCount = this.getVisibleFieldsCount();

    const finalFields = fields.map((field, index) => {
      fieldsNameList.push(field.name);
      const isVisible = index < visibleFieldsCount;
      const itemSpan = getItemSpan(itemLayout, matchedPoint, field.itemLayout);
      allSpan += itemSpan;
      if (isVisible) {
        visibleAllSpan += itemSpan;
      }
      return <Field {...field} initialVisible={isVisible} key={field.name} />;
    });
    this.expandSpan = 24 - (allSpan % 24);
    this.collapseSpan = 24 - (visibleAllSpan % 24);

    return finalFields;
  };

  hasMoreQueryFields() {
    const visibleFieldsCount = this.getVisibleFieldsCount();
    return visibleFieldsCount < this.props.fields.length;
  }

  updateVisibleFields() {
    const { getFormInstance, fields } = this.props;
    const formInstance = getFormInstance();

    const visibleFieldsCount = this.getVisibleFieldsCount();

    fields.forEach((field, index) => {
      if (index >= visibleFieldsCount) {
        formInstance.setFieldVisible(field.name, !this.state.collapsed);
      }
    });
  }

  renderFormAction = (locale) => {
    const { layout } = this.props;
    const { collapsed } = this.state;
    const actionsRender = [
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
      ...(this.hasMoreQueryFields()
        ? [
            {
              type: () => (
                <a>
                  <span>{collapsed ? locale.expandText : locale.collapseText}</span>
                  <DownOutlined
                    style={{
                      transition: '0.3s all',
                      transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
                    }}
                  />
                </a>
              ),
              action: () => {
                this.setState(
                  {
                    collapsed: !collapsed,
                  },
                  () => {
                    this.updateVisibleFields();
                  },
                );
              },
            },
          ]
        : []),
    ];

    const finalSpan = this.state.collapsed ? this.collapseSpan : this.expandSpan;
    const layoutProps = {} as any;

    if (finalSpan === 24) {
      layoutProps.actionsPosition = 'right';
      layoutProps.style = {
        marginBottom: 24,
      };
    } else {
      layoutProps.style = {
        display: 'flex',
        justifyContent: 'flex-end',
        ...(layout === 'vertical' ? { marginTop: 30 } : {}),
      };
    }

    return (
      <FormAction
        itemLayout={{
          span: finalSpan,
        }}
        {...layoutProps}
        actionsRender={actionsRender}
      />
    );
  };

  render() {
    const { hasActionsRender } = this.props;
    return (
      <LocaleReceiver>
        {(locale) => {
          return (
            <FieldGroup
              container={{
                type: 'div',
                props: {
                  className: cx(`sula-template-query-table-fields-wrapper`, {
                    [`sula-template-query-table-fields-divider`]: hasActionsRender,
                  }),
                },
              }}
            >
              {this.renderFields()}
              {this.renderFormAction(locale)}
            </FieldGroup>
          );
        }}
      </LocaleReceiver>
    );
  }
}
