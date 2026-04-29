# Step 01 — 프로젝트 구조 이해하기

> **목표**: `whale-app/` 프로젝트가 어떻게 구성되어 있고, 어떤 파일이 어떤 역할을 하는지 파악한다.

## 1. 디렉토리 한눈에 보기

```
whale-app/
├── index.html              # 진입 HTML — 폰트 로드 + #root + main.tsx 호출
├── package.json            # 의존성 / 스크립트
├── vite.config.ts          # Vite 설정 (대부분 기본값)
├── tsconfig.json           # TypeScript 설정 (3개로 분리: 루트/앱/노드)
├── eslint.config.js        # ESLint 규칙
└── src/
    ├── main.tsx            # createRoot() 진입점
    ├── App.tsx             # 루트 컴포넌트, 페이지 라우팅, Tweaks
    ├── types.ts            # 모든 타입 정의 (PageId, PipelineBlock 등)
    ├── data.ts             # 정적 데이터 (PIPELINE, LIB_ITEMS, ...)
    ├── styles/
    │   ├── tokens.css      # 디자인 토큰 (색/폰트/반경/그림자)
    │   └── app.css         # 공용 스타일 (.btn, .panel, .topbar...)
    └── components/
        ├── Icon.tsx        # 44개 SVG 아이콘
        ├── PhImg.tsx       # placeholder 이미지
        ├── TopBar.tsx      # 상단 네비게이션 바
        ├── Slider.tsx      # 범용 range slider
        ├── Seg.tsx         # segmented control (제네릭)
        ├── Home.tsx        # 홈 페이지
        ├── Library.tsx     # 라이브러리 페이지
        └── e2e/
            ├── E2EPage.tsx       # E2E 페이지 레이아웃
            ├── NodeGraph.tsx     # 노드 그래프 뷰
            ├── StepList.tsx      # 리스트 뷰
            ├── Timeline.tsx      # 타임라인 뷰
            ├── CompareViewer.tsx # 이미지 비교 뷰어
            └── TuningPanel.tsx   # 우측 튜닝 패널
```

## 2. 핵심 흐름

```
브라우저
  ↓
index.html  ←───── Google Fonts (IBM Plex Sans/Mono) 로드
  ↓ <script src="/src/main.tsx">
main.tsx
  ↓ tokens.css + app.css import
  ↓ createRoot(<App />)
App.tsx
  ↓ page state로 분기
  ├─ <Home />        ← 홈 페이지
  ├─ <E2EPage />     ← 파이프라인 + 비교 + 튜닝
  └─ <Library />     ← 이미지 라이브러리
```

## 3. 의존성 흐름 (import 그래프)

```
App.tsx
 ├─ types.ts                          (PageId, Tweaks 등)
 ├─ components/TopBar.tsx
 │   └─ components/Icon.tsx
 ├─ components/Home.tsx
 │   ├─ components/Icon.tsx
 │   └─ components/PhImg.tsx
 ├─ components/e2e/E2EPage.tsx
 │   ├─ data.ts                       (PIPELINE)
 │   ├─ components/Seg.tsx
 │   ├─ components/Icon.tsx
 │   └─ components/e2e/{NodeGraph, StepList, Timeline,
 │                       CompareViewer, TuningPanel}.tsx
 └─ components/Library.tsx
     ├─ data.ts                       (LIB_ITEMS, COLLECTIONS, SESSIONS, ALL_TAGS)
     └─ components/{Icon, PhImg, Seg}.tsx
```

**관찰 포인트**:
- `data.ts`와 `types.ts`는 **잎 노드(leaf)** — 다른 어떤 파일도 import하지 않음. 새 데이터/타입 추가시 여기만 보면 됨.
- `Icon.tsx`는 거의 모든 곳에서 사용됨. 새 아이콘은 여기에만 추가하면 됨.
- 페이지 단위 컴포넌트(`Home`, `E2EPage`, `Library`)가 자기 페이지 안의 스타일까지 책임짐 (인라인 `<style>` 태그 사용).

## 4. 빌드 / 개발 명령어

```json
// package.json scripts
{
  "dev":     "vite",                         // 개발 서버 (HMR)
  "build":   "tsc -b && vite build",         // 타입체크 → 번들
  "lint":    "eslint .",
  "preview": "vite preview"                  // 빌드 결과물 미리보기
}
```

**`tsc -b`의 의미**:
- `tsconfig.json`이 `tsconfig.app.json`과 `tsconfig.node.json`을 references로 묶고 있음.
- `-b` (build mode)는 references를 따라가며 점진적으로 빌드.
- 실제 JS 출력은 안 하고 (`noEmit: true`) 타입 체크만 수행. 번들은 vite가 함.

## 5. 페이지가 추가/수정되는 흐름 (예시)

가령 "Settings" 페이지를 추가한다면:

1. `src/types.ts` — `PageId`에 `'settings'` 추가
2. `src/components/Settings.tsx` 생성
3. `src/App.tsx`에서 `{page === 'settings' && <Settings />}` 분기 추가
4. `src/components/TopBar.tsx`에 nav 버튼 추가

이 4단계로 끝납니다. **컨벤션을 익히면 새 페이지 추가는 30분 안 걸려요.**

## 6. 본 프로젝트의 핵심 설계 결정 3가지

### (a) 인라인 `<style>` + 글로벌 클래스 혼용
- `app.css`에는 **재사용 빈도가 높은** 클래스(`.btn`, `.panel`, `.badge`...)만 정의.
- 페이지 전용 스타일은 컴포넌트 안에 `<style>{...}</style>`로 인라인 작성.
- 이유: CSS Modules / styled-components 같은 도구 없이도 **응집도** 확보. 컴포넌트 파일 하나만 보면 마크업+스타일이 다 보임.
- 단점: 같은 `<style>`이 여러 인스턴스에서 중복 삽입될 수 있음. 본 앱은 페이지 컴포넌트가 보통 1개씩만 마운트되므로 문제없음.

### (b) `data-accent` 속성으로 테마 전환
- `App.tsx`에서 `document.documentElement.setAttribute('data-accent', 'teal')` 식으로만 변경.
- `tokens.css`의 `[data-accent="teal"] { ... }` 셀렉터가 변수만 덮어씀.
- React state에 색상 값을 들고 있을 필요 없음 → 리렌더 부담 0.

### (c) 페이지 라우팅에 라이브러리 안 씀
- `useState<PageId>('home')` + `localStorage.getItem('whale:page')` 만으로 충분.
- URL 동기화 / 깊은 링크 / 뒤로가기 지원이 필요하면 react-router 도입 고려.

## 7. 직접 해보기

1. **의존성 그래프 그려보기**: `whale-app/src/components/e2e/TuningPanel.tsx`를 열고, 그 파일이 import하는 모든 파일을 따라가며 그래프를 손으로 그려보세요.
2. **빌드하고 dist 들여다보기**: `npm run build` 후 `dist/assets/*.js`를 열어보면 모든 코드가 한 파일에 번들되어 있습니다. `oklch`, `IBM Plex` 같은 키워드를 검색해보세요.
3. **새 페이지 추가 연습**: 위의 "Settings 페이지 추가" 4단계를 실제로 해보세요. 빈 컴포넌트라도 OK.

---

다음: [Step 02 — 디자인 토큰](./step-02-tokens.md)
