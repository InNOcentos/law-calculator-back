import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CbrController } from './cbr.controller';
import { CbrService } from './cbr.service';

@Module({
  imports: [HttpModule],
  providers: [CbrService],
  controllers: [CbrController],
})
export class CbrModule {}
