import React from 'react';
import { Select, Tooltip } from 'antd';
import { request } from 'bssula';
import { debounce, uniqBy } from 'lodash';

export default class DropFilterSelect extends React.Component<any> {
  initSource = false;
  constructor(props: any) {
    super(props);
    this.state = {
      source: props.source || [],
      saveSearchVal: '',
    };
  }

  componentDidMount() {
    this.handleSearch('', true)
  }

  componentWillReceiveProps(nextProps: any) {
    
  }


  hasVal = (value: any) => {
    if (value == null || value === undefined || String(value).trim() === '') {
      return false;
    }
    return true;
  };


  handleSearch = (value: any, isMounted?: any) => {
    const {
      config,
      currentFormRef: {getFieldSource}
    } = this.props as any;
    if (value) {
      this.setState({
        saveSearchVal: value,
      });
    }
    if (!config.url && !config.isFormField) return;
    if (isMounted) {
      if (config.url) {
        this.getSelectSource(config, value);
      }
      let fieldSource = getFieldSource(config.tableHeadFilterKey) || [];
      this.setState({
        source: fieldSource
      })
    } else if (config.url && config.filter) {
      this.getSelectSource(config, value);
    }
  };

  getSelectSource = (config: any, value: string) => {
     // 需要默认传的参数
     const { otherParams } = config;
     request({
       url: config.url,
       method: 'get',
      //  headers: {
      //   'sso-sessionid': '987315074787315712_1_1_1',
      //  },
       convertParams: ({ params }: any) => {
         let reqParams = {};
         if (config.filter) {
           reqParams = {
             [config.filter]: value,
           };
         }
         return {
           pageSize: 500,
           ...otherParams,
           ...params,
           ...reqParams,
         };
       },
     }).then((res: any) => {
       let source = [];
       if (config.isMap) {
         source = Object.keys(res).map((d, i) => {
           return {
             text: Object.values(res)[i],
             value: d,
           };
         });
       } else {
         const keys = res.list ? 'list' : 'items';
         if (this.props.uniqBy) {
           res[keys] = uniqBy(res[keys], this.props.uniqBy);
         }
         source = res
           ? res[keys]
             ? res[keys].map((item: any) => {
               return {
                 text: item[config?.mappingTextField || 'name'],
                 value: item[config.mappingValueField || 'code'],
               };
             })
             : Array.isArray(res) &&
             res?.map((item: Record<string, any>) => {
               return {
                 text: item[config?.mappingTextField],
                 value: item[config.mappingValueField],
               };
             })
           : [];
       }
       this.setState({
         source: Array.isArray(source) ? source : [],
       });
     });
  }

  innerChange = (value) => {
    const { handleFieldsValueChange, column } = this.props;
    handleFieldsValueChange(value, column);
  }

  render() {
    const {
      value,
      placeholder,
      config,
      disabled,
      selectMuch,
      ...restProps
    } = this.props;

    const { source }: any = this.state;
    const { Option } = Select;
    return (
      <div style={{width: '260px', boxSizing: 'border-box', padding: '8px'}}>
        <Select
          style={{ width: '100%' }}
          showSearch
          value={value}
          allowClear
          placeholder={placeholder || '请选择'}
          onChange={this.innerChange}
          onSearch={
            config.filter ? debounce(this.handleSearch, 500) : () => { }
          }
          dropdownMatchSelectWidth={true}
          dropdownClassName="dropdownClassName"
          // mode={selectMuch ? 'multiple' : undefined}
          mode={'multiple'}
          // showArrow={true}
          filterOption={(input: any, option: any) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          {...restProps}
        >
          {source.map((item: any) => {
            return (
              <Option key={item.value} value={item.value}>
                {item.text}
              </Option>
            );
          })}
        </Select>
      </div>
    );
  }
}