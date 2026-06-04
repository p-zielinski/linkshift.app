import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TOOLS_API_CONFIG } from '../../../core/config/tools-api-config';

const MCP_SERVER_NAME = 'linkshift-docs-mcp';
const MCP_HTTP_PATH = '/api/v1/public/mcp';

/** Base64-encode per-server transport config for Cursor MCP install deeplink. */
export function encodeMcpInstallConfigBase64(mcpUrl: string): string {
  const payload = JSON.stringify({ url: mcpUrl });
  return btoa(payload);
}

/** Cursor deeplink that opens MCP server install for linkshift-docs-mcp. */
export function buildCursorMcpInstallDeeplink(mcpUrl: string): string {
  const config = encodeURIComponent(encodeMcpInstallConfigBase64(mcpUrl));
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${MCP_SERVER_NAME}&config=${config}`;
}

/** JSON snippet for Cursor MCP settings (mcp.json). */
export function buildMcpServersConfigJson(mcpUrl: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        [MCP_SERVER_NAME]: {
          url: mcpUrl,
        },
      },
    },
    null,
    2,
  );
}

@Component({
  selector: 'app-docs-mcp-install-panel',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatSnackBarModule, ClipboardModule],
  templateUrl: './docs-mcp-install-panel.component.html',
})
export class DocsMcpInstallPanelComponent {
  private readonly toolsApiConfig = inject(TOOLS_API_CONFIG);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  readonly mcpUrl = computed(
    () => `${this.toolsApiConfig.baseUrl}${MCP_HTTP_PATH}`,
  );

  readonly cursorInstallHref = computed(() => buildCursorMcpInstallDeeplink(this.mcpUrl()));

  readonly mcpConfigJson = computed(() => buildMcpServersConfigJson(this.mcpUrl()));

  copyMcpConfig(): void {
    const copied = this.clipboard.copy(this.mcpConfigJson());
    this.snackBar.open(copied ? 'Copied to clipboard.' : "Couldn't copy MCP config. Copy it manually.", undefined, {
      duration: 3000,
    });
  }
}
