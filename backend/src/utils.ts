import { init } from '@paralleldrive/cuid2';
import { HttpException } from '@nestjs/common';
import { BaseError } from '@shared/models/error.model';

/**
 * Defines all system entities that require unique identification.
 * This includes both database models and virtual system entities like 'Request'.
 */
export enum AppEntity {
  Organization = 'Organization',
  User = 'User',
  DomainGroup = 'DomainGroup',
  Domain = 'Domain',
  RedirectRule = 'RedirectRule',
  Request = 'Request',
}

/**
 * Mapping of application entities to their short ID prefixes.
 * Results in IDs like "usr_..." for Users or "dom_..." for Domains.
 */
export const ENTITY_PREFIXES: Record<AppEntity, string> = {
  [AppEntity.Organization]: 'org',
  [AppEntity.User]: 'usr',
  [AppEntity.DomainGroup]: 'dmg',
  [AppEntity.Domain]: 'dom',
  [AppEntity.RedirectRule]: 'rule',
  [AppEntity.Request]: 'req',
};

/**
 * Zwraca regex sprawdzający czy string zaczyna się od prefiksu danej encji
 */
export const getEntityIdRegex = (entity: AppEntity) =>
  new RegExp(`^${ENTITY_PREFIXES[entity]}_`);

/**
 * Generates a prefixed, collision-resistant ID (Cuid2) for a given entity.
 *
 * @param entity - The type of entity to generate the ID for.
 * @param length - The length of the random portion of the Cuid (default: 24; max 32).
 * @returns A string in the format "prefix_randomString".
 */
export const createCustomCuid = (entity: AppEntity, length = 24) => {
  const generateCuid = init({
    random: Math.random,
    length,
    fingerprint: process.env.HOST_ID,
  });

  const prefix = ENTITY_PREFIXES[entity];
  return `${prefix}_${generateCuid()}`;
};

export const throwHttpException = (error: BaseError): never => {
  throw new HttpException(error, error.code);
};
