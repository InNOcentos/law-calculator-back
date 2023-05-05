import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CbrService {
  constructor(private readonly httpService: HttpService) {}

  async getLastKeyRate(): Promise<any> {
    console.log(123);
    const url = `https://sbcharts.investing.com/events_charts/us/554.json`;
    const keyRate = await firstValueFrom(this.httpService.get(url));

    const result = [];

    keyRate.data.data.forEach((e) => {
      if (result[result.length - 1]?.rate !== e[1]) {
        result.push({
          rate: e[1],
          timestamp: e[0],
        });
      }
    });
    return result;
  }
}
