import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { DomainGroupStore } from '../store/domain-group.store';
import { DEFAULT_LIST_KEY } from '../store/entity/entity-store.utils';

export const domainGroupsRequiredGuard: CanActivateFn = () => {
  const domainGroupStore = inject(DomainGroupStore);
  const router = inject(Router);

  domainGroupStore.searchList();

  const listResult = domainGroupStore.selectListResult(DEFAULT_LIST_KEY);

  return toObservable(listResult).pipe(
    filter((result) => result !== null),
    take(1),
    map((result) =>
      result.data.length > 0 ? true : router.parseUrl('/dashboard')
    )
  );
};
