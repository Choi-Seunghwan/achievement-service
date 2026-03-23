import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

/**
 * 인증 플로우 E2E 테스트
 *
 * 주의: 이 테스트는 실제 데이터베이스 연결이 필요합니다.
 * 테스트용 DB 환경이 설정되어 있어야 정상 실행됩니다.
 */
describe('인증 플로우 (e2e)', () => {
  let app: INestApplication;

  // 테스트용 계정 정보
  const testUser = {
    loginId: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    nickname: '테스트유저',
    password: 'testPassword123!',
  };

  let accessToken: string;
  let refreshToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /account/sign-up', () => {
    it('회원가입이 성공해야 한다', () => {
      return request(app.getHttpServer())
        .post('/account/sign-up')
        .send({
          loginId: testUser.loginId,
          email: testUser.email,
          nickname: testUser.nickname,
          password: testUser.password,
        })
        .expect(201);
    });

    it('동일한 loginId로 중복 회원가입 시 400을 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/account/sign-up')
        .send({
          loginId: testUser.loginId,
          email: 'another@example.com',
          nickname: '다른유저',
          password: 'anotherPass123!',
        })
        .expect(400);
    });
  });

  describe('POST /account/sign-in', () => {
    it('올바른 자격증명으로 로그인하면 토큰을 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .post('/account/sign-in')
        .send({
          loginId: testUser.loginId,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.account).toBeDefined();
      expect(response.body.data.account.loginId).toBe(testUser.loginId);

      // 다음 테스트에서 사용할 토큰 저장
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('잘못된 비밀번호로 로그인 시 401을 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/account/sign-in')
        .send({
          loginId: testUser.loginId,
          password: 'wrongPassword!',
        })
        .expect(401);
    });

    it('존재하지 않는 계정으로 로그인 시 401을 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/account/sign-in')
        .send({
          loginId: 'nonexistent_user',
          password: 'anyPassword123!',
        })
        .expect(401);
    });
  });

  describe('GET /account/me', () => {
    it('유효한 토큰으로 내 정보를 조회해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/account/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.loginId).toBe(testUser.loginId);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.nickname).toBe(testUser.nickname);
    });

    it('토큰 없이 요청 시 401을 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/account/me')
        .expect(401);
    });

    it('잘못된 토큰으로 요청 시 401을 반환해야 한다', () => {
      return request(app.getHttpServer())
        .get('/account/me')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);
    });
  });

  describe('POST /account/refresh-token', () => {
    it('유효한 refreshToken으로 새 토큰을 발급받아야 한다', async () => {
      const response = await request(app.getHttpServer())
        .post('/account/refresh-token')
        .send({
          refreshToken,
        })
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('잘못된 refreshToken으로 요청 시 에러를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/account/refresh-token')
        .send({
          refreshToken: 'invalid_refresh_token',
        })
        .expect((res) => {
          // 401 또는 500 (토큰 검증 실패)
          expect([401, 500]).toContain(res.status);
        });
    });
  });

  describe('POST /account/guest-sign-up', () => {
    it('게스트 계정을 생성하고 토큰을 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .post('/account/guest-sign-up')
        .expect(201);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.account).toBeDefined();
      expect(response.body.data.account.isGuest).toBe(true);
      expect(response.body.data.account.guestId).toBeDefined();
    });
  });
});
