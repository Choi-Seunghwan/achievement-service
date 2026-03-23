import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

/**
 * 공개 업적 E2E 테스트
 *
 * 주의: 이 테스트는 실제 데이터베이스 연결이 필요합니다.
 * 테스트용 DB 환경이 설정되어 있어야 정상 실행됩니다.
 * 또한 시드 데이터에 공개 업적이 존재해야 join 테스트가 정상 동작합니다.
 */
describe('공개 업적 (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testPublicAchievementId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    // 게스트 계정으로 토큰 발급 (테스트용)
    const guestResponse = await request(app.getHttpServer())
      .post('/account/guest-sign-up')
      .expect(201);

    accessToken = guestResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /public-achievements', () => {
    it('공개 업적 목록을 조회해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/public-achievements')
        .query({ page: 1, size: 10 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeDefined();

      // 공개 업적이 있으면 첫 번째를 참여 테스트용으로 저장
      if (response.body.data.length > 0) {
        testPublicAchievementId = response.body.data[0].id;
      }
    });

    it('카테고리 필터로 공개 업적을 조회해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/public-achievements')
        .query({ page: 1, size: 10, category: 'HEALTH' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('키워드로 공개 업적을 검색해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/public-achievements')
        .query({ page: 1, size: 10, keyword: '운동' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('인증 없이 요청 시 401을 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/public-achievements')
        .query({ page: 1, size: 10 })
        .expect(401);
    });
  });

  describe('GET /public-achievements/popular', () => {
    it('인기 공개 업적 목록을 조회해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/public-achievements/popular')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /public-achievements/seasonal', () => {
    it('시즌 공개 업적 목록을 조회해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/public-achievements/seasonal')
        .query({ page: 1, size: 10 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('공개 업적 참여 플로우', () => {
    it('공개 업적에 참여하면 개인 미션이 생성되어야 한다', async () => {
      // 공개 업적이 없으면 테스트 스킵
      if (!testPublicAchievementId) {
        console.warn(
          '테스트용 공개 업적이 없어 참여 플로우 테스트를 건너뜁니다.',
        );
        return;
      }

      // 공개 업적 참여
      const joinResponse = await request(app.getHttpServer())
        .post(`/public-achievements/${testPublicAchievementId}/join`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(joinResponse.body.data).toBe(true);

      // 공개 업적 상세 조회하여 참여 확인
      const detailResponse = await request(app.getHttpServer())
        .get(`/public-achievements/${testPublicAchievementId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(detailResponse.body.data).toBeDefined();
      expect(detailResponse.body.data.isParticipating).toBe(true);
    });

    it('이미 참여한 공개 업적에 다시 참여 시 400을 반환해야 한다', async () => {
      if (!testPublicAchievementId) {
        console.warn(
          '테스트용 공개 업적이 없어 중복 참여 테스트를 건너뜁니다.',
        );
        return;
      }

      await request(app.getHttpServer())
        .post(`/public-achievements/${testPublicAchievementId}/join`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('참여 중인 공개 업적에서 탈퇴해야 한다', async () => {
      if (!testPublicAchievementId) {
        console.warn(
          '테스트용 공개 업적이 없어 탈퇴 테스트를 건너뜁니다.',
        );
        return;
      }

      const leaveResponse = await request(app.getHttpServer())
        .post(`/public-achievements/${testPublicAchievementId}/leave`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(leaveResponse.body.data).toBe(true);
    });

    it('존재하지 않는 공개 업적에 참여 시 404를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/public-achievements/999999/join')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /public-achievements/:id/participants', () => {
    it('공개 업적 참여자 목록을 조회해야 한다', async () => {
      if (!testPublicAchievementId) {
        console.warn(
          '테스트용 공개 업적이 없어 참여자 목록 테스트를 건너뜁니다.',
        );
        return;
      }

      const response = await request(app.getHttpServer())
        .get(
          `/public-achievements/${testPublicAchievementId}/participants`,
        )
        .query({ page: 1, size: 10 })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
