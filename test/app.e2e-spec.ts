import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { buildFakeApp } from './utils/app';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await buildFakeApp();
  });

  it('/ (GET)', () => request(app.getHttpServer()).get('/ping').expect(204).expect({}));
});
