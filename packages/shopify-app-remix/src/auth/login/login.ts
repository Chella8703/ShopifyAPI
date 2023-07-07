import {redirect} from '@remix-run/server-runtime';

import {BasicParams, LoginError, LoginErrorType} from '../../types';

export function loginFactory(params: BasicParams) {
  const {api, config, logger} = params;

  return async function login(request: Request): Promise<LoginError | never> {
    const url = new URL(request.url);
    const formData = await request.formData();

    const shop: string | null = formData.get('shop')
      ? (formData.get('shop') as string)
      : url.searchParams.get('shop');

    if (!shop) {
      logger.debug('Missing shop parameter', {shop});
      return {shop: LoginErrorType.MissingShop};
    }

    const shopWithoutProtocol = shop.replace(/^https?:\/\//, '');
    const shopWithDomain =
      shop?.indexOf('.') === -1
        ? `${shopWithoutProtocol}.myshopify.com`
        : shopWithoutProtocol;
    const sanitizedShop = api.utils.sanitizeShop(shopWithDomain);

    if (!sanitizedShop) {
      logger.debug('Invalid shop parameter', {shop});
      return {shop: LoginErrorType.InvalidShop};
    }

    const [shopWithoutDot] = sanitizedShop.split('.');
    const redirectUrl = `https://admin.shopify.com/store/${shopWithoutDot}/apps/${config.apiKey}`;

    logger.info(`Redirecting login request to ${redirectUrl}`, {
      shop: sanitizedShop,
    });

    throw redirect(redirectUrl);
  };
}
