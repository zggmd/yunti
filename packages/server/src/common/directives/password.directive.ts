import { MapperKind, getDirective, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';

/** 将返回的 password 替换为 null */
export function passwdDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: fieldConfig => {
      const passwdDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (passwdDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function fieldResolver(source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === 'string') {
            return null;
          }
          return result;
        };
        return fieldConfig;
      }
    },
  });
}
