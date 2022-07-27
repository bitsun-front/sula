import {  request } from '../index';


export function saveConditionToDatabase(conditionData: any, ConditionRequestConfig: any) {
  request({
    url: '/user/appConfig/saveUserConfig',
    method: 'POST',
    convertParams: () => {
      return {
        customCondition: JSON.stringify(conditionData),
      };
    },
    ...(ConditionRequestConfig?.saveConfig || {})
  })
}

export async function getConditionToDatabase (ConditionRequestConfig: any) {
  try {
    const response = await request({
      url: '/user/appConfig/getUserConfig',
      ...(ConditionRequestConfig?.getConfig || {})
    });
    return JSON.parse(response?.data?.customCondition || response?.customCondition || '{}')
  } catch (error) {}
}
