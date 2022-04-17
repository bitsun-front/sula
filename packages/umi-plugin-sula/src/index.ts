/*
 * @Description: 
 * @Author: rodchen
 * @Date: 2021-02-23 11:19:45
 * @LastEditTime: 2021-02-24 10:56:49
 * @LastEditors: rodchen
 */
import { join } from 'path';
import { IApi } from 'umi';
import { readFileSync, writeFileSync } from 'fs';

export default function (api: IApi) {
  api.describe({
    key: 'bstempsula',
    config: {
      schema(joi) {
        return joi.object({
          locale: joi.object({
            default: joi.string(),
            baseNavigator: joi.boolean(),
            baseSeparator: joi.string(),
          }),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(() => {
    const { locale = {} } = api.config.bstempsula;
    const configProviderTpl = readFileSync(
      join(__dirname, '../template/configProvider.js'),
      'utf-8',
    );
    const configProviderWrapperPath = join(api.paths.absTmpPath, 'SulaConfigProviderWrapper.js');
    writeFileSync(
      configProviderWrapperPath,
      api.utils.Mustache.render(configProviderTpl, locale),
      'utf-8',
    );
  });

  api.addRuntimePlugin(() => join(api.paths.absTmpPath, './SulaConfigProviderWrapper.js'));

  api.addEntryCodeAhead(() =>
    `
import { registerFieldPlugins, registerRenderPlugins, registerActionPlugins, registerFilterPlugins } from 'bstempsula';
registerFieldPlugins();
registerRenderPlugins();
registerActionPlugins();
registerFilterPlugins();
`.trim(),
  );
}
