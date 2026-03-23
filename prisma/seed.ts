import { PrismaClient, MissionRepeatType } from '@prisma/client';

const prisma = new PrismaClient();

// 공개 업적 시드 데이터 정의
interface SeedTask {
  name: string;
}

interface SeedMission {
  name: string;
  description: string;
  repeatType: MissionRepeatType;
  repeatDays?: any[];
  icon?: string;
  tasks: SeedTask[];
}

interface SeedAchievement {
  name: string;
  description: string;
  icon: string;
  category: string;
  startDate?: Date;
  endDate?: Date;
  missions: SeedMission[];
}

// 시드 데이터 정의
const seedData: SeedAchievement[] = [
  // ===== 운동/건강 =====
  {
    name: '러닝 30일 챌린지',
    description:
      '30일 동안 매일 러닝을 하며 건강한 습관을 만들어보세요. 초보자도 부담 없이 시작할 수 있는 러닝 챌린지입니다.',
    icon: '🏃',
    category: '운동/건강',
    missions: [
      {
        name: '가볍게 2km 러닝',
        description: '매일 2km 이상 러닝하기. 속도보다 꾸준함이 중요해요!',
        repeatType: MissionRepeatType.DAILY,
        icon: '👟',
        tasks: [
          { name: '러닝화 신고 밖으로 나가기' },
          { name: '2km 이상 달리기' },
        ],
      },
      {
        name: '러닝 전후 스트레칭',
        description: '부상 방지를 위해 러닝 전후 스트레칭을 꼭 해주세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🧘',
        tasks: [
          { name: '러닝 전 동적 스트레칭 5분' },
          { name: '러닝 후 정적 스트레칭 5분' },
        ],
      },
      {
        name: '러닝 기록 남기기',
        description: '오늘의 러닝 거리, 시간, 느낀 점을 기록해보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '📝',
        tasks: [
          { name: '러닝 앱으로 거리/시간 기록' },
          { name: '오늘의 컨디션 메모하기' },
          { name: '내일 목표 세우기' },
        ],
      },
    ],
  },
  {
    name: '홈트레이닝 입문',
    description:
      '헬스장에 갈 시간이 없어도 괜찮아요! 집에서 할 수 있는 홈트레이닝으로 체력을 키워보세요.',
    icon: '💪',
    category: '운동/건강',
    missions: [
      {
        name: '상체 운동 루틴',
        description: '팔굽혀펴기, 플랭크 등 상체 근력 운동을 매일 수행하세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🏋️',
        tasks: [
          { name: '팔굽혀펴기 3세트' },
          { name: '플랭크 1분 이상' },
        ],
      },
      {
        name: '하체 운동 루틴',
        description: '스쿼트, 런지 등 하체 근력 운동으로 탄탄한 하체를 만들어보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🦵',
        tasks: [
          { name: '스쿼트 20개 3세트' },
          { name: '런지 15개 3세트' },
          { name: '카프레이즈 20개 2세트' },
        ],
      },
      {
        name: '코어 운동 루틴',
        description: '코어 근육을 강화하여 자세를 바로잡고 허리 건강을 지켜보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🔥',
        tasks: [
          { name: '크런치 20개 3세트' },
          { name: '레그레이즈 15개 3세트' },
        ],
      },
    ],
  },

  // ===== 독서/학습 =====
  {
    name: '한 달에 책 2권 읽기',
    description:
      '바쁜 일상 속에서도 책 읽는 습관을 만들어보세요. 한 달에 2권이면 1년에 24권! 꾸준히 읽으면 인생이 달라집니다.',
    icon: '📚',
    category: '독서/학습',
    missions: [
      {
        name: '읽을 책 선정하기',
        description: '이번 달에 읽을 책 2권을 골라보세요. 관심 있는 분야에서 시작하면 좋아요.',
        repeatType: MissionRepeatType.NONE,
        icon: '🔍',
        tasks: [
          { name: '서점 또는 온라인에서 책 후보 리스트업' },
          { name: '최종 2권 선정 및 구매/대출' },
        ],
      },
      {
        name: '첫 번째 책 완독하기',
        description: '선정한 첫 번째 책을 끝까지 읽어보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '📖',
        tasks: [
          { name: '매일 30분 이상 독서 시간 확보' },
          { name: '인상 깊은 구절 3개 이상 메모' },
          { name: '완독 후 한 줄 서평 작성' },
        ],
      },
      {
        name: '두 번째 책 완독하기',
        description: '두 번째 책도 완독해보세요. 다른 장르에 도전해보는 것도 좋아요.',
        repeatType: MissionRepeatType.NONE,
        icon: '📖',
        tasks: [
          { name: '매일 30분 이상 독서 시간 확보' },
          { name: '인상 깊은 구절 3개 이상 메모' },
          { name: '완독 후 한 줄 서평 작성' },
        ],
      },
      {
        name: '독서 노트 정리하기',
        description: '이번 달 읽은 책에서 배운 점을 정리해보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '✍️',
        tasks: [
          { name: '책별 핵심 내용 3줄 요약' },
          { name: '내 삶에 적용할 점 적기' },
        ],
      },
    ],
  },
  {
    name: '매일 아침 영어 공부',
    description:
      '매일 아침 30분 영어 공부로 영어 실력을 꾸준히 올려보세요. 작은 습관이 큰 변화를 만들어요.',
    icon: '🇺🇸',
    category: '독서/학습',
    missions: [
      {
        name: '영어 단어 10개 외우기',
        description: '매일 새로운 영어 단어 10개를 학습하고 복습해보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '📝',
        tasks: [
          { name: '새 단어 10개 학습' },
          { name: '어제 배운 단어 복습' },
        ],
      },
      {
        name: '영어 리스닝 10분',
        description: '팟캐스트, 유튜브, 뉴스 등으로 영어 듣기 연습을 해보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🎧',
        tasks: [
          { name: '영어 컨텐츠 10분 이상 듣기' },
          { name: '들은 내용 핵심 문장 1개 받아쓰기' },
        ],
      },
      {
        name: '영어 문장 쓰기 연습',
        description: '매일 영어로 3문장 이상 작성하며 작문 능력을 키워보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '✏️',
        tasks: [
          { name: '오늘 배운 단어로 문장 3개 만들기' },
          { name: '영어 일기 3문장 작성' },
          { name: '틀린 문법 체크하기' },
        ],
      },
    ],
  },

  // ===== 자기개발 =====
  {
    name: '사이드 프로젝트 완성하기',
    description:
      '머릿속에만 있던 아이디어를 실제로 만들어보세요! 기획부터 배포까지, 사이드 프로젝트를 완성하는 경험을 해봐요.',
    icon: '💻',
    category: '자기개발',
    missions: [
      {
        name: '아이디어 구체화하기',
        description: '프로젝트 아이디어를 구체적으로 정리하고 기획해보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '💡',
        tasks: [
          { name: '아이디어 브레인스토밍' },
          { name: '핵심 기능 3가지 정의' },
          { name: '간단한 기획서 작성' },
        ],
      },
      {
        name: '기술 스택 선정 및 환경 구축',
        description: '프로젝트에 사용할 기술을 선정하고 개발 환경을 세팅하세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '⚙️',
        tasks: [
          { name: '기술 스택 선정' },
          { name: '깃허브 레포 생성' },
          { name: '개발 환경 세팅 완료' },
        ],
      },
      {
        name: 'MVP 개발하기',
        description: '핵심 기능 중심으로 최소 기능 제품(MVP)을 개발하세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '🛠️',
        tasks: [
          { name: '핵심 기능 1 구현' },
          { name: '핵심 기능 2 구현' },
          { name: '핵심 기능 3 구현' },
        ],
      },
      {
        name: '테스트 및 버그 수정',
        description: '개발한 기능을 테스트하고 발견된 버그를 수정하세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '🐛',
        tasks: [
          { name: '전체 기능 테스트' },
          { name: '주요 버그 수정' },
        ],
      },
      {
        name: '배포하기',
        description: '프로젝트를 세상에 공개해보세요! 완벽하지 않아도 괜찮아요.',
        repeatType: MissionRepeatType.NONE,
        icon: '🚀',
        tasks: [
          { name: '배포 환경 설정' },
          { name: '실제 배포 완료' },
          { name: 'README 작성' },
        ],
      },
    ],
  },
  {
    name: '저널링 30일',
    description:
      '매일 자신의 생각과 감정을 기록하며 내면을 돌아보세요. 저널링은 스트레스 해소와 자기 성찰에 효과적입니다.',
    icon: '📓',
    category: '자기개발',
    missions: [
      {
        name: '아침 저널링',
        description: '하루를 시작하며 오늘의 목표와 감사한 점을 적어보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🌅',
        tasks: [
          { name: '오늘 감사한 것 3가지 적기' },
          { name: '오늘의 목표 1가지 적기' },
        ],
      },
      {
        name: '저녁 회고 저널링',
        description: '하루를 마무리하며 오늘 있었던 일과 느낀 점을 적어보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🌙',
        tasks: [
          { name: '오늘 잘한 것 1가지 적기' },
          { name: '오늘 개선할 점 1가지 적기' },
          { name: '내일 기대되는 것 적기' },
        ],
      },
      {
        name: '주간 회고 작성',
        description: '일주일에 한 번, 한 주를 돌아보며 성장 포인트를 정리해보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '📊',
        tasks: [
          { name: '이번 주 가장 좋았던 순간 적기' },
          { name: '다음 주 집중할 것 적기' },
        ],
      },
    ],
  },

  // ===== 라이프스타일 =====
  {
    name: '미니멀 라이프 도전',
    description:
      '불필요한 물건을 정리하고 심플한 생활을 시작해보세요. 물건이 줄면 마음이 가벼워집니다.',
    icon: '🏠',
    category: '라이프스타일',
    missions: [
      {
        name: '옷장 정리하기',
        description: '1년 이상 입지 않은 옷들을 정리하고 기부 또는 처분하세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '👕',
        tasks: [
          { name: '모든 옷 꺼내서 분류하기' },
          { name: '안 입는 옷 기부/중고 판매' },
          { name: '남은 옷 깔끔하게 정리' },
        ],
      },
      {
        name: '디지털 정리하기',
        description: '스마트폰, 컴퓨터의 불필요한 앱과 파일을 정리해보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '📱',
        tasks: [
          { name: '안 쓰는 앱 삭제' },
          { name: '사진/파일 정리 및 백업' },
        ],
      },
      {
        name: '생활용품 최소화',
        description: '중복되거나 불필요한 생활용품을 정리하세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '🧹',
        tasks: [
          { name: '주방용품 정리' },
          { name: '욕실용품 정리' },
          { name: '사용하지 않는 물건 처분' },
        ],
      },
      {
        name: '소비 습관 점검하기',
        description: '지난 한 달 소비 내역을 확인하고 불필요한 지출을 줄여보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '💰',
        tasks: [
          { name: '지난 달 소비 내역 정리' },
          { name: '불필요한 구독 서비스 해지' },
        ],
      },
    ],
  },
  {
    name: '건강한 식습관 만들기',
    description:
      '매일 건강한 식사를 통해 몸과 마음의 변화를 느껴보세요. 작은 식단 변화가 건강을 크게 바꿔줍니다.',
    icon: '🥗',
    category: '라이프스타일',
    missions: [
      {
        name: '아침 식사 챙겨 먹기',
        description: '바쁜 아침에도 간단하게라도 아침 식사를 꼭 챙겨 먹어보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🍳',
        tasks: [
          { name: '아침 식사 메뉴 정하기' },
          { name: '아침 식사 완료' },
        ],
      },
      {
        name: '물 2L 마시기',
        description: '하루에 물 2리터 이상 마시는 습관을 들여보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '💧',
        tasks: [
          { name: '오전에 물 1L 마시기' },
          { name: '오후에 물 1L 마시기' },
        ],
      },
      {
        name: '야식 참기',
        description: '밤 9시 이후에는 음식을 먹지 않는 습관을 만들어보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🚫',
        tasks: [
          { name: '저녁 8시 전에 마지막 식사 마치기' },
          { name: '야식 대신 허브차 한 잔 마시기' },
        ],
      },
    ],
  },

  // ===== 시즌/트렌드 =====
  {
    name: '2026 봄 러닝 챌린지',
    description:
      '따뜻한 봄바람과 함께 달려보세요! 4월 한 달간 진행되는 특별 러닝 챌린지입니다. 벚꽃 길을 달리며 봄을 만끽해요.',
    icon: '🌸',
    category: '시즌/트렌드',
    startDate: new Date('2026-04-01T00:00:00Z'),
    endDate: new Date('2026-04-30T23:59:59Z'),
    missions: [
      {
        name: '봄 러닝 코스 달리기',
        description: '근처 공원이나 벚꽃 명소에서 러닝을 즐겨보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🏃',
        tasks: [
          { name: '3km 이상 러닝' },
          { name: '러닝 인증샷 찍기' },
        ],
      },
      {
        name: '러닝 크루 함께 달리기',
        description: '혼자가 아닌 함께! 러닝 크루와 함께 달려보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '👥',
        tasks: [
          { name: '러닝 크루 또는 친구와 함께 달리기' },
          { name: '러닝 후 소감 나누기' },
          { name: '다음 러닝 약속 잡기' },
        ],
      },
      {
        name: '주간 러닝 목표 달성',
        description: '매주 총 러닝 거리 목표를 세우고 달성해보세요.',
        repeatType: MissionRepeatType.DAILY,
        icon: '🎯',
        tasks: [
          { name: '주간 러닝 거리 목표 설정' },
          { name: '주간 목표 달성 여부 체크' },
        ],
      },
    ],
  },
  {
    name: '새해 목표 달성',
    description:
      '2026년 새해 목표를 세우고 1분기 안에 달성해보세요! 작심삼일은 이제 그만, 함께 도전하면 해낼 수 있어요.',
    icon: '🎯',
    category: '시즌/트렌드',
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2026-03-31T23:59:59Z'),
    missions: [
      {
        name: '새해 목표 3가지 정하기',
        description: '올해 꼭 이루고 싶은 목표 3가지를 구체적으로 정해보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '📋',
        tasks: [
          { name: '목표 3가지 작성하기' },
          { name: '목표별 달성 기준 정하기' },
          { name: '목표를 잘 보이는 곳에 붙여두기' },
        ],
      },
      {
        name: '월별 실행 계획 세우기',
        description: '목표를 달성하기 위한 월별 실행 계획을 세워보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '📅',
        tasks: [
          { name: '1월 실행 계획 세우기' },
          { name: '2월 실행 계획 세우기' },
          { name: '3월 실행 계획 세우기' },
        ],
      },
      {
        name: '1월 목표 실행하기',
        description: '1월 계획을 실행하고 중간 점검을 해보세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '🚀',
        tasks: [
          { name: '1월 계획 실행' },
          { name: '1월 중간 점검 및 회고' },
        ],
      },
      {
        name: '1분기 회고 및 목표 점검',
        description: '3개월간의 진행 상황을 돌아보고 남은 목표를 점검하세요.',
        repeatType: MissionRepeatType.NONE,
        icon: '📊',
        tasks: [
          { name: '목표 달성률 체크' },
          { name: '잘한 점과 아쉬운 점 정리' },
          { name: '2분기 목표 수정 및 보완' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...');

  const creatorId = 1;

  for (const achievementData of seedData) {
    console.log(`  📌 공개 업적 생성: ${achievementData.name}`);

    // 공개 업적 생성 (이름으로 중복 체크)
    const existingAchievement = await prisma.publicAchievement.findFirst({
      where: {
        name: achievementData.name,
        creatorId,
        deletedAt: null,
      },
    });

    if (existingAchievement) {
      console.log(`    ⏭️ 이미 존재하는 업적이므로 건너뜁니다: ${achievementData.name}`);
      continue;
    }

    const publicAchievement = await prisma.publicAchievement.create({
      data: {
        creatorId,
        name: achievementData.name,
        description: achievementData.description,
        icon: achievementData.icon,
        category: achievementData.category,
        startDate: achievementData.startDate ?? null,
        endDate: achievementData.endDate ?? null,
      },
    });

    // 공개 미션 및 하위 작업 생성
    for (const missionData of achievementData.missions) {
      console.log(`    🎯 공개 미션 생성: ${missionData.name}`);

      const publicMission = await prisma.publicMission.create({
        data: {
          publicAchievementId: publicAchievement.id,
          name: missionData.name,
          description: missionData.description,
          repeatType: missionData.repeatType,
          repeatDays: missionData.repeatDays ?? [],
          icon: missionData.icon ?? null,
        },
      });

      // 하위 작업 생성
      for (const taskData of missionData.tasks) {
        await prisma.publicMissionTask.create({
          data: {
            publicMissionId: publicMission.id,
            name: taskData.name,
          },
        });
      }
    }
  }

  console.log('');
  console.log('✅ 시드 데이터 생성이 완료되었습니다!');

  // 생성 결과 요약
  const achievementCount = await prisma.publicAchievement.count({
    where: { deletedAt: null },
  });
  const missionCount = await prisma.publicMission.count({
    where: { deletedAt: null },
  });
  const taskCount = await prisma.publicMissionTask.count({
    where: { deletedAt: null },
  });

  console.log(`  📊 총 공개 업적: ${achievementCount}개`);
  console.log(`  📊 총 공개 미션: ${missionCount}개`);
  console.log(`  📊 총 공개 작업: ${taskCount}개`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 시드 데이터 생성 중 오류가 발생했습니다:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
