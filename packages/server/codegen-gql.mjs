#!/usr/bin/env zx
import * as fs from 'node:fs';
import { $ } from 'zx';

const NM_RUN_PATH = 'node_modules/.bin/';
const SDK_FILE_PATH = 'packages/yunti-bff-client/src/sdk.ts';

await $`${NM_RUN_PATH}graphql-codegen`;

fs.writeFileSync(
  SDK_FILE_PATH,
  fs
    .readFileSync(SDK_FILE_PATH)
    .toString()
    .replace(
      'import useSWR,',
      `import useSWR from './useSWR';
import`
    )
    .replace(
      `import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';`,
      `import { RequestConfig } from 'graphql-request/src/types';`
    )
    .replaceAll('GraphQLClientRequestHeaders', `RequestConfig['headers']`)
    .replaceAll('graphql-request/dist/', 'graphql-request/src/')
    .replace(
      /\s*id:\sstring,\s*fieldName:\s*keyof\s*Variables,\s*fieldValue:\s*Variables\[\s*typeof\sfieldName\s*]\s*/,
      `[
          id,
          fieldName,
          fieldValue
        ]: [SWRKeyInterface, keyof Variables, Variables[keyof Variables]]`
    )
    // add tree to SWR key
    .replace(
      'export function getSdkWithHooks(client: GraphQLClient,',
      "export function getSdkWithHooks(client: GraphQLClient, tree = 'main',"
    )
    .replace(
      '(name: string, object: V = {} as V): SWRKeyInterface => [',
      '(name: string, object: V = {} as V): SWRKeyInterface => [ tree,'
    )
);

await $`${NM_RUN_PATH}eslint \"packages/yunti-bff-client/**/*.ts\" --fix`;
await $`${NM_RUN_PATH}prettier --write \"packages/yunti-bff-client/**/*.ts\"`;
