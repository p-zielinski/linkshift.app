import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { RedirectService } from './redirect.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [RedirectService],
})
export class AppModule {}
