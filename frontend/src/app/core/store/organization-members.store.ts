import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { mergeMap, pipe, tap } from 'rxjs';
import type { OrganizationMember } from '../models/organization-member.model';
import { OrganizationMembersApiService } from '../api/organization-members-api.service';
import { extractErrorMessage } from './store-error.utils';
import { getExpiration, isExpired } from './entity/entity-store.utils';
import { DEFAULT_STORE_TTL_MS } from './store-cache.constants';
import { OrganizationUsageStore } from './organization-usage.store';

type OrganizationMembersState = {
  members: OrganizationMember[];
  isLoading: boolean;
  error: string | null;
  expiresAt: number | null;
};

const initialState: OrganizationMembersState = {
  members: [],
  isLoading: false,
  error: null,
  expiresAt: null,
};

const resetState = (): OrganizationMembersState => ({
  members: [],
  isLoading: false,
  error: null,
  expiresAt: null,
});

export const OrganizationMembersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasMembers: computed(() => store.members().length > 0),
  })),
  withMethods((store, api = inject(OrganizationMembersApiService)) => {
    const usageStore = inject(OrganizationUsageStore);

    const setError = (error: unknown, fallback: string) => {
      const message = extractErrorMessage(error, fallback);
      patchState(store, { error: message });
    };

    const fetchMembers = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        mergeMap(() =>
          api.listMembers().pipe(
            tapResponse({
              next: (members) =>
                patchState(store, { members, expiresAt: getExpiration(DEFAULT_STORE_TTL_MS) }),
              error: (error) => {
                setError(error, 'Member list request failed.');
                patchState(store, { expiresAt: null });
              },
              finalize: () => patchState(store, { isLoading: false }),
            }),
          ),
        ),
      ),
    );

    const updateMemberStatus = rxMethod<{ userId: string; blocked: boolean }>(
      pipe(
        tap(() => patchState(store, { error: null })),
        mergeMap((payload) =>
          api.updateMemberStatus(payload.userId, payload.blocked).pipe(
            tapResponse({
              next: (member) => {
                patchState(store, (state) => ({
                  members: state.members.map((entry) =>
                    entry.id === member.id ? member : entry,
                  ),
                  expiresAt: getExpiration(DEFAULT_STORE_TTL_MS),
                }));
                usageStore.invalidateUsage();
                usageStore.loadUsage(true);
              },
              error: (error) => setError(error, 'Member update failed.'),
            }),
          ),
        ),
      ),
    );

    return {
      loadMembers: (force = false) => {
        if (store.isLoading()) {
          return;
        }
        if (force || isExpired(store.expiresAt())) {
          fetchMembers();
        }
      },
      updateMemberStatus,
      invalidateMembers: () =>
        patchState(store, { expiresAt: null, error: null }),
      clearError: () => patchState(store, { error: null }),
      resetStore: () => patchState(store, resetState()),
    };
  }),
);
