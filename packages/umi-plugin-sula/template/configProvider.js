/*
 * @Author: your name
 * @Date: 2021-05-12 11:28:54
 * @LastEditTime: 2021-05-12 11:31:11
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \sula\packages\umi-plugin-sula\template\configProvider.js
 */
import React from 'react';
import { ConfigProvider } from 'sula';
import { history, getLocale } from 'umi';

const baseSeparator = '{{{baseSeparator}}}' || '-';
const formatLangFile = (lang) => lang && lang.replace(baseSeparator, '_');

function getLocaleData () {
  let lang;
  try {
    lang = getLocale();
  } catch (error) {
    lang = '{{{default}}}' || `en${baseSeparator}US`;
  }
  const langFile = formatLangFile(lang);

  let locale;
  try {
    locale = require(`bssula/es/localereceiver/${langFile}`);
    locale = locale.default || locale;
  } catch (error) { }
  return locale;
}

export const rootContainer = (container) => {
  return (
    <ConfigProvider locale={getLocaleData()} history={history}>
      {container}
    </ConfigProvider>
  );
};
