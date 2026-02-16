import { defineConfig } from 'prisma/config';
import 'dotenv/config';

console.log(process.env['' + 'DATABASE_URL']);

export default defineConfig({
  datasource: {
    url: process.env['' + 'DATABASE_URL'],
  },
});
