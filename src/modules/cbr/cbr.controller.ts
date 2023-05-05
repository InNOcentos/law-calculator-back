import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CbrService } from './cbr.service';

@Controller('cbr')
@ApiTags('ЦБР')
export class CbrController {
  constructor(private cbrService: CbrService) {}

  @ApiOperation({
    summary: 'Ключевая ставка',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get('key-rate')
  signUp(): Promise<any> {
    return this.cbrService.getLastKeyRate();
  }
}
