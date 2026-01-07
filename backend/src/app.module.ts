import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { RedirectService } from './redirect.service';
import { RuleValidatorService } from './rule-validator.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [RedirectService, RuleValidatorService],
})
export class AppModule {}
