import React from 'react';
import { ConfigProvider } from 'bistun-sula';
import { history } from 'umi';

const baseSeparator = '{{{baseSeparator}}}' || '-';
const formatLangFile = (lang) => lang && lang.replace(baseSeparator, '_');

function getLocale() {
  const lang = '{{{default}}}' || `en${baseSeparator}US`;
  const langFile = formatLangFile(lang);

  let locale;
  try {
    locale = require(`bistun-sula/es/localereceiver/${langFile}`);
    locale = locale.default || locale;
  } catch (error) {}
  return locale;
}

export const rootContainer = (container) => {
  return (
    <ConfigProvider locale={getLocale()} history={history}>
      {container}
    </ConfigProvider>
  );
};
