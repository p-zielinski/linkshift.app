export const REDIRECT_DELIVERY_MODE_VALUES = ['INSTANT', 'WITH_NOTICE'] as const;

export type RedirectDeliveryMode = (typeof REDIRECT_DELIVERY_MODE_VALUES)[number];

export const DEFAULT_REDIRECT_DELIVERY_MODE: RedirectDeliveryMode = 'INSTANT';

export const REDIRECT_NOTICE_DELAY_SECONDS = 10;
