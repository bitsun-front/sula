/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/*
 * @Author: your name
 * @Date: 2021-04-09 22:40:01
 * @LastEditTime: 2021-05-12 15:08:27
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \yingzi-web-psc-sellerconsole\src\sula\customerPlugin\converterParams\index.tsx
 */
import sula from '../core';
import moment from 'moment';

// 判断值是否为空
const isValidateValue = (value: any) => {
  if (value == null || value === undefined || String(value).trim() == '') {
    return false;
  }
  return true;
};
// tableConvertParamsType
sula.convertParamsType('tableConvertParamsType', (ctx: any, config: any) => {
  const initialParams = config.initialParams || {};
  const initialValues = config.initialValues || {};
  const params = { ...ctx.params.filters };
  // 数组对象处理,对带有特殊标记的name进行处理
  // eslint-disable-next-line no-restricted-syntax
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const element = params[key];
      if (element && key.indexOf('*number*') >= 0) {
        const dataParams = key.split('*number*');
        dataParams.forEach((value, index) => {
          params[value] = element[index];
        });
        delete params[key];
      } else if (element && key.indexOf('*address*') >= 0) {
        const dataParams = key.split('*address*');
        dataParams.forEach((value, index) => {
          params[value] = element.PCDCode[index];
        });
        delete params[key];
      } else if (element && key.indexOf('*costType*') >= 0) {
        const dataParams = key.split('*costType*');
        // eslint-disable-next-line prefer-destructuring
        params[dataParams[0]] = element[1];
        delete params[key];
      } else if (element && key.indexOf('*fullDate*') >= 0) {
        const dataParams = key.split('*fullDate*');
        dataParams.forEach((value, index) => {
          if (index == 0) {
            params[value] = moment(element[index])
              .millisecond(0)
              .second(0)
              .minute(0)
              .hour(0)
              .format('YYYY-MM-DD HH:mm:ss');
          } else {
            params[value] = moment(element[index])
              .millisecond(59)
              .second(59)
              .minute(59)
              .hour(23)
              .format('YYYY-MM-DD HH:mm:ss');
          }
        });
        delete params[key];
      } else if (element && key.indexOf('*') >= 0) {
        const dataParams = key.split('*');
        dataParams.forEach((value, index) => {
          params[value] = element[index].format('YYYY-MM-DD HH:mm:ss');
        });
        delete params[key];
      } else if (Array.isArray(element)) {
        params[key] = element.join(',');
      }
    }
  }

  const finalParams: any = {};
  for (const key in params) {
    if (isValidateValue(params[key])) {
      finalParams[key] = params[key];
    }
  }
  // 排序动作触发
  // let sorter;
  // if (Object.keys(ctx.params.sorter).length) {
  //   if (ctx.params.sorter['order'] == 'ascend') {
  //     sorter = `asc-${ctx.params.sorter.columnKey}`;
  //   } else if (ctx.params.sorter['order'] == 'descend') {
  //     sorter = `desc-${ctx.params.sorter.columnKey}`;
  //   }
  // }

  return {
    ...initialValues,
    ...initialParams,
    pageSize: ctx.params.pageSize,
    currentPage: ctx.params.current,
    ...finalParams,
    // sorter,
  };
});
