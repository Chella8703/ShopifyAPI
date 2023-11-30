import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';

import {createAdminApiContext} from './create-admin-api-context';

export async function triggerAfterAuthHook<
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(params: BasicParams, session: Session, request: Request) {
  const {config, logger} = params;
  if (config.hooks.afterAuth) {
    logger.info('Running afterAuth hook');
    await config.hooks.afterAuth({
      session,
      admin: createAdminApiContext<Resources>(request, session, params),
    });
  }
}
