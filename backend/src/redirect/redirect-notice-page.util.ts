import type { Response } from 'express';
import { REDIRECT_NOTICE_DELAY_SECONDS } from '@shared/models/redirect-delivery-mode.model';

export const REDIRECT_NOTICE_CONTENT_SECURITY_POLICY =
  "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-ancestors 'none';";

export function sendRedirectNoticePage(
  res: Response,
  target: string,
  delaySeconds: number = REDIRECT_NOTICE_DELAY_SECONDS,
): void {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Content-Security-Policy',
    REDIRECT_NOTICE_CONTENT_SECURITY_POLICY,
  );
  res.status(200).send(buildRedirectNoticeHtml(target, delaySeconds));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildRedirectNoticeHtml(
  target: string,
  delaySeconds: number = REDIRECT_NOTICE_DELAY_SECONDS,
): string {
  const safeDelay = Number.isFinite(delaySeconds)
    ? Math.max(1, Math.min(Math.floor(delaySeconds), 60))
    : REDIRECT_NOTICE_DELAY_SECONDS;
  const escapedTarget = escapeHtml(target);
  const targetJson = JSON.stringify(target);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>Redirecting…</title>
  <style>
    :root {
      --app-background: #f8f7f8;
      --app-surface: #ffffff;
      --app-border: rgba(28, 20, 24, 0.18);
      --app-border-soft: rgba(216, 76, 119, 0.18);
      --app-accent: #c03762;
      --app-accent-strong: #8f2045;
      --app-accent-soft: rgba(192, 55, 98, 0.16);
      --app-text: #1f181c;
      --app-muted: #4a3b42;
      --app-ink-muted: #6c5a62;
      --ring-size: 120px;
      --ring-radius: 52;
      --ring-circumference: 326.73;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px 20px;
      font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--app-text);
      background:
        radial-gradient(circle at top left, #fafafa 0%, #f8f7f8 45%, #f3f2f3 100%);
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(
          120% 100% at 50% 0%,
          rgba(246, 199, 216, 0.1) 0%,
          rgba(246, 199, 216, 0.05) 45%,
          rgba(246, 199, 216, 0) 100%
        ),
        linear-gradient(
          180deg,
          rgba(236, 151, 184, 0.1) 0%,
          rgba(236, 151, 184, 0.04) 55%,
          rgba(236, 151, 184, 0) 100%
        );
      background-repeat: no-repeat;
      background-size: 100% 200px;
      background-position: top center;
    }
    main {
      position: relative;
      width: min(100%, 520px);
      background: var(--app-surface);
      border: 1px solid var(--app-border-soft);
      border-radius: 24px;
      padding: 32px 28px 28px;
      box-shadow: 0 30px 60px rgba(32, 24, 28, 0.18);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      padding: 6px 12px;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--app-accent-strong);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--app-accent);
      box-shadow: 0 0 0 4px rgba(192, 55, 98, 0.18);
      animation: pulse 1.6s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.92); opacity: 0.72; }
    }
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }
    .lead {
      margin: 0;
      font-size: 13px;
      line-height: 1.55;
      color: var(--app-muted);
    }
    .countdown-wrap {
      margin: 28px auto 8px;
      width: var(--ring-size);
      text-align: center;
    }
    .countdown {
      position: relative;
      width: var(--ring-size);
      height: var(--ring-size);
      margin: 0 auto;
    }
    .countdown svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .ring-bg {
      fill: none;
      stroke: rgba(192, 55, 98, 0.12);
      stroke-width: 6;
    }
    .ring-progress {
      fill: none;
      stroke: var(--app-accent);
      stroke-width: 6;
      stroke-linecap: round;
      stroke-dasharray: var(--ring-circumference);
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 0.35s ease;
    }
    .countdown-number {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 42px;
      font-weight: 600;
      color: var(--app-accent-strong);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .countdown-label {
      margin: 12px 0 0;
      font-size: 13px;
      color: var(--app-ink-muted);
    }
    .destination-label {
      margin: 24px 0 8px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--app-ink-muted);
    }
    .destination {
      padding: 14px 16px;
      border-radius: 14px;
      background: var(--app-background);
      border: 1px solid var(--app-border);
      word-break: break-all;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.55;
      color: var(--app-text);
    }
    button {
      margin-top: 24px;
      width: 100%;
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      background: var(--app-accent);
      cursor: pointer;
      transition: background 0.15s ease, transform 0.15s ease;
    }
    button:hover { background: var(--app-accent-strong); }
    button:active { transform: translateY(1px); }
    button:focus-visible {
      outline: 2px solid var(--app-accent-strong);
      outline-offset: 3px;
    }
  </style>
</head>
<body>
  <main>
    <div class="badge"><span class="badge-dot" aria-hidden="true"></span>Redirect notice</div>
    <h1>You're being redirected</h1>
    <p class="lead">You'll continue to the destination below in a moment</p>

    <div class="countdown-wrap" aria-live="polite" aria-atomic="true">
      <div class="countdown">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-bg" cx="60" cy="60" r="52"></circle>
          <circle class="ring-progress" id="countdown-progress" cx="60" cy="60" r="52"></circle>
        </svg>
        <div class="countdown-number" id="countdown-number">${safeDelay}</div>
      </div>
      <p class="countdown-label" id="countdown-label">Redirecting in ${safeDelay} seconds…</p>
    </div>

    <p class="destination-label">Destination</p>
    <div class="destination" id="destination">${escapedTarget}</div>
    <button type="button" id="continue">Continue now</button>
  </main>
  <script>
    (function () {
      var target = ${targetJson};
      var total = ${safeDelay};
      var remaining = total;
      var circumference = 326.73;
      var countdownNumber = document.getElementById('countdown-number');
      var countdownLabel = document.getElementById('countdown-label');
      var countdownProgress = document.getElementById('countdown-progress');
      var timerId = null;
      var redirectTimeoutId = null;

      function stopCountdown() {
        if (timerId !== null) {
          clearInterval(timerId);
          timerId = null;
        }
        if (redirectTimeoutId !== null) {
          clearTimeout(redirectTimeoutId);
          redirectTimeoutId = null;
        }
      }

      function redirect() {
        stopCountdown();
        window.location.assign(target);
      }

      function render() {
        countdownNumber.textContent = String(remaining);
        var progress = remaining / total;
        countdownProgress.style.strokeDashoffset = String(circumference * (1 - progress));
        if (remaining === 0) {
          countdownLabel.textContent = 'Redirecting now…';
          return;
        }
        if (remaining === 1) {
          countdownLabel.textContent = 'Redirecting in 1 second…';
          return;
        }
        countdownLabel.textContent = 'Redirecting in ' + remaining + ' seconds…';
      }

      function tick() {
        remaining -= 1;
        if (remaining < 0) {
          redirect();
          return;
        }
        render();
        if (remaining === 0) {
          stopCountdown();
          redirectTimeoutId = setTimeout(redirect, 450);
        }
      }

      function startCountdown() {
        stopCountdown();
        remaining = total;
        render();
        timerId = setInterval(tick, 1000);
      }

      document.getElementById('continue').addEventListener('click', redirect);
      window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
          startCountdown();
        }
      });
      startCountdown();
    })();
  </script>
</body>
</html>`;
}

export { escapeHtml };
