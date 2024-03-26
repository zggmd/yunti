/**
 * 由 src/kubernetes/gen/index.ts 自动生成
 * !!! 请不要修改 !!!
 */
import { V1ListMeta } from '@kubernetes/client-node';

import { ResourceAggregationView } from './resource-aggregation-view';

/**
 * ResourceAggregationViewList is a list of ResourceAggregationViews.
 */
export declare class ResourceAggregationViewList {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion?: string;
  /**
   * List of resource-aggregation-views. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md
   */
  items: Array<ResourceAggregationView>;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind?: string;
  metadata?: V1ListMeta;
  static discriminator: string | undefined;
  static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }>;
  static getAttributeTypeMap(): {
    name: string;
    baseName: string;
    type: string;
  }[];
}
