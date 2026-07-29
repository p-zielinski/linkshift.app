import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SunsetBannerComponent } from './sunset-banner.component';

describe('SunsetBannerComponent', () => {
  let fixture: ComponentFixture<SunsetBannerComponent>;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SunsetBannerComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SunsetBannerComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders the sunset announcement by default', () => {
    const banner = fixture.debugElement.query(By.css('[data-testid="sunset-banner"]'));
    expect(banner).toBeTruthy();
    expect(banner.nativeElement.textContent).toContain('$500 MRR');
    expect(banner.nativeElement.textContent).toContain('February 2027');
  });

  it('hides after dismiss and persists in sessionStorage', () => {
    const dismiss = fixture.debugElement.query(By.css('button[aria-label="Dismiss announcement"]'));
    dismiss.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="sunset-banner"]'))).toBeNull();
    expect(sessionStorage.getItem('linkshift.sunset-banner.dismissed')).toBe('1');
  });

  it('stays hidden when already dismissed in sessionStorage', async () => {
    sessionStorage.setItem('linkshift.sunset-banner.dismissed', '1');

    const next = TestBed.createComponent(SunsetBannerComponent);
    next.detectChanges();

    expect(next.debugElement.query(By.css('[data-testid="sunset-banner"]'))).toBeNull();
  });
});
