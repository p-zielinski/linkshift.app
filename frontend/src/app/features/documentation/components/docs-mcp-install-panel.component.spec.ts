import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TOOLS_API_CONFIG } from '../../../core/config/tools-api-config';
import {
  DocsMcpInstallPanelComponent,
  buildCursorMcpInstallDeeplink,
  buildMcpServersConfigJson,
  encodeMcpInstallConfigBase64,
} from './docs-mcp-install-panel.component';

describe('MCP install helpers', () => {
  it('base64-encodes per-server transport config (not mcpServers wrapper)', () => {
    const encoded = encodeMcpInstallConfigBase64('http://localhost:3030/api/v1/public/mcp');
    expect(atob(encoded)).toBe(
      JSON.stringify({ url: 'http://localhost:3030/api/v1/public/mcp' }),
    );
  });

  it('builds Cursor deeplink with server name and config', () => {
    const url = 'http://localhost:3030/api/v1/public/mcp';
    const deeplink = buildCursorMcpInstallDeeplink(url);
    expect(deeplink).toMatch(/^cursor:\/\/anysphere\.cursor-deeplink\/mcp\/install\?/);
    expect(deeplink).toContain('name=linkshift-docs-mcp');
    expect(deeplink).toContain('config=');
  });

  it('builds mcpServers JSON for manual paste', () => {
    const json = buildMcpServersConfigJson('https://tools.example/api/v1/public/mcp');
    expect(JSON.parse(json)).toEqual({
      mcpServers: {
        'linkshift-docs-mcp': { url: 'https://tools.example/api/v1/public/mcp' },
      },
    });
  });
});

describe('DocsMcpInstallPanelComponent', () => {
  it('derives MCP URL from tools API base', () => {
    TestBed.configureTestingModule({
      imports: [DocsMcpInstallPanelComponent],
      providers: [
        { provide: TOOLS_API_CONFIG, useValue: { baseUrl: 'https://tools.test' } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(DocsMcpInstallPanelComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.mcpUrl()).toBe('https://tools.test/api/v1/public/mcp');
    expect(fixture.componentInstance.cursorInstallHref()).toContain('name=linkshift-docs-mcp');
  });
});
