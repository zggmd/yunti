/* eslint-disable react-hooks/exhaustive-deps */
import { utils } from '@alilc/lowcode-renderer-core';
import qs from 'query-string';
import React, { useMemo, useState } from 'react';

const getLocationSearch = (self: any) => {
  const locationSearchStr = qs.parse(self?.location?.search || '')?._search as any;
  const parsedLocationSearch = JSON.parse(locationSearchStr || '{}');
  return parsedLocationSearch;
};

export interface DataProviderProps {
  render: (params: { [key: string]: any }) => JSX.Element;
  self: any;
  sdkInitFunc?: {
    enabled: boolean;
    func?: string;
    params?: {
      type: string;
      value: string;
    };
  };
  sdkSwrFuncs?: Array<{
    func: string;
    params?: {
      type: string;
      value: string;
    };
    enableLocationSearch?: boolean;
  }>;
  preview?: boolean;
}

const DataProvider: React.FC<DataProviderProps> = props => {
  const { render, sdkInitFunc, sdkSwrFuncs, self, preview } = props;
  const sdk = useMemo(() => {
    if (sdkInitFunc?.enabled && sdkInitFunc?.func) {
      let parsedParams = sdkInitFunc.params;
      // 注意：只有 preview 的时候才需要手动执行 js 表达式，出码之后是不需要的
      if (preview) {
        parsedParams = utils.parseThisRequiredExpression(sdkInitFunc.params || {}, self);
      }
      const _sdk = self.appHelper.utils[sdkInitFunc.func]?.(parsedParams);
      if (_sdk) {
        return _sdk;
      }
    }
    return self.appHelper.utils.sdk || self.appHelper.utils.bff;
  }, []);

  const queryStateArray = sdkSwrFuncs?.map(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [query, setQuery] = useState<any>();
    return {
      query,
      setQuery,
    };
  });

  const resArray = sdkSwrFuncs?.map(({ func, params, enableLocationSearch }, index) => {
    let parsedParams = params;
    // 注意：只有 preview 的时候才需要手动执行 js 表达式，出码之后是不需要的
    if (preview) {
      parsedParams = utils.parseThisRequiredExpression(params || {}, self);
    }
    const variables = Object.assign(
      {},
      parsedParams,
      enableLocationSearch ? getLocationSearch(self) : queryStateArray?.[index]?.query || {}
    );
    return sdk[func]?.(variables);
  });

  const renderParams = useMemo(() => {
    const params: { [key: string]: any } = {};
    if (sdkSwrFuncs)
      for (const [index, { func }] of sdkSwrFuncs.entries()) {
        params[func] = resArray?.[index];
        if (params[func]) {
          params[func].fetch = (query: any) => {
            const assignQuery = Object.assign({}, queryStateArray?.[index]?.query, {
              [func]: query,
            });
            queryStateArray?.[index]?.setQuery(assignQuery);
          };
        }
      }
    if (preview) {
      params.authData = self.schema?.meta?.appConfig?.authData || { token: {}, user: {} };
    }
    return params;
  }, [resArray]);
  return render(renderParams);
};

export default DataProvider;
