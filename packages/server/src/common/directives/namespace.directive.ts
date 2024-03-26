import { IPublicTypeRootSchema } from '@alilc/lowcode-types';
import { MapperKind, getDirective, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

interface ResourceModel {
  name: string;
  schema?: IPublicTypeRootSchema;
}

export function namespaceDirectiveTransformer(gqlSchema: GraphQLSchema, directiveName: string) {
  return mapSchema(gqlSchema, {
    [MapperKind.OBJECT_FIELD]: fieldConfig => {
      const namespaceDirective = getDirective(gqlSchema, fieldConfig, directiveName)?.[0];

      if (namespaceDirective) {
        fieldConfig.resolve = async function fieldResolver(source: ResourceModel) {
          const { name, schema } = source;
          if (!schema) {
            return name;
          }
          return schema.meta?.namespace || name;
        };
        return fieldConfig;
      }
    },
  });
}
