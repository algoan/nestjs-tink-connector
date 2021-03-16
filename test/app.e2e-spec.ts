import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { buildFakeApp } from './utils/app';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await buildFakeApp();
  });

  it('/ (GET)', async () => request(app.getHttpServer()).get('/ping').expect(HttpStatus.NO_CONTENT).expect({}));
});
