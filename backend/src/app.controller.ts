import { Controller } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {
  }
}
