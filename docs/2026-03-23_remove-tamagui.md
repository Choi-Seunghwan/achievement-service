# Tamagui 제거 및 NativeWind 마이그레이션 (2026-03-23)

## 작업 요약
`achievement-app`에서 Tamagui UI 프레임워크를 완전히 제거하고, **NativeWind(Tailwind CSS) + React Native 기본 컴포넌트 + 자체 UI 컴포넌트**로 대체.

## 변경 이유
- Tamagui 의존성 축소 및 모던한 스타일링 방식으로 전환
- NativeWind(Tailwind CSS)가 이미 설치되어 있었으나 설정이 불완전한 상태였음
- 더 가볍고 유지보수가 쉬운 구조로 전환

## 제거된 패키지 (8개)
- `tamagui`
- `@tamagui/config`
- `@tamagui/core`
- `@tamagui/lucide-icons`
- `@tamagui/sheet`
- `@tamagui/theme`
- `@tamagui/toast`
- `@tamagui/babel-plugin` (devDependencies)

## 추가된 패키지 (1개)
- `lucide-react-native` — @tamagui/lucide-icons 대체 (동일 아이콘셋)

## 변경 사항

### 1. NativeWind 인프라 완성

**신규 파일:**
- `global.css` — Tailwind 디렉티브 (`@tailwind base/components/utilities`)
- `metro.config.js` — `withNativeWind` 래퍼 적용

**수정된 파일:**
- `tailwind.config.js` — content 경로에 `./components/**` 추가, 커스텀 색상 토큰 정의 (mint, dark, danger, success, warning, accent, muted, bg-main, bg-card)
- `babel.config.js` — `@tamagui/babel-plugin` 설정 제거
- `app/_layout.tsx` — `import "../global.css"` 추가

### 2. 자체 UI 컴포넌트 생성 (`components/ui/`)

| 파일 | 설명 |
|---|---|
| `Button.tsx` | Pressable 기반, variant(filled/outlined/ghost), circular, icon 지원 |
| `Input.tsx` | RN TextInput + NativeWind 스타일 |
| `TextArea.tsx` | TextInput multiline + NativeWind |
| `Card.tsx` | View/Pressable, onPress 지원 |
| `Avatar.tsx` | 크기(xs~xl), source, fallback, bordered 지원 |
| `Checkbox.tsx` | Pressable + 체크 아이콘, label 지원 |
| `Separator.tsx` | horizontal/vertical 구분선 |
| `Sheet.tsx` | RN Modal 기반 바텀 시트, snapPoint 지원 |
| `Dialog.tsx` | RN Modal 기반 다이얼로그 + DialogContent/Title/Description |
| `Popover.tsx` | Modal + measureInWindow 위치 계산 |
| `index.ts` | 통합 export |

### 3. Toast 시스템 전환

- `hooks/useToast.ts` — `@tamagui/toast` → `burnt` (네이티브 토스트)
- `components/toast/CurrentToast.tsx` — 빈 컴포넌트로 대체 (burnt는 네이티브 토스트 사용)

### 4. 아이콘 전환

- 25개 파일에서 `@tamagui/lucide-icons` → `lucide-react-native`로 일괄 변경
- 아이콘 `size` prop: Tamagui 토큰(`$1`) → 숫자(`20`) 변환

### 5. 프로바이더 정리 (`app/_layout.tsx`)

제거:
- `TamaguiProvider` + config import
- `PortalProvider`
- `ToastProvider`, `ToastViewport`, `CurrentToast`

최종 구조:
```
QueryClientProvider
  LoadingOverlayProvider
    SafeAreaView
      TagSheetProvider
        Stack (expo-router)
```

### 6. 컴포넌트 마이그레이션 (약 40개 파일)

**Tamagui → NativeWind 매핑 규칙:**
| Tamagui | NativeWind |
|---|---|
| `<View>` | `<View className="...">` |
| `<XStack gap="$2">` | `<View className="flex-row gap-2">` |
| `<YStack gap="$2">` | `<View className="gap-2">` |
| `<Text fontSize="$5" fontWeight="bold">` | `<Text className="text-lg font-bold">` |
| `<Button circular>` | `<Pressable className="rounded-full ...">` |
| `<Card bordered>` | `<Card>` (자체 UI) |
| `<Sheet snapPoints={[30]}>` | `<Sheet snapPoint={30}>` (자체 UI) |
| `<Dialog>` | `<Dialog>` (자체 UI) |
| `<Separator>` | `<Separator>` (자체 UI) |

**Tamagui 토큰 → hex 변환:**
| 토큰 | hex |
|---|---|
| `$color.mint1` | `#25C685` |
| `$color.mint2` | `#3DD598` |
| `$color.white1` | `#FFFFFF` |
| `$color.white2`, `$white9`, `$white10` | `#96A7AF` |
| `$color.red1` | `#FF464F` |
| `$color.yellow1` | `#FFBC25` |
| `$color.green1` | `#25C685` |
| `$color.purple1` | `#6952DC` |
| `$color.blue1` | `#3F72AF` |
| `$background.bg` | `#000000` |
| `$background.bg1` | `#30444E` |

**마이그레이션된 컴포넌트 그룹:**

그룹 A (단순):
- `text/Required.tsx`, `chip/Chip.tsx`, `chip/NoneRepeatMissionChip.tsx`, `chip/DailyRepeatMissionChip.tsx`
- `chip/ChipInput.tsx`, `RepeatSummary.tsx`, `RepeatDaySelector.tsx`, `RepeatTypeSelector.tsx`
- `mission-list/MissionStatusChip.tsx`, `mission-list/MissionCheckButton.tsx`, `color/ColorPalette.tsx`

그룹 B (중간):
- `EmojiAvatar.tsx`, `loading/LoadingOverlayProvider.tsx`, `checkbox/CheckboxWithLabel.tsx`
- `mission-list/MissionList.tsx`, `achievement-list/AchievementList.tsx`
- `public-achievement-list/PublicAchievementList.tsx`, `public-mission-list/public-mission-list.tsx`
- `missin-select-list/MissionSelectList.tsx`, `mision-task/MissionTaskEdit.tsx`
- `mission/MissionForm.tsx`, `mission-tag/TagFilter.tsx`, `mission-tag/MissionTagEdit.tsx`

그룹 C/D (Sheet, Dialog, Popover):
- `sheet/MissionTaskSheet.tsx`, `sheet/RepeatTypeSheet.tsx`
- `mission-tag/MissionTagSheet.tsx`, `mission-tag/AddMissionTagSheet.tsx`
- `FeedbackModal.tsx`, `participant/ParticipantModal.tsx`, `AvatarSelectionModal.tsx`
- `achievement/AchievementMorePopover.tsx`, `MisisonListPopover.tsx`

그룹 E (페이지):
- `app/(main)/(tabs)/_layout.tsx`, `index.tsx`, `achievements.tsx`, `explorer.tsx`, `my.tsx`
- `app/(main)/missions/new.tsx`, `[id].tsx`
- `app/(main)/achievements/new.tsx`, `[id].tsx`
- `app/(main)/public/[id].tsx`
- `app/auth/auth.tsx`, `app/onboarding/index.tsx`, `app/search.tsx`

### 7. 기타 정리

- `constants/color.ts` — Tamagui 토큰(`$color.xxx`) → hex 값으로 변환
- `tamagui.config.ts` — 삭제

## 삭제된 파일
- `tamagui.config.ts`

## Tailwind 커스텀 색상 (`tailwind.config.js`)
```
mint: { 1: "#25C685", 2: "#3DD598", 3: "#286053" }
dark: { 1: "#2A3C44", 2: "#23343C", 3: "#1F2E35" }
danger: { 1: "#FF464F", 2: "#FF575F", 3: "#FFE5E7" }
success: { 1: "#25C685", 2: "#3DD598", 3: "#D4F5E9" }
warning: { 1: "#FF8A34", 2: "#FF8A34", 3: "#FFEFE3" }
accent-yellow: { 1: "#FFBC25", 2: "#FFC542", 3: "#FEF3D9" }
accent-blue: { 1: "#3F72AF", 2: "#DBE2EF" }
accent-purple: { 1: "#6952DC", 2: "#755FE2", 3: "#EDEAFD" }
muted: { 1: "#96A7AF", 2: "#475E69" }
bg-main: "#000000"
bg-card: "#30444E"
```

## 참고
- `burnt` 패키지는 기존에 이미 설치되어 있었음 (Toast 대체에 활용)
- `react-native-reanimated`도 기존 설치됨 (향후 Sheet 애니메이션 개선 시 활용 가능)
- 화면별 시각적 검증이 필요함 (NativeWind 클래스명/스타일 미세 조정 가능)
