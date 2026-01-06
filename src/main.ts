import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('V%-CT'),
  );
  const logger = WinstonModule.createLogger({
    level: 'debug',
    transports: [
      new winston.transports.Console({
        format: logFormat,
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application port - ${port}`);
  if (process.env.NGROK_URL) {
    logger.log(`Ngrok tunnel available at: ${process.env.NGROK_URL}`);
  }
}

bootstrap();
