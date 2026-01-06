import ngrok from '@ngrok/ngrok';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

async function start() {
  const port = process.env.PORT || 3000;

  console.log('[Ngrok Wrapper] Launching ngrok tunnel...');
  try {
    const session = await ngrok.forward({
      addr: port,
      authtoken: process.env.NGROK_AUTH_TOKEN,
    });

    console.log(
      `\x1b[32m[Ngrok Wrapper] Tunnel active: ${session.url()}\x1b[0m`,
    );
    console.log(`[Ngrok Wrapper] Forwarding to port: ${port}`);

    const nest = spawn('npm', ['run', 'start:dev-offline'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NGROK_URL: session.url() },
    });

    nest.on('close', (code) => {
      console.log(`[Ngrok Wrapper] NestJS process exited with code ${code}`);
      process.exit(code);
    });
  } catch (err) {
    console.error('[Ngrok Wrapper] Failed to start ngrok:', err);
    process.exit(1);
  }
}

start();
