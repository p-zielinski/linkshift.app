import { computed, inject, PLATFORM_ID } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { DomainGroupStore } from '../store/domain-group.store';
import { DEFAULT_LIST_KEY, isExpired } from '../store/entity/entity-store.utils';
import { isPlatformServer } from '@angular/common';

export const domainGroupsRequiredGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const domainGroupStore = inject(DomainGroupStore);
  const router = inject(Router);

  if (isPlatformServer(platformId)) {
    return true;
  }

  const listResult = domainGroupStore.selectListResult(DEFAULT_LIST_KEY);
  const listExpiration = computed(
    () => domainGroupStore.expirationDates()[DEFAULT_LIST_KEY] ?? null
  );

  const initialResult = listResult();
  const currentExpiration = listExpiration();

  if (initialResult && !isExpired(currentExpiration)) {
    return initialResult.data.length > 0
      ? true
      : router.parseUrl('/dashboard');
  }

  domainGroupStore.searchList(undefined, true);

  const queryState = computed(() => ({
    result: listResult(),
    isLoading: domainGroupStore.isLoading()[DEFAULT_LIST_KEY]
  }));

  return toObservable(queryState).pipe(
    filter(({ result, isLoading }) => {
      return !isLoading && result !== null && result !== initialResult;
    }),
    map(({ result }) => result),
    take(1),
    map((result) =>
      result!.data.length > 0 ? true : router.parseUrl('/dashboard')
    )
  );
};
