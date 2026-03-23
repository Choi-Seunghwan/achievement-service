# 백엔드 서비스 통합 (2026-03-23)

## 작업 요약
`achievement-account-service`(계정/인증)와 `achievement-service`(미션/업적)를 **하나의 서비스로 통합**.
마이크로서비스 구조에서 모놀리식 구조로 변경.

## 변경 이유
- 빌드업 단계의 프로젝트에서 서버 2대 운영은 리소스 낭비
- 서비스 간 결합이 TCP 통신 2곳뿐 (getUserInfo, getUsersInfo)
- 배포/개발 파이프라인 단순화

## 변경 사항

### achievement-service (백엔드)

**추가된 파일:**
- `src/account/` — 계정 모듈 전체 (controller, service, repository, module, dtos, types, constants)
- `src/feedback/` — 피드백 모듈 전체 (controller, service, repository, module, dtos)
- `src/common/utils/hashPassword.ts` — argon2 비밀번호 해싱
- `src/common/utils/comparePassword.ts` — argon2 비밀번호 검증

**삭제된 파일:**
- `src/account/account-client.service.ts` — TCP 마이크로서비스 클라이언트
- `src/account/account-client.module.ts` — TCP 클라이언트 모듈
- `src/account/dto/account-res.dto.ts` — 기존 TCP용 DTO
- `src/boot-server.ts` — 마이크로서비스 부팅 코드

**수정된 파일:**
- `prisma/schema.prisma` — Account, SocialAccount, Feedback 모델 추가
- `src/app.module.ts` — AccountModule, FeedbackModule import 추가
- `src/main.ts` — bootMicroservice 호출 제거
- `src/achievement-participant/achievement-participant.service.ts` — AccountClientService → AccountService
- `src/achievement-participant/achievement-participant.module.ts` — AccountClientModule → AccountModule
- `src/public-achievement/public-achievement.service.ts` — AccountClientService → AccountService, getUsersInfo → getAccounts
- `src/public-achievement/public-achievement.module.ts` — AccountClientModule → AccountModule
- `src/public-achievement/dtos/public-achievement-comment-res.dto.ts` — AccountResDto → AccountInfoDto (인라인 정의)
- `src/public-achievement/dtos/public-achievement-participant-res.dto.ts` — 동일
- `package.json` — argon2, @nestjs/jwt 추가 / @nestjs/microservices 제거

### achievement-app (프론트엔드)

**수정된 파일:**
- `services/account.service.ts` — baseURL을 `EXPO_PUBLIC_API_URL` 단일 변수로 변경
- `services/achievement.service.ts` — 별도 axios instance 제거, account.service.ts의 apiInstance 공유
- `app/_layout.tsx` — setupAchievementAuthInterceptors 호출 제거
- `app/auth/auth.tsx` — fetch 직접호출을 signUp() 함수 사용으로 변경
- `types/env.d.ts` — EXPO_PUBLIC_API_URL 단일 환경변수로 변경

### 환경변수 변경
| 구분 | 이전 | 이후 |
|---|---|---|
| 프론트엔드 | EXPO_PUBLIC_ACCOUNT_SERVICE_URL, EXPO_PUBLIC_ACHIEVEMENT_SERVICE_URL | **EXPO_PUBLIC_API_URL** |
| 백엔드 | ACCOUNT_SERVICE_PORT, INTERNAL_SERVER_PORT 필요 | 불필요 |

### DB 마이그레이션
- `prisma/migrations/20260323052835_init_merged/` — Account, SocialAccount, Feedback 테이블 생성
- 기존 미션/업적 마이그레이션 히스토리 유지

## 로컬 개발 환경
- PostgreSQL: `docker compose up -d` (경로: `/Users/csh/project/infra/postgresql/`)
- DB: `achievement` (user: seunghwanchoi / pw: postgres / port: 5432)
- `.env` 파일: `achievement-service/.env`
- 서버 포트: 3000

## 테스트 결과 (2026-03-23)
- 게스트 회원가입/로그인: 정상
- 토큰 인증 (GET /account/me): 정상
- 미션 생성: 정상
- 피드백 전송: 정상

## 참고
- `achievement-account-service` 폴더는 아직 삭제하지 않음 (참고용으로 보존)
- GitHub Packages 토큰 인증 필요: `.npmrc`에 `//npm.pkg.github.com/:_authToken=...` 설정
