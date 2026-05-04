# project-tailwind

`project/`(native CSS 목업)을 Vite + React + Tailwind CSS v3 환경으로 포팅한 결과물.
원본 디자인/동작은 보존하면서 모든 inline `<style>` 블록과 `styles/*.css`를
유틸리티 클래스로 교체했다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 산출물
npm run preview  # 빌드 결과 미리보기
```

## 포팅 전략 — 핵심 결정

| 항목 | 결정 | 이유 |
|------|------|------|
| 빌드 | Vite 5 + React 18 | 원본의 `Babel standalone + UMD CDN` 방식을 표준 번들러 파이프라인으로 교체 |
| 스타일 | Tailwind v3 (`@tailwind base/components/utilities`) | v3가 안정적이고 OKLCH 임의값/`@apply` 지원 |
| 토큰 | CSS 변수 + `theme.extend.colors: var(--…)` 매핑 | `[data-accent="…"]` 런타임 테마 스왑을 그대로 보존 |
| 색 네임스페이스 | `surface / line / ink / accent / chart` | Tailwind 빌트인 `bg`, `border` 등과 충돌 회피 |
| Pseudo-element | 실제 DOM 노드로 치환 | Tailwind 컨벤션은 `before:/after:` 보다 children 선호 |
| 동적 스타일 | data-driven 값(예: 카테고리 색, 슬라이더 그라디언트 stop, conic-gradient)만 `style={}` 유지 | 클래스로 표현 불가능한 케이스에 한정 |
| 데이터 분리 | `PIPELINE`, `LIB_ITEMS` 등 상수를 `src/data/`로 추출 | 컴포넌트 파일 슬림화 |

## 파일별 변경 요약

### 빌드/엔트리

| 파일 | 원본 → 변환 | 비고 |
|------|------------|------|
| `package.json` | (없음) → 신규 | scripts: `dev`/`build`/`preview`, deps: react, react-dom, devDeps: vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer |
| `vite.config.js` | (없음) → 신규 | React 플러그인만 등록 |
| `postcss.config.js` | (없음) → 신규 | tailwindcss + autoprefixer |
| `tailwind.config.js` | (없음) → 신규 | `theme.extend.colors`를 `var(--…)`로 매핑, `borderRadius`/`boxShadow`/`fontFamily` 토큰 정의 |
| `index.html` | `Whale.html`(142줄) → 18줄 | UMD 스크립트·`<script type="text/babel">` 제거, `<script type="module" src="/src/main.jsx">`로 대체. IBM Plex 웹폰트 link만 유지 |
| `src/main.jsx` | (없음) → 신규 | `createRoot` + `import "./index.css"` |
| `.gitignore` | (없음) → 신규 | node_modules, dist, .vite, *.log |

### 토큰/전역 스타일

| 파일 | 원본 | 변환 | 전략 |
|------|------|------|------|
| `src/index.css` | `tokens.css` 101줄 + `app.css` 354줄 (총 455줄) | 135줄 | `@tailwind` 3 directives + `@layer base`에 **CSS 변수 + 폰트/스크롤바만** 보존, 나머지 `app.css`의 컴포넌트 클래스(`.btn`, `.panel`, `.tweaks` 등)는 **모두 폐기**하고 컴포넌트별 utility 조합으로 흡수. range thumb pseudo-element는 Tailwind 표현 불가하므로 `@layer utilities .whale-range`로 단일 helper 유지. `@apply`는 `body`에만 1회 사용 |

### 데이터 (신규 추출)

| 파일 | 출처 | 내용 |
|------|------|------|
| `src/data/pipeline.js` | `e2e_pipeline.jsx` 상단 | `PIPELINE` (블록 13개), `CAT_COLOR` (카테고리 6색 OKLCH) |
| `src/data/library.js` | `library.jsx` 상단 | `LIB_ITEMS`(18), `COLLECTIONS`(4), `SESSIONS`(6), `ALL_TAGS`(17) |

### 컴포넌트

#### `src/components/primitives.jsx` (원본 135줄 → 493줄)

원본은 `Icon / PhImg / TopBar / Slider / Seg`만 정의하고 `.btn`, `.badge`, `.kbd-chip` 등은 전역 CSS 클래스에 의존했다. 변환 시 이를 모두 React 컴포넌트로 흡수.

| 심볼 | 변환 |
|------|------|
| `cx()` | (신규) className 결합 헬퍼 |
| `Icon` | path 데이터는 동일. `className`/`style` prop만 SVG에 전달 |
| `PhImg` | stripe 그라디언트는 hue가 동적이므로 `style` 유지. 컨테이너만 utility 클래스 |
| `Btn` | (신규) `.btn`, `.btn.sm`, `.btn.primary`, `.btn.ghost`, `.btn.danger`, `.btn.icon` 모두 props로 흡수 (`variant`, `size`, `icon`) |
| `Badge` | (신규) `.badge`, `.badge.ok/warn/accent/sim`, `.badge.dot`을 `variant`/`dot` props로. `::before` dot은 실제 `<span>` |
| `KbdChip` | (신규) `.kbd-chip` → 컴포넌트화 |
| `TopBar` | grid layout/네비 active 토글 모두 utility로. 사용자 아바타의 OKLCH 배경만 inline `style` 유지 |
| `Slider` | grid + range input. 트랙의 진행률 그라디언트는 동적이므로 `style` 유지, 트랙/라벨/값 박스는 utility |
| `Seg` | `.seg` segmented 컨트롤 → `grid-flow-col auto-cols-fr`로 |
| `Input`, `Select` | (신규) `.input`/`.select`/`.input.search`. search variant는 SVG icon을 absolute 자식으로 두는 방식으로 재구현(원본은 background-image data URL) |
| `SectionTitle` | (신규) `.section-title` 패턴 컴포넌트화 |

#### `src/components/home.jsx` (228줄 → 184줄)

| 영역 | 변환 |
|------|------|
| 인라인 `<style>{`.home { … }`}</style>` 블록 (약 100줄) | **전량 제거** |
| `.home-inner` (max-width 1280) | `mx-auto max-w-[1280px] px-10 pb-20 pt-9` |
| `.qcard` 호버 시 `transform: translateY(-1px)` | `hover:-translate-y-px hover:border-accent` |
| `.proj .preview::after` 그라디언트 오버레이 | 실제 `<div aria-hidden absolute inset-0>` 자식으로 치환 |
| `.stat`/`.activity` 그리드 | `grid-cols-4`/`grid-cols-[16px_1fr_auto_auto]` arbitrary value |
| 데이터 상수 `QUICK`, `STATS`, `PROJECTS`, `ACTIVITY` | 함수 외부로 호이스팅 |

#### `src/components/e2e_pipeline.jsx` (332줄 → 297줄)

3개 뷰(`NodeGraph`, `StepList`, `Timeline`)의 인라인 `<style>` 블록 모두 제거.

| 변환 포인트 | 처리 |
|---|---|
| `.nodegraph-wrap` 도트 패턴 배경 | 동적 패턴이라 `style={{ background: "radial-gradient(…)" }}` 유지 |
| `.node` 카드 (sel/bypass 상태) | `cx()`로 조건부 utility |
| `.node .port` (좌·우 5px out 위치) | absolute 자식 `<div>`로 (좌/우 각각) — 원본 `.port.in/.out` 클래스 대체 |
| `.node .cat-bar` (상단 3px 카테고리 색) | absolute 자식 `<div>` + 카테고리 색은 `style` 유지 |
| `.step .idx::before` (4px 카테고리 막대) | 실제 `<span>` 자식 |
| `.tl-block` 동적 left/width/배경/borderLeft | `color-mix(in oklch, …)`이라 `style` 유지 |
| `.tl-scale .tick`, `.tl-row` 그리드 | `grid-cols-[130px_1fr_60px]` arbitrary value |
| `LANES`, `TL_LANES` 상수 | 모듈 스코프로 호이스팅 |

#### `src/components/compare.jsx` (174줄 → 222줄)

| 변환 포인트 | 처리 |
|---|---|
| `.cv-stage` 4단 체커보드 배경 | 정적 그라디언트 4겹이라 `CHECKER_BG` 객체로 정리 후 `style={CHECKER_BG}` |
| `.cv-pane .label.ref/.sim` | `PaneLabel({ kind, side })` 보조 컴포넌트로 추출 |
| `.cv-pane .info` | `PaneInfo` 보조 컴포넌트 |
| `.cv-slider-b { clip-path: polygon(var(--sx) …) }` | `style={{ clipPath: \`polygon(${slider}% 0, …)\` }}`로 직접 치환 (CSS var 우회) |
| `.cv-handle::before` (34×34 원) | 실제 자식 `<div>` |
| `.cv-handle::after` (◂▸ 텍스트) | 자식 텍스트로 통합 |
| 줌 컨트롤 `+/−/value` | `inline-flex` + `border-x` divider |
| 하단 stats `.stat .k/.v` | `<span>` 인라인으로 평탄화 |

#### `src/components/tuning_panel.jsx` (419줄 → 625줄)

가장 복잡한 파일. 4개 sub-component(`ToneCurve`, `ColorWheel`, `HSL`, `Histogram`) 각각의 `<style>` 블록 제거.

| 변환 포인트 | 처리 |
|---|---|
| `ToneCurve` 채널 버튼 (`.r/.g/.b.active` 별 배경색) | active 상태 4종을 객체 테이블로 정리, active일 때만 `style`로 색 적용 |
| 곡선 stroke / 히스토그램 fill 색 | 채널별 색 매핑 객체 → SVG `stroke`/`fill` 속성에 직접 전달 |
| `ColorWheel .disc` conic-gradient | 정적이지만 8단계라 길어서 `style` 유지 |
| `.disc::after` 하이라이트 | 자식 `<div aria-hidden>` |
| `.puck` 위치 transform | 동적이라 `style` 유지 |
| `Histogram` SVG 색 4종 | OKLCH alpha라 `style`/속성에 그대로 |
| `.section` border-bottom 패턴 | `Section` wrapper 보조 컴포넌트 (`border-b last:border-b-0`) |
| `.toggle.on` (BYPASS/ACTIVE) | `cx`로 active 상태 클래스 |
| 7가지 블록 타입(`curve/hsl/wheel/wb/lut/detail/generic`) 분기 | 원본 그대로, 내부만 utility로 |

#### `src/components/e2e_page.jsx` (78줄 → 94줄)

| 변환 포인트 | 처리 |
|---|---|
| `grid-template-rows: 1fr auto ${pipeH}px` | inline `style={{ gridTemplateRows: ... }}` 유지 (resize 시 동적) |
| `.e2e-resizer::after` 핸들 막대 | absolute 자식 `<div>` |
| pipeline header 한 줄(타이틀/배지·통계/뷰 토글/액션) | flex + `flex-1` spacer로 재현 |
| `Spacer` 클래스 | 일반 `<div className="flex-1" />` 사용 |

#### `src/components/library.jsx` (333줄 → 366줄)

| 변환 포인트 | 처리 |
|---|---|
| `.lib { grid-template-columns: 220px 1fr }` | `grid-cols-[220px_1fr]` |
| `.lib-side .it` (콜렉션/세션 항목) | `SideItem` 컴포넌트로 추출 |
| `.sh` (사이드바 헤더) | `SideHeader` 컴포넌트 |
| `.lib-tag` (active 시 inverted) | `LibTag` 컴포넌트, `cx`로 active 분기 |
| `.lib-card .chk` (hover 시에만 보이는 체크박스) | Tailwind `group/group-hover:flex` 패턴 |
| `.lib-card.sel .chk` (selected 강제 표시) | `[isSel && "!flex"]` important + utility 조합 |
| `.lib-table` 9컬럼 grid | `TR_GRID` 상수로 추출(`grid-cols-[24px_56px_2fr_…]`) 후 헤더/행 공유 |
| 검색 input의 SVG 배경 | `<Input search>` (primitives) — 별도 absolute icon |
| favorite star 색상 (active/inactive) | 인라인 `style` (OKLCH 임의색) |

### `src/App.jsx` (원본 `Whale.html` 내 `<App>`/`<Tweaks>` 109줄 → 162줄)

| 변환 포인트 | 처리 |
|---|---|
| 페이지 라우팅 / localStorage / postMessage 핸드셰이크 | 동작 동일하게 보존 |
| `data-accent` attr 토글 + `--density-pad` CSS 변수 갱신 | 동작 동일 |
| `.tweaks` 패널 (fixed 우하단, shadow-lg) | 모두 utility — `fixed bottom-3.5 right-3.5 z-[100] w-[280px] shadow-lg` |
| `.swatch-row button.active` (outline 2px + offset) | `outline outline-2 outline-offset-1 outline-ink` |
| crumb의 `.sep` (가운데 점 구분자) | `<span className="text-ink-faint">/</span>` 인라인 |

## 라인 수 비교

| 항목 | 원본 (project/) | 변환 (project-tailwind/src/) |
|------|---:|---:|
| CSS (`tokens.css` + `app.css`) | 455 | 135 (index.css, 토큰만) |
| HTML (`Whale.html`) | 142 | 18 (index.html) + 162 (App.jsx) |
| 컴포넌트 JSX (7개) | 1,699 | 2,331 |
| 데이터 (신규) | — | 70 |
| **총합** | **2,296** | **2,716** |

JSX 라인 수가 늘어난 이유: ① pseudo-element를 실제 DOM으로 펼침,
② 각 utility 클래스가 한 줄에 하나씩 가독성을 위해 줄바꿈됨,
③ inline `<style>` 제거로 발생한 prop drilling/conditional 처리가 명시적으로 노출됨.
번들 결과물은 압축 후 60 KB(JS gzip) + 5.6 KB(CSS gzip)로 더 작다.

## 참고 — 의도적으로 `style={}`을 유지한 케이스

Tailwind 컨벤션상 utility 우선이 원칙이지만, 다음 케이스는 클래스로 표현이
불가능하거나 불합리하여 inline style을 유지했다.

1. **데이터 driven 색**: 카테고리(`CAT_COLOR`), 사용자 아바타 hue, hue prop 기반 placeholder 그라디언트
2. **연속값**: Slider 트랙의 진행률 그라디언트 stop, ColorWheel puck transform, Compare slider clip-path
3. **장문의 conic/radial-gradient**: ColorWheel disc(8단계 conic), Compare 체커보드(4단 linear-gradient 합성)
4. **OKLCH α 합성색**: Histogram SVG path fill/stroke
5. **resize handle**: pipeH state 기반 `gridTemplateRows`

## 디렉토리

```
project-tailwind/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── .gitignore
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── data/
    │   ├── pipeline.js
    │   └── library.js
    └── components/
        ├── primitives.jsx
        ├── home.jsx
        ├── e2e_page.jsx
        ├── e2e_pipeline.jsx
        ├── compare.jsx
        ├── tuning_panel.jsx
        └── library.jsx
```
