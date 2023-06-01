import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import 'moment-timezone';

moment.locale('ru');
moment.tz('Europe/Moscow').format();

@Injectable()
export class CbrService {
  constructor(private readonly httpService: HttpService) {}

  async getLastKeyRate(): Promise<any> {
    const req = await firstValueFrom(this.httpService.get('https://anytools.pro/files/data/finance/cbrf.csv'));

    return req.data
      .split(/\r?\n/)
      .map((kr) => {
        const [date, rate] = kr.split(';');
        const tmpDate = date.split('.');

        if (!tmpDate[0]) return null;

        const newDate = moment(`${tmpDate[2]}-${tmpDate[1] - 1}-${tmpDate[0]}`);

        return {
          rate: +rate,
          timestamp: +newDate.format('x'),
        };
      })
      .filter((e) => !!e);
  }
}
