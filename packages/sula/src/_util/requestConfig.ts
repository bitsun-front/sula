import {  request } from '../index';
import isObject from 'lodash/isObject';


export function saveConditionToDatabase(code: string, detail: any, ConditionRequestConfig: any) {
  request({
    url: '/user/appConfig/saveUserCondition',
    method: 'POST',
    convertParams: () => {
      return {
        code,
        detail: JSON.stringify(detail),
      };
    },
    ...(ConditionRequestConfig?.saveConfig || {})
  })
}

export async function getConditionToDatabase (code: string,ConditionRequestConfig: any) {
  try {
    const response = await request({
      url: `/user/appConfig/getUserCondition`,
      method: 'PATCH',
      convertParams: () => {
        return { code };
      },
      ...(ConditionRequestConfig?.getConfig || {}),
    });

    const resData = response?.data || response
    const handleResData = isObject(resData) ? '[]' : resData
    return JSON.parse(handleResData)
  } catch (error) {}
}
