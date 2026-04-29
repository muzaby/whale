# Step 02 — 디자인 토큰과 CSS 시스템

> **목표**: `tokens.css`가 어떻게 디자인의 일관성을 보장하는지, 그리고 `data-accent` 한 줄로 어떻게 전체 테마가 바뀌는지 이해한다.
>
> **참고 파일**: `whale-app/src/styles/tokens.css`, `whale-app/src/styles/app.css`

## 1. 디자인 토큰이란?

디자인 토큰 = 디자인 시스템의 **원자(atom)**. 색, 폰트, 반경, 그림자 같은 값을 **이름으로** 노출해서, 컴포넌트가 직접 hex/px 값을 쓰지 않게 합니다.

**나쁜 예 (토큰 없음)**:
```css
.btn { background: #4a90e2; border-radius: 7px; }
.card { background: #4a90e2; border-radius: 7px; }
/* 색을 바꾸려면 모든 곳을 찾아서 고쳐야 함 */
```

**좋은 예 (토큰 사용)**:
```css
:root {
  --accent: oklch(0.58 0.13 220);
  --r-md: 7px;
}
.btn  { background: var(--accent); border-radius: var(--r-md); }
.card { background: var(--accent); border-radius: var(--r-md); }
/* 토큰 한 곳만 바꾸면 끝 */
```

## 2. Whale의 토큰 카테고리

`tokens.css`는 다음 6개 카테고리로 구성됩니다:

| 카테고리 | 변수 예시 | 용도 |
|---------|----------|------|
| Accent | `--accent`, `--accent-hover`, `--accent-soft` | 강조색 (버튼, 활성 상태, 링크) |
| Neutrals | `--bg`, `--panel`, `--border`, `--fg` | 배경/전경 회색 톤 |
| Status | `--ok`, `--warn`, `--err` | 상태 표시 |
| Data viz | `--red`, `--green`, `--blue`, `--luma` | 히스토그램/차트 |
| Radius | `--r-xs` … `--r-xl` | 모서리 반경 (3, 5, 7, 10, 14px) |
| Type | `--font-sans`, `--font-mono` | 폰트 패밀리 |

## 3. oklch 색공간 — 왜?

`tokens.css`의 거의 모든 색이 `oklch(L C H)` 형식입니다. 예: `oklch(0.58 0.13 220)`.

- **L (Lightness)**: 0~1, 인지적 밝기 (CIELAB 기반)
- **C (Chroma)**: 0~~0.4, 채도
- **H (Hue)**: 0~360, 색상

**hex나 hsl 대신 쓰는 이유**:
1. **인지적 균일성**: `L=0.6` 짜리 빨강과 파랑이 사람 눈에 비슷한 밝기로 보임. hsl은 그렇지 않음.
2. **테마 변형이 쉬움**: hue만 바꿔도 명도는 유지됨 → "Ocean → Amber" 같은 액센트 변경시 명도 충돌 없음.
3. **호버/소프트 변형 자동 계산**: `--accent`가 `oklch(0.58 0.13 220)`이면, `--accent-hover`는 `oklch(0.52 0.14 220)`처럼 L만 살짝 낮춰서 만들면 됨.

## 4. 액센트 색상 전환 — `data-accent` 마법

핵심은 이 4줄입니다 (`tokens.css`):

```css
[data-accent="graphite"] {
  --accent: oklch(0.36 0.02 260);
  --accent-hover: oklch(0.28 0.02 260);
  --accent-soft: oklch(0.95 0.005 260);
  --accent-border: oklch(0.85 0.008 260);
}
[data-accent="amber"] { --accent: oklch(0.70 0.14 55); ... }
[data-accent="teal"]  { --accent: oklch(0.60 0.11 185); ... }
```

그리고 `App.tsx`에서:

```tsx
useEffect(() => {
  document.documentElement.setAttribute(
    'data-accent',
    tweaks.accent === 'ocean' ? '' : tweaks.accent
  )
}, [tweaks])
```

**작동 원리**:
1. `<html data-accent="amber">`로 속성을 변경.
2. CSS 셀렉터 `[data-accent="amber"]`가 매칭되어 `--accent` 값을 amber로 덮어씀.
3. `var(--accent)`를 쓰는 모든 곳이 자동으로 새 값을 사용 → 리렌더 없이 즉시 반영.

이게 **토큰의 진가**입니다. 컴포넌트는 무엇 하나 몰라도 됨.

## 5. 폰트 — IBM Plex 컴비

```css
:root {
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, ...;
  --font-mono: "IBM Plex Mono", ui-monospace, ...;
}
.mono { font-family: var(--font-mono); font-feature-settings: "zero"; }
.num  { font-variant-numeric: tabular-nums; }
```

**왜 IBM Plex?**
- 엔지니어링 툴 분위기 (Inter보다 더 "엔지니어링" 톤)
- Sans + Mono가 같은 패밀리에서 디자인되어 시각적 정합성 좋음
- 무료 (Google Fonts에서 로드)

**`.num` 클래스의 비밀**:
- `font-variant-numeric: tabular-nums` = 숫자를 모두 같은 너비로 렌더.
- 슬라이더 값(`+22`, `-100` 등)이 폭이 변하지 않아 UI가 떨리지 않음.
- 숫자가 자주 바뀌는 곳(`stat .v`, 슬라이더 값)에 항상 적용.

## 6. 데모 — 토큰만으로 컴포넌트 만들기

CSS만으로 어떻게 일관성이 잡히는지 보여주는 작은 예제. 본 프로젝트의 `tokens.css`를 그대로 쓴다고 가정합니다.

```html
<!DOCTYPE html>
<html data-accent="ocean">
<head>
  <link rel="stylesheet" href="../whale-app/src/styles/tokens.css" />
  <style>
    body { padding: 40px; background: var(--bg); color: var(--fg); }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 16px;
      box-shadow: var(--shadow-sm);
      max-width: 320px;
    }
    .btn {
      background: var(--accent);
      color: var(--accent-fg);
      border: 0;
      border-radius: var(--r-sm);
      padding: 6px 12px;
      cursor: pointer;
    }
    .btn:hover { background: var(--accent-hover); }
    h2 { margin: 0 0 8px; font-family: var(--font-sans); }
    code { font-family: var(--font-mono); color: var(--fg-muted); }
  </style>
</head>
<body>
  <div class="card">
    <h2>Hello, Whale</h2>
    <p><code>oklch(0.58 0.13 220)</code></p>
    <button class="btn">Action</button>
  </div>
  <button onclick="document.documentElement.setAttribute('data-accent', 'amber')">→ Amber</button>
  <button onclick="document.documentElement.setAttribute('data-accent', 'teal')">→ Teal</button>
</body>
</html>
```

`<html>`의 `data-accent`만 바꾸면 카드/버튼 색이 즉시 바뀝니다. **컴포넌트 코드는 한 줄도 안 바뀜**.

## 7. `app.css`의 역할 — 토큰을 묶어 컴포넌트 클래스로

`tokens.css`는 원자, `app.css`는 그걸 조합한 분자입니다:

```css
/* app.css의 .btn */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  background: var(--panel);
  font-size: 12px; font-weight: 500;
  color: var(--fg);
  /* ... */
}
.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-fg);
}
```

**규칙**:
- `app.css`는 변형(.btn / .btn.primary / .btn.sm)이 자주 쓰이는 것만.
- 한 페이지에서만 쓰는 스타일은 컴포넌트 안의 인라인 `<style>`로.

## 8. 직접 해보기

1. **새 액센트 추가**: `tokens.css`에 `[data-accent="rose"]` 블록을 추가하고 `App.tsx`의 Tweaks 패널에 rose 옵션을 추가하세요. (힌트: hue=20 근처)
2. **다크 모드 만들기**: `[data-theme="dark"]` 블록을 만들어 `--bg`, `--panel`, `--fg` 등을 반전시켜보세요. 이 디자인은 라이트 전용이라 깨지는 부분이 있을 거예요. 어디가 깨지는지 관찰하세요.
3. **Density 토큰 만들기**: 현재는 `--density-pad`만 있습니다. `--density-font-size`, `--density-row-height` 같은 토큰을 추가해서 정말로 밀도가 변하게 해보세요.

---

이전: [Step 01](./step-01-structure.md) · 다음: [Step 03 — 기본 컴포넌트](./step-03-primitives.md)
