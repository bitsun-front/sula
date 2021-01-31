import { NameListMap } from '../../_util/NameListMap';
import { FieldNameList, FieldNamePath } from '../../types/form';
import {
  TransedDependency,
  TransedDependencies,
  Dependencies,
  DependencyType,
  Dependency,
} from '../../types/dependency';
import { toArray } from '../../_util/common';
import assign from 'lodash/assign';
import isUndefined from 'lodash/isUndefined';
import isObject from 'lodash/isObject';
import isEqual from 'lodash/isEqual';
import { triggerPlugin, triggerActionPlugin } from '../../rope/triggerPlugin';

export default class DepStore {
  public getName: (name: FieldNamePath) => FieldNameList = null!;

  // 主动触发配置
  public depsByFieldNameList: NameListMap<FieldNameList, TransedDependencies> = new NameListMap();

  public parse(
    fieldConfig: any,
    deps: Dependencies,
    getName?: (name: FieldNamePath) => FieldNameList,
  ) {
    const fieldNameList: FieldNameList = getName
      ? getName(fieldConfig.name as FieldNamePath)
      : toArray(fieldConfig.name);
    Object.keys(deps).forEach((type) => {
      const dependency: Dependency = deps[type as DependencyType];
      const { cases, ...globalDep } = dependency;

      if (cases) {
        cases.forEach((kase, index) => {
          const finalDep: Dependency = assign({}, globalDep, kase);
          this.parseCase(fieldNameList, type, finalDep, fieldConfig, getName, index);
        });
      } else {
        this.parseCase(fieldNameList, type, globalDep, fieldConfig, getName);
      }
    });
  }

  private parseCase(
    fieldNameList: FieldNameList,
    type: DependencyType,
    dependency: Dependency,
    fieldConfig: any,
    getName: (name: FieldNamePath) => FieldNameList,
    caseIndex?: number,
  ) {
    const {
      relates,
      inputs,
      output,
      defaultOutput,
      ignores,
      type: depPlugin,
      autoResetValue,
    } = dependency;

    const relatedFieldNameLists: FieldNameList[] = relates.map((relate) =>
      getName ? getName(relate) : toArray(relate),
    );

    // 被动配置变主动
    relatedFieldNameLists.forEach((relatedFieldNameList) => {
      if (!this.depsByFieldNameList.get(relatedFieldNameList)) {
        this.depsByFieldNameList.set(relatedFieldNameList, Object.create(null));
      }

      // 变为主动存储
      const transedDependency: TransedDependency = {
        name: fieldNameList,
        type: depPlugin,
        relates: relatedFieldNameLists,
        ignores: normalizeIgnores(ignores, relatedFieldNameLists.length),
        inputs,
        output,
        defaultOutput,
        autoResetValue: autoResetValue !== false,
        ...(type === 'source' ? { remoteSource: fieldConfig.remoteSource } : {}),
      };

      if (this.depsByFieldNameList.get(relatedFieldNameList)[type]) {
        if (!isUndefined(caseIndex)) {
          if (caseIndex === 0) {
            this.depsByFieldNameList.get(relatedFieldNameList)[type].push([transedDependency]);
          } else {
            const depsOfType = this.depsByFieldNameList.get(relatedFieldNameList)[type];
            const lastDepOfType = depsOfType[depsOfType.length - 1];
            lastDepOfType.push(transedDependency);
          }
        } else {
          this.depsByFieldNameList.get(relatedFieldNameList)[type].push([transedDependency]);
        }
      } else {
        this.depsByFieldNameList.get(relatedFieldNameList)[type] = [[transedDependency]];
      }
    });
  }

  public triggerDependency(ctx, depsOfType: TransedDependencies, cascadePayload) {
    const { form } = ctx;

    Object.keys(depsOfType).forEach((type) => {
      const allDeps: TransedDependency[][] = depsOfType[type as DependencyType];

      allDeps.forEach((deps) => {
        for (let i = 0, len = deps.length; i < len; i += 1) {
          const isLastCase = i === deps.length - 1;
          const dep = deps[i];
          const {
            name: affectedFieldNameList,
            relates,
            inputs,
            ignores,
            output,
            defaultOutput,
            type: depPlugin,
            autoResetValue,
          } = dep;

          if (type === 'value') {
            // 如果受影响的fieldName在主动设置store里则不出值关联
            const isWilling = isWillingSetValue(affectedFieldNameList, cascadePayload);
            if (isWilling) {
              return true;
            }
          }

          const values = relates.map((relatedFieldNameList) => {
            return form.getFieldValue(relatedFieldNameList);
          });

          if (depPlugin) {
            if (type === 'source' && !autoResetValue) {
              clearValueForSourceDependency(affectedFieldNameList, ctx, cascadePayload);
            }

            const depPluginCtx = assign({}, ctx, {
              name: affectedFieldNameList,
              values,
              relates,
            });

            const isMatched = triggerPlugin('dependency', depPluginCtx, dep);

            // 如果显示返回false则表示匹配失败
            if (isMatched !== false) {
              return;
            }
          }

          let fn;

          if (type === 'source') {
            fn = autoResetValue
              ? (_name: FieldNameList, _source: any) => {
                  clearValueForSourceDependency(_name, ctx, cascadePayload);
                  form.setFieldSource(_name, _source);
                }
              : form.setFieldSource;
          } else if (type === 'disabled') {
            fn = form.setFieldDisabled;
          } else if (type === 'visible') {
            fn = form.setFieldVisible;
          } else {
            fn = form.setFieldValue;
          }

          const isIgnored = singleMatch(ignores, values);
          if (isIgnored) {
            if (isLastCase) {
              fn(affectedFieldNameList, defaultOutput);
            }

            // 如果忽略但非最后一个case则跳过
            continue;
          }

          /**
           * 远程数据源关联只执行一个case
           */
          if (type === 'source' && !inputs && dep.remoteSource) {
            return this.cascadeSource(ctx, dep, cascadePayload);
          }

          const isAllMatched = inputs && allMatch(inputs, values);
          // 第一个匹配的终止
          if (isAllMatched) {
            fn(affectedFieldNameList, output);
            return;
          }

          // 均为匹配到，且是最后一个case，使用defaultOutput
          if (isLastCase) {
            fn(affectedFieldNameList, defaultOutput);
          }
        }
      });
    });
  }

  private cascadeSource(ctx, dep: TransedDependency, cascadePayload) {
    const { form } = ctx;

    const { name, relates, remoteSource, autoResetValue } = dep;

    if (dep.inputs || dep.type) return; // 非远程数据源场景

    const fetchDepInfo = relates.reduce((memo, relatedFieldNameList: FieldNameList) => {
      const value = form.getFieldValue(relatedFieldNameList);
      memo[relatedFieldNameList.join('.')] = value;
      return memo;
    }, {});

    return triggerActionPlugin(
      ctx,
      assign({}, remoteSource, { params: assign({}, remoteSource.params, fetchDepInfo) }),
    ).then((source: any) => {
      autoResetValue && clearValueForSourceDependency(name, ctx, cascadePayload);
      form.setFieldSource(name, source);
    });
  }
}

function clearValueForSourceDependency(fieldNameList: FieldNameList, ctx, cascadePayload) {
  const { form } = ctx;
  const isWilling = isWillingSetValue(name, cascadePayload);
  if (!isWilling) {
    form.setFieldValue(fieldNameList, undefined);
  }
}

function isWillingSetValue(fieldNameList, cascadePayload) {
  const { cascadeTrigger, cascadeStore } = cascadePayload;

  const isWilling =
    (cascadeTrigger === 'setFieldsValue' || cascadeTrigger === 'setFields') &&
    hasOwnPropWithNameList(fieldNameList, cascadeStore);

  return isWilling;
}

/**
 * 不清空 - (ctx.cascadeTrigger === setFieldsValue || setFields) && values.hasOwnProperty(x);
 * 否则清空
 */
export function hasOwnPropWithNameList(fieldNameList: FieldNameList, payload) {
  const len = fieldNameList.length;
  let recurValue = payload;
  for (let i = 0; i < len; i += 1) {
    const namePath = fieldNameList[i];
    if (isObject(recurValue) && recurValue.hasOwnProperty(namePath)) {
      recurValue = recurValue[name];
    } else {
      // 提前退出
      return false;
    }
  }
  return true;
}

// ==================== 匹配inputs / ignores ====================
/**
 * @inputs: [[1,2], [2,3]]
 * @values: [1,4]
 * @result: true
 */
export function singleMatch(inputs, values) {
  return inputs.some((input, index) => equal(input, values[index]));
}

/**
 * @rules: [[1,2], [2,3]]
 * @values: [1,4]
 * @result: false
 */
export function allMatch(inputs, values) {
  return !inputs.some((input, index) => !equal(input, values[index]));
}

/**
 *
 * @inputs [1,2]
 * @value 1
 * @return true
 */
export function equal(inputs, value) {
  if (inputs === '*') {
    return true;
  }
  for (let i = 0, len = inputs.length; i < len; i += 1) {
    const input = inputs[i];
    if (isEqual(input, value)) {
      return true;
    }
  }

  return false;
}

function normalizeIgnores(ignores: any[][] | undefined, num: number) {
  if (!ignores) {
    return fill(num, [undefined]);
  }

  return ignores;
}

function fill(num: number, value: any) {
  const result = [];
  for (let i = 0; i < num; i += 1) {
    result[i] = value;
  }

  return result;
}
