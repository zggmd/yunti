import { GraphQLError } from 'graphql-request/dist/types';

import { showInvalidTokenModal } from './modal';
import { showForbiddenNotification } from './notification';

export const errorsHandler = (errors: GraphQLError[]) => {
  const gqlErrors = errors.filter(e => e.extensions?.code !== undefined);
  if (gqlErrors.length === 0) {
    console.warn('uncaught errors', errors);
    return;
  }
  for (const e of gqlErrors) {
    switch (e.extensions.code) {
      case 'InvalidToken': {
        showInvalidTokenModal(e);
        break;
      }
      case 'Forbidden': {
        showForbiddenNotification(e);
        break;
      }
      default: {
        // showGlobalErrorNotification(e);
        break;
      }
    }
  }
};

export default errorsHandler;
