import { APP_PAGE_HOST_LAYOUT_CONTRACT } from './app-page-host-layout.contract';

describe('app-page-host layout contract', () => {
  it('documents that router-outlet must be excluded from flex fill rules', () => {
    const contract = APP_PAGE_HOST_LAYOUT_CONTRACT;

    expect(contract.outletSelector).toBe('.app-page-host > router-outlet');
    expect(contract.routedChildSelector).toBe('.app-page-host > :not(router-outlet)');
    expect(contract.forbiddenSelector).toBe('.app-page-host > *');
    expect(contract.outletDisplay).toBe('display: none');
    expect(contract.routedFlex).toBe('flex: 1 1 0');
  });
});
