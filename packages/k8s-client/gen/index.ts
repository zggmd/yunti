import * as k8s from '@kubernetes/client-node';
import * as fs from 'node:fs';
import { join } from 'node:path';

import { genCore } from './core';
import { genCrd } from './crd';
import { genRbac } from './rbac';
// import { genApps } from './apps';
// import { genBatch } from './batch';
import { ROOT_DIR, RsImport, firstLetterToLowercase, getRegExp } from './utils';

const cluster = {
  name: 'kube-oidc-proxy',
  server: 'https://k8s.172.22.96.136.nip.io',
  skipTLSVerify: true,
};
const user = {
  name: 'admin',
  token:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkNTUyNmIzZTIxMjBkY2I5YzIwZWNlYTMxZTg5ZmE3NzhhNWJkZTIifQ.eyJpc3MiOiJodHRwczovL3BvcnRhbC4xNzIuMjIuOTYuMTM2Lm5pcC5pby9vaWRjIiwic3ViIjoiQ2dWaFpHMXBiaElHYXpoelkzSmsiLCJhdWQiOiJiZmYtY2xpZW50IiwiZXhwIjoxNjk1NDM3MTU2LCJpYXQiOjE2OTUzNTA3NTYsImF0X2hhc2giOiJUUnpzZnJnUVpmTHlSSEtiMkhtRjJ3IiwiY19oYXNoIjoiU1FEQWdhMWlUazdtdDROeEwyOXdtUSIsImVtYWlsIjoiYWRtaW5AdGVueGNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cHMiOlsic3lzdGVtOm1hc3RlcnMiLCJpYW0udGVueGNsb3VkLmNvbSIsIm9ic2VydmFiaWxpdHkiLCJyZXNvdXJjZS1yZWFkZXIiLCJvYnNldmFiaWxpdHkiXSwibmFtZSI6ImFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJwaG9uZSI6IiIsInVzZXJpZCI6ImFkbWluIn0.urDApi87S3KSC2DpKg7cXG6d2KckzIQrhQR9XDw6lMxDcGbH0Q29Wgh-85uLh_w_7w0olYgEu8RRG_S0ajAx0s3nwvDBOyoIkiJ3av08OwBNgAksnggFYpgC0sTa14HfwlCXg8iFQuGMft8ts6DxEPmoufRbHoIYP4ImqhbP-RFIVr-dtfgcp4Z5bzB5CxswENyXXlC_cKGQa9sNZRzbj9ICf96gXcJ8pHehq-prG9-9ENpSCmIgc7FQ5mPbCUiAlcXXBRSMM6fZ0p1IlpDRopGCaYhixH6P14c9JGzBhY4JBB8ZgX1-MDq27atJ8ve8DN05jLqgsXjjauisEf84jw',
};
const createKubeConfig = (cluster: k8s.Cluster, user: k8s.User) => {
  const kubeConfig = new k8s.KubeConfig();
  kubeConfig.loadFromClusterAndUser(cluster, user);
  return kubeConfig;
};
const kubeConfig = createKubeConfig(cluster, user);

const K8S_SERVICE_PATH = join(ROOT_DIR, 'kubernetes.service.ts');
let K8sServiceContent = fs.readFileSync(K8S_SERVICE_PATH).toString();
const replaceK8sServiceContent = (
  rsImports: RsImport[],
  group = 'core',
  apiClientType = 'coreV1Api'
) => {
  K8sServiceContent = K8sServiceContent.replace(
    getRegExp(`<replace type="${group}">`, `</replace type="${group}">`),
    `// <replace type="${group}">\n${rsImports
      .map(({ rs }) => `${firstLetterToLowercase(rs)}: new lib.${rs}(${apiClientType})`)
      .join(',\n')},\n// </replace type="${group}">`
  );
  fs.writeFileSync(K8S_SERVICE_PATH, K8sServiceContent);
};

async function gen() {
  // gen core v1 rs
  const coreRsImports = await genCore(kubeConfig);
  replaceK8sServiceContent(coreRsImports, 'core', 'coreV1Api');

  // gen crd
  const crdRsImports = await genCrd(kubeConfig);
  replaceK8sServiceContent(crdRsImports, 'crd', 'customObjectsApi');

  // gen rbac v1 rs
  const rbacRsImports = await genRbac(kubeConfig);
  replaceK8sServiceContent(rbacRsImports, 'rbac', 'rbacAuthorizationV1Api');

  // gen apps v1 rs
  // const appsRsImports = await genApps(kubeConfig);
  // replaceK8sServiceContent(appsRsImports, 'apps', 'appsV1Api');

  // gen apps v1 rs
  // const batchRsImports = await genBatch(kubeConfig);
  // replaceK8sServiceContent(batchRsImports, 'batch', 'batchV1Api');
}

gen();
