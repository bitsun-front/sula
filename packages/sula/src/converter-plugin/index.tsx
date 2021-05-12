/*
 * @Author: your name
 * @Date: 2021-05-12 15:12:32
 * @LastEditTime: 2021-05-12 15:13:43
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \sula\packages\sula\src\converter-plugin\index.tsx
 */
import sula from '../core';

// 分页
sula.converterType('tableConvertType', (ctx: any, config: any) => {
  return {
    list: ctx?.data?.list,
    total: ctx?.data?.totalCount,
  };
});

sula.converterType('tableNoPageConvertType', (ctx: any, config: any) => {
  return {
    list: (ctx?.data && Array.isArray(ctx.data) && ctx?.data) || [],
  };
});
