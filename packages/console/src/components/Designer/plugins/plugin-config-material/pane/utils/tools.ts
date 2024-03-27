import { IPublicTypeRemoteComponentDescription } from '@alilc/lowcode-types';

export const getPkgIdFromComponent = (component: IPublicTypeRemoteComponentDescription) => {
  if (component.reference) {
    return component.reference.id || component.reference.package;
  }
  return component.npm?.package;
};
