import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class NaverService {
  private readonly logger = new Logger(NaverService.name);

  // Proxy bisa diatur di .env -> PROXY_URL
  private proxyUrl = process.env.PROXY_URL || "http://td-customer-mrscraperTrial-country-kr:P3nNRQ8C2@6n8xhsmh.as.thordata.net:9999";

  private readonly USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.140 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
  ];

  private readonly LOCALES = [
    'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'en-US,en;q=0.9',
    'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
  ];

  private randomChoice<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private makeAgent(proxyUrl: string) {
    try {
      return new HttpsProxyAgent(proxyUrl);
    } catch (err: any) {
      this.logger.error('Failed to create proxy agent', err.message || err);
      return undefined;
    }
  }

  // ====== Proxy verification ======
  async verifyProxy(timeout = 5000) {
    const testUrl = 'https://api.ipify.org?format=json';
    const result: { withoutProxy?: string; withProxy?: string; success: boolean; error?: string } = { success: false };

    try {
      const r1 = await axios.get(testUrl, { timeout });
      result.withoutProxy = r1.data.ip;
    } catch (err: any) {
      result.error = `Error without proxy: ${err.message}`;
    }

    try {
      const agent = this.makeAgent(this.proxyUrl);
      const r2 = await axios.get(testUrl, { httpsAgent: agent, timeout });
      result.withProxy = r2.data.ip;
    } catch (err: any) {
      const e = `Error with proxy: ${err.message}`;
      result.error = result.error ? `${result.error} | ${e}` : e;
    }

    if (result.withoutProxy && result.withProxy) {
      result.success = result.withoutProxy !== result.withProxy;
    }

    this.logger.debug(`Proxy verify result: ${JSON.stringify(result)}`);
    return result;
  }

  // ====== Scraping with proxy & evasion headers ======
  async scrape(url: string) {
    const ua = this.randomChoice(this.USER_AGENTS);
    const lang = this.randomChoice(this.LOCALES);

    const headers = {
      'User-Agent': ua,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': lang,
      'Referer': 'https://search.shopping.naver.com/',
      'Origin': 'https://search.shopping.naver.com',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Site': 'same-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
    };

    const axiosConfig: AxiosRequestConfig = {
      headers,
      timeout: 10000,
    };

    const agent = this.makeAgent(this.proxyUrl);
    if (agent) axiosConfig.httpsAgent = agent;

    try {
      this.logger.debug(`Scraping URL: ${url}`);
      this.logger.debug(`Using proxy: ${this.proxyUrl}`);
      this.logger.debug(`Headers: ${JSON.stringify(headers)}`);

      const res = await axios.get(url, axiosConfig);
      this.logger.debug(`Status: ${res.status}`);

      return res.data;
    } catch (err: any) {
      this.logger.error('Scrape failed', err.message);
      if (err.response) {
        this.logger.error(`Status: ${err.response.status}, body: ${JSON.stringify(err.response.data).slice(0,200)}`);
      }
      throw err;
    }
  }
}
