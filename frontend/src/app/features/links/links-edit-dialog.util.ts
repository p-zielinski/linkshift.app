export type LinksEditDialogTarget = 'campaign-simplified' | 'advanced-entry-form';

export function resolveLinksEditDialogTarget(isCampaignMode: boolean): LinksEditDialogTarget {
  return isCampaignMode ? 'campaign-simplified' : 'advanced-entry-form';
}
