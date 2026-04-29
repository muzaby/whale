# Step 06 — 이미지 비교 뷰어 (Split / Slider / Overlay)

> **목표**: 한 화면에서 두 이미지를 비교하는 3가지 모드를 어떻게 같은 컴포넌트로 구현했는지, 특히 **clip-path 슬라이더 트릭**과 **마우스 드래그 처리 패턴**을 익힌다.
>
> **참고 파일**: `whale-app/src/components/e2e/CompareViewer.tsx`

## 1. 3가지 비교 모드

| 모드 | 시각화 |
|------|--------|
| **Split** | 좌(reference) ‖ 우(simulation) 나란히 |
| **Slider** | 한 이미지 위에 다른 이미지를 가운데 핸들로 잘라서 |
| **Overlay** | 두 이미지를 `mix-blend-mode: difference`로 겹쳐 차이 강조 |

같은 데이터를 다르게 보여줌으로써 사용자가 **어떤 종류의 차이**를 보고 싶은지에 맞게 선택.

## 2. 메인 컴포넌트 시그니처

```tsx
interface CompareViewerProps {
  mode: CompareMode      // 'split' | 'slider' | 'overlay'
  onMode: (m: CompareMode) => void
  labelA?: string
  labelB?: string
}
```

- `mode`는 **부모가 소유**. 왜? E2E 페이지에서 다른 컨트롤(예: Tweaks)도 모드를 알 수 있어야 함.
- "controlled component" 패턴.

## 3. Split 모드 — CSS Grid 1fr 1fr

```tsx
<div className="cv-split">  {/* grid-template-columns: 1fr 1fr; gap: 1px */}
  <div className="cv-pane">
    <span className="cv-label ref">A · {labelA}</span>
    <PhImg label="reference photo" hue={210} ... />
  </div>
  <div className="cv-pane">
    <span className="cv-label sim">B · {labelB}</span>
    <PhImg label="simulated output" hue={35} ... />
  </div>
</div>
```

```css
.cv-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  gap: 1px;
  background: var(--border);  /* 1px gap이 보더처럼 보임 */
}
```

**트릭**: `gap: 1px` + `background: var(--border)` = 두 패널 사이에 깔끔한 1px 구분선. `border-right`나 `divider` div를 따로 만들 필요 없음.

## 4. Slider 모드 — clip-path의 마법

```tsx
function SliderCompare() {
  const [slider, setSlider] = useState(50)  // 0~100, 핸들 위치(%)
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef(false)

  const onMove = (e) => {
    if (!drag.current || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = Math.min(Math.max(0, e.clientX - r.left), r.width)
    setSlider((x / r.width) * 100)
  }

  return (
    <div ref={ref}
      style={{ '--sx': `${slider}%` }}      // CSS 변수로 위치 전달
      onMouseDown={(e) => { drag.current = true; onMove(e) }}
      onMouseMove={onMove}
      onMouseUp={()    => drag.current = false}
      onMouseLeave={() => drag.current = false}
    >
      <div className="cv-slider-a">  {/* A 이미지 (전체) */}
        <PhImg ... />
      </div>
      <div className="cv-slider-b">  {/* B 이미지 (오른쪽만 보이게) */}
        <PhImg ... />
      </div>
      <div className="cv-handle" />  {/* 가운데 흰 선 */}
    </div>
  )
}
```

### 핵심 CSS

```css
.cv-slider-a, .cv-slider-b { position: absolute; inset: 0; overflow: hidden; }

/* B 이미지를 핸들 오른쪽만 보이도록 자른다 */
.cv-slider-b { clip-path: polygon(var(--sx) 0, 100% 0, 100% 100%, var(--sx) 100%); }

.cv-handle {
  position: absolute; top: 0; bottom: 0; width: 2px;
  left: var(--sx); transform: translateX(-50%);
  background: white; z-index: 5;
}
```

### `clip-path: polygon(...)` 시각화

`var(--sx) = 50%`일 때:
```
(50%, 0)─────(100%, 0)
  │              │
  │  보이는 영역   │  ← B 이미지가 이 영역만 표시됨
  │              │
(50%,100%)─(100%,100%)
```

왼쪽 50%는 A 이미지만 보이고, 오른쪽 50%는 B 이미지가 A를 덮어씀.

### 왜 `useRef`로 drag 상태 관리?

```tsx
const drag = useRef(false)   // 일반 변수처럼 사용
// vs
const [drag, setDrag] = useState(false)  // 변경시마다 리렌더
```

**드래그 중에는 매 픽셀마다 마우스 이동 이벤트** → `useState`면 매번 리렌더 폭탄.
- `slider` (위치)는 화면에 표시되어야 하므로 state.
- `drag` (불리언)는 화면에 안 보이고 핸들러만 알면 됨 → ref.

### `getBoundingClientRect()`

```tsx
const r = ref.current.getBoundingClientRect()
const x = Math.min(Math.max(0, e.clientX - r.left), r.width)
```

- `e.clientX`: 뷰포트 기준 마우스 X (window 기준).
- `r.left`: 컨테이너의 뷰포트 기준 왼쪽 X.
- `e.clientX - r.left`: 컨테이너 안에서의 X.
- `Math.min / max`로 0~width 범위로 클램프.

**스크롤이 있어도 잘 동작**: getBoundingClientRect는 항상 현재 시점의 위치를 반환.

## 5. Overlay 모드 — `mix-blend-mode: difference`

```tsx
<div style={{ position: 'relative', height: '100%' }}>
  <PhImg label="reference"  hue={210}
    style={{ position: 'absolute', inset: 0 }} />
  <PhImg label="simulation" hue={35}
    style={{
      position: 'absolute', inset: 0,
      opacity: 0.5,
      mixBlendMode: 'difference',
    }} />
</div>
```

- `mix-blend-mode: difference`: 픽셀별로 |A - B| 계산.
- 두 이미지가 같으면 검은색, 차이가 클수록 밝게.
- 색상 보정 차이를 시각화하기 좋음.

**디자인**: 0.5 opacity로 살짝 줄여 너무 강렬하지 않게.

## 6. 툴바 — 줌 컨트롤

```tsx
const [zoom, setZoom] = useState(100)

<button onClick={() => setZoom(z => Math.max(25, z - 25))}>−</button>
<span>{zoom}%</span>
<button onClick={() => setZoom(z => Math.min(400, z + 25))}>+</button>
```

- 25% 단위로 ±, 25%~400% 범위로 클램프.
- 현재는 zoom state만 있고 실제로 이미지에 적용되지 않음 (PhImg는 placeholder).
- 실제 이미지가 들어올 때 `transform: scale(zoom/100)` 같은 식으로 적용 가능.

## 7. 메트릭 표시 — Bottom bar

```tsx
<div className="cv-bottom">
  <span className="stat"><span className="k">ΔE₀₀</span><span className="v">2.84</span></span>
  <span className="stat"><span className="k">PSNR</span><span className="v">34.2 dB</span></span>
  <span className="stat"><span className="k">SSIM</span><span className="v">0.962</span></span>
  ...
  <span className="mono">pointer: 912, 488 · R 182 G 144 B 108 · L* 62.4</span>
</div>
```

이미지 신호처리 엔지니어용 UI에서 중요한 점:
- **수치는 항상 보여라**. ΔE₀₀, PSNR, SSIM 같은 평가 지표.
- **모노스페이스로 정렬**.
- **포인터 위치의 픽셀 값** (RGB + L*)을 실시간 표시.

## 8. 이벤트 누수 — 흔한 함정

위의 SliderCompare는 **컨테이너 안에서만** 마우스 이벤트를 듣습니다. 하지만 빠르게 드래그하다가 마우스가 컨테이너 밖으로 나가면?

```tsx
onMouseLeave={() => drag.current = false}  // 이걸로 처리
```

→ 컨테이너 밖으로 나가면 드래그 종료. 사용자가 다시 들어와도 클릭부터 다시 해야 함.

**더 나은 방법** (Step 07의 Tone Curve가 이 패턴 사용):

```tsx
const onDown = (e) => {
  drag.current = true
  const move = (ev) => { /* 위와 같음, 단 window 기준 */ }
  const up = () => {
    drag.current = false
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', up)
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
}
```

→ `window`에 리스너를 붙이면 컨테이너 밖에서도 추적 가능. **마우스 업 시 정리 잊지 말 것.**

## 9. 직접 해보기

1. **터치 지원**: 모바일/태블릿에서 슬라이더가 동작하지 않음. `touchstart`/`touchmove`/`touchend`를 추가해보세요. (힌트: `e.touches[0].clientX`)
2. **키보드 접근성**: 슬라이더 핸들에 포커스 → 좌/우 화살표로 이동. 어떤 ARIA 속성이 필요한가요?
3. **슬라이더 모드의 핸들 외부 드래그**: 위에서 본 "더 나은 방법" 패턴으로 바꿔보세요.
4. **세로 슬라이더**: clip-path를 polygon이 아닌 가로/세로 잘라내기로 바꿔, 위/아래 비교가 가능한 모드를 추가해보세요.
5. **Onion-skin 모드**: 두 이미지를 격자처럼 번갈아 보여주는 모드를 추가해보세요. (힌트: `linear-gradient`로 mask)

---

이전: [Step 05](./step-05-node-graph.md) · 다음: [Step 07 — 튜닝 컨트롤](./step-07-tuning.md)
