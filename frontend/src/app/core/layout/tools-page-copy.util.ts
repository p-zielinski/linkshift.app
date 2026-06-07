import type { DashboardMode } from './dashboard-mode.service';

export type ToolsCardCopy = {
  title: string;
  body: string;
  hint: string;
};

export type ToolsPageCopy = {
  subtitle: string;
  introTitle: string | null;
  introBody: string | null;
  qrCard: ToolsCardCopy;
  redirectTesterCard: ToolsCardCopy;
};

/** Page header and intro copy for the Tools page by dashboard mode. */
export function resolveToolsPageCopy(mode: DashboardMode): ToolsPageCopy {
  if (mode === 'campaign') {
    return {
      subtitle: 'Generate QR codes and test short links before you share them',
      introTitle: null,
      introBody: null,
      qrCard: {
        title: 'QR generator',
        body: 'Turn any URL into a QR image for print, email, or social posts.',
        hint: 'Checks the final destination so broken redirects are easier to spot early.',
      },
      redirectTesterCard: {
        title: 'Test a link',
        body: 'Paste a short link or URL to see where it lands before you publish.',
        hint: 'Helpful when a partner reports a broken or unexpected redirect.',
      },
    };
  }

  return {
    subtitle: 'Operational utilities for diagnosing redirects and generating share-ready QR assets',
    introTitle: 'Why these tools matter',
    introBody:
      'Use these utilities during rollout, migration, and campaign execution to reduce redirect issues before they hit production traffic.',
    qrCard: {
      title: 'QR code generator',
      body: 'Generate QR assets in PNG/SVG/EPS from any URL. Useful for campaigns, print materials, and partner handoffs where file format control matters.',
      hint: 'Includes final-destination verification to catch redirect issues before distribution.',
    },
    redirectTesterCard: {
      title: 'Redirect tester',
      body: 'Inspect redirect chains hop-by-hop with status code, destination, latency estimate, and headers. Useful for debugging loops, broken hops, and User-Agent dependent behavior.',
      hint: 'Supports desktop, mobile, and custom User-Agent traces for faster incident diagnosis.',
    },
  };
}
