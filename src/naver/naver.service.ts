import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class NaverService {
  private readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (X11; Linux x86_64)',
  ];

  private async randomDelay(min = 500, max = 2000) {
    return new Promise((resolve) =>
      setTimeout(resolve, Math.random() * (max - min) + min),
    );
  }

  async scrape(url: string) {
    const proxy =
      'http://td-customer-mrscraperTrial-country-kr:P3nNRQ8C2@6n8xhsmh.as.thordata.net:9999';
    const agent = new HttpsProxyAgent(proxy);

    const headers = {
      'User-Agent':
        this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)],
      Accept: 'application/json,text/plain,*/*',
      Referer: 'https://search.shopping.naver.com/',
    };

    await this.randomDelay();

    const res = await axios.get(url, { headers, httpsAgent: agent });
    return res.data;
  }
}
