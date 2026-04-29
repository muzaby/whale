# Step 03 — 기본 컴포넌트 (Icon, Slider, Seg)

> **목표**: 작고 재사용 빈도 높은 컴포넌트가 어떤 패턴으로 작성되었는지 익힌다. 특히 SVG 아이콘 시스템과 제네릭 컴포넌트.
>
> **참고 파일**: `whale-app/src/components/Icon.tsx`, `Slider.tsx`, `Seg.tsx`

## 1. Icon — SVG 인라인 아이콘 시스템

### 패턴

```tsx
const PATHS: Record<IconName, React.ReactNode> = {
  home:    <><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></>,
  search:  <><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></>,
  // ... 44개
}

export function Icon({ name, size = 14, stroke = 1.6, className = '', style = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}
    >
      {PATHS[name]}
    </svg>
  )
}
```

### 핵심 설계 결정

**(a) 모든 아이콘을 한 객체에 넣었다**
- 장점: 사용처에서 `<Icon name="home" />`만 쓰면 됨. 임포트 한 번.
- 단점: 코드 분할이 안 됨 (44개 경로가 항상 번들에 포함).
- 본 프로젝트 규모에서는 장점이 크다고 판단.

**(b) `stroke="currentColor"`**
- 아이콘은 부모의 `color` 값을 자동으로 따름.
- `<button style={{ color: 'red' }}><Icon name="home" /></button>` → 빨간 아이콘.
- 액센트 변경시 별도 처리 없이 자동 반영.

**(c) `viewBox="0 0 24 24"` 통일**
- 모든 아이콘이 24x24 그리드 기준으로 그려졌다고 약속.
- size prop만 바꾸면 비례 스케일.

**(d) 1.6px stroke + round caps**
- 모든 아이콘이 시각적으로 같은 두께로 보이게.
- "hairline" 스타일 — Lightroom/Davinci 같은 전문가 툴 분위기.

### TypeScript 포인트

```tsx
type IconName = 'home' | 'sparkle' | 'folder' | ...
```

**왜 `string`이 아니라 union?**
- 컴파일러가 오타를 잡아줌 (`<Icon name="hoem" />` → 타입 에러).
- IDE 자동완성이 작동.
- `PATHS` 객체와 동기화 보장 (`Record<IconName, ...>`로 강제).

## 2. Slider — 범용 range 입력

### 시그니처

```tsx
interface SliderProps {
  label: string
  value: number
  min?: number     // -100
  max?: number     // 100
  step?: number    // 1
  unit?: string    // "K", "%"
  onChange?: (v: number) => void
  color?: string   // 표시용 라벨 점 색상
}
```

### 핵심 트릭 — 그라데이션으로 진행률 표시

native `<input type="range">`는 진행 부분에 색을 칠하기 어렵습니다 (브라우저별 다름). 본 프로젝트는 **선형 그라데이션**으로 우회:

```tsx
const pct = ((value - min) / (max - min)) * 100

<input type="range" ... style={{
  background: `linear-gradient(to right,
    var(--accent) 0%,
    var(--accent) ${pct}%,
    var(--border) ${pct}%,
    var(--border) 100%)`,
}} />
```

값이 0/100 사이를 갈 때 **하드 컷오프**된 그라데이션이 채워지는 것처럼 보입니다.

### 값 표시 — `tabular-nums`

```tsx
<span className="val num">{value > 0 ? '+' : ''}{value}{unit}</span>
```

- `+` 부호: 음수는 자동으로 `-`가 붙으므로 양수만 명시.
- `.num` 클래스: 숫자 폭 균일화 → 슬라이더 끌 때 값 박스가 떨리지 않음.

## 3. Seg — 제네릭 세그먼트 컨트롤

### 왜 제네릭으로?

```tsx
<Seg<CompareMode>
  value={mode}                    // 'split' | 'slider' | 'overlay'
  onChange={setMode}
  options={[
    { v: 'split',   label: 'Split',  icon: 'split' },
    { v: 'slider',  label: 'Slider', icon: 'slider' },
    { v: 'overlay', label: 'A / B',  icon: 'layers' },
  ]}
/>
```

**제네릭이 없다면**:
```tsx
// onChange 시그니처가 (v: string) => void가 됨
// → 호출처에서 setMode(v as CompareMode)로 캐스팅 필요
```

**제네릭으로 정의**:
```tsx
export function Seg<T extends string>({ value, onChange, options }: {
  value: T
  onChange: (v: T) => void
  options: { v: T; label: string; icon?: string }[]
}) { ... }
```

→ 호출처에서 `setMode`가 받는 타입과 `options[].v`가 정확히 같음을 보장.

### 시각적 트릭 — "active 인디케이터"가 진짜 div

대부분의 사람은 active 표시를 `:before` 의사 요소로 그릴 수 있다고 생각합니다. 본 프로젝트는 더 단순하게:

```css
.seg button.active {
  background: var(--panel);   /* 흰색 알약 */
  color: var(--fg);
  box-shadow: var(--shadow-sm);
}
.seg {
  background: var(--bg-subtle);  /* 트랙 */
  padding: 2px;
}
```

- 트랙(`.seg`)이 살짝 어두운 회색.
- 활성 버튼만 흰색 + 그림자.
- → 흰색 알약이 트랙 위에 떠있는 것처럼 보임.

복잡한 transform 애니메이션 없이도 **물리적 깊이감**을 만들었습니다.

## 4. 데모 — 컴포넌트 조합

```html
<!-- demo: tokens + 컴포넌트 -->
<div style="display: flex; gap: 12px; align-items: center;">
  <button class="btn primary">
    <!-- Icon + 텍스트 -->
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.6">
      <path d="M12 5v14M5 12h14"/>
    </svg>
    Add block
  </button>

  <div class="seg">
    <button class="active">Node</button>
    <button>List</button>
    <button>Timeline</button>
  </div>
</div>
```

`<style>`은 `app.css`에서 로드된다고 가정.

## 5. 컴포넌트 추가 시 체크리스트

신규 컴포넌트를 추가할 때 본 프로젝트의 컨벤션:

- [ ] 한 파일 = 한 컴포넌트 (export function)
- [ ] Props 인터페이스를 파일 상단에 정의
- [ ] 토큰만 사용 (직접 색상 / hex 금지)
- [ ] 페이지 전용 스타일은 인라인 `<style>{...}</style>`
- [ ] 재사용성 있으면 `app.css`에 클래스 추가
- [ ] 아이콘은 반드시 `<Icon />` 사용 (직접 SVG 작성 금지)
- [ ] 이벤트 핸들러는 `onChange`, `onClick` 등 React 컨벤션
- [ ] 숫자 표시에는 `.num` 클래스
- [ ] 모노스페이스 텍스트(파일명, 좌표 등)에는 `.mono` 클래스

## 6. 직접 해보기

1. **새 아이콘 추가**: `Icon.tsx`의 `IconName` 타입과 `PATHS`에 `'cloud'` 아이콘을 추가하세요. (힌트: SVG는 lucide.dev 에서 가져올 수 있음)
2. **Toggle 컴포넌트**: `Seg`를 응용해서 boolean용 `Toggle` 컴포넌트를 만들어보세요. 옵션 2개짜리 Seg와 다른 점이 뭐가 있을까요?
3. **NumberInput 컴포넌트**: 슬라이더와 함께 쓸 수 있는 숫자 입력 박스를 만들어보세요. 슬라이더 값과 양방향 동기화되는 게 포인트.
4. **Icon 자동 등록**: 현재는 `PATHS`에 수동으로 추가합니다. 빌드 시 `icons/*.svg`를 읽어서 자동 등록하는 Vite 플러그인을 만들 수 있을까요? (생각만 해보기)

---

이전: [Step 02](./step-02-tokens.md) · 다음: [Step 04 — 페이지 셸 & 라우팅](./step-04-shell.md)
