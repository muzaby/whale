# Step 07 — 튜닝 컨트롤 (Tone Curve / Color Wheel / Histogram)

> **목표**: 전문가 툴의 핵심 인터랙션 — 드래그 가능한 컨트롤 포인트, 극좌표 색상 휠, SVG path 히스토그램 — 을 어떻게 그렸는지 이해한다.
>
> **참고 파일**: `whale-app/src/components/e2e/TuningPanel.tsx`

## 1. 패널의 분기 구조

`TuningPanel`은 선택된 블록 ID에 따라 다른 UI를 렌더합니다:

```tsx
const block = PIPELINE.find(b => b.id === blockId) ?? PIPELINE[6]
const type =
  block.id === 'tone'   ? 'curve'  :
  block.id === 'hsl'    ? 'hsl'    :
  block.id === 'wheel'  ? 'wheel'  :
  block.id === 'wb'     ? 'wb'     :
  block.id === 'lut'    ? 'lut'    :
  ['nr','sharp'].includes(block.id) ? 'detail' : 'generic'
```

→ 같은 패널 컴포넌트, 안에서 7가지 UI로 분기. 새 블록 추가는 `type` 분기 하나 추가.

## 2. ToneCurve — 드래그 가능한 SVG 곡선

### 데이터 구조

```tsx
const [points, setPoints] = useState([
  { x: 0,   y: 0   },
  { x: 64,  y: 58  },
  { x: 128, y: 138 },
  { x: 192, y: 200 },
  { x: 255, y: 255 },
])
```

- 입력값(x: 0~255) → 출력값(y: 0~255) 매핑.
- 5개의 컨트롤 포인트.
- 양 끝점(0, 255)은 x 고정 (잠금).

### 좌표 변환

데이터 좌표(0~255) ↔ SVG 좌표(W=220, H=160):

```tsx
const W = 220, H = 160, pad = 6
const xs = (v) => pad + (v / 255) * (W - pad * 2)              // x: 왼→오
const ys = (v) => H - pad - (v / 255) * (H - pad * 2)          // y: 아래→위 (반전!)
```

**y 반전이 핵심**: 화면은 y가 아래로 갈수록 커지지만, 그래프는 위가 큰 값. `H - pad - ...`로 뒤집습니다.

### path 생성

```tsx
const path = points
  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(p.x)} ${ys(p.y)}`)
  .join(' ')
// → "M 6 154 L 60 117 L 113 67 L 167 27 L 214 6"
```

직선 보간. 부드러운 곡선이 필요하면 `Q`(quadratic) 또는 catmull-rom 스플라인 사용 가능.

### 드래그 처리 — `window` 리스너 패턴

```tsx
const onDragPoint = (idx, e) => {
  const svg = e.currentTarget.ownerSVGElement
  const move = (ev) => {
    const r = svg.getBoundingClientRect()
    const nx = Math.max(0, Math.min(255,
      ((ev.clientX - r.left - pad) / (W - pad * 2)) * 255))
    const ny = Math.max(0, Math.min(255,
      255 - ((ev.clientY - r.top - pad) / (H - pad * 2)) * 255))
    setPoints(p => p.map((pt, i) => i === idx
      ? { x: idx === 0 ? 0 : idx === p.length - 1 ? 255 : nx, y: ny }
      : pt))
  }
  const up = () => {
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', up)
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
}
```

### 핵심 디테일

**(a) `ownerSVGElement`로 SVG 참조**
- 클릭한 `<circle>`에서 부모 SVG를 찾는 표준 DOM API.
- ref를 따로 만들 필요 없음.

**(b) 양 끝점 x 잠금**
- `idx === 0 ? 0 : idx === p.length - 1 ? 255 : nx` — 중간 점만 자유 이동.
- 끝점이 자유롭게 움직이면 곡선이 0~255 구간을 다 못 덮음.

**(c) 좌표 변환의 역함수**
- 화면 픽셀 → 데이터 값:
  ```
  nx = ((mouseX - svgLeft - pad) / (W - pad*2)) * 255
  ny = 255 - ((mouseY - svgTop - pad) / (H - pad*2)) * 255
  ```
- 위의 `xs`, `ys`의 정확한 역연산.

### 채널 전환

```tsx
const [channel, setChannel] = useState<'luma' | 'r' | 'g' | 'b'>('luma')
```

- 한 컴포넌트에 4개 채널 모두. (실무에서는 채널마다 별도 `points` 상태가 필요)
- 채널 색은 토큰 (`--red`, `--green`, `--blue`, `--fg`)으로 통일.

### 배경 히스토그램

```tsx
<g opacity="0.3">
  {Array.from({ length: 64 }, (_, i) => {
    const x = pad + (i / 64) * (W - pad * 2)
    const v = Math.max(2, 70 * Math.exp(-Math.pow((i - 32) / 22, 2)) + ...)
    return <rect key={i} x={x} y={H - pad - v} width={...} height={v} fill={chanColor} />
  })}
</g>
```

- 정규분포 형태의 fake 히스토그램.
- opacity 0.3으로 깔아서 곡선이 우선 보이게.
- 실제로는 이미지 데이터에서 히스토그램을 계산해야 함.

## 3. ColorWheel — 극좌표 puck

### 핵심 아이디어

```
center (0, 0) ← 원의 중심
        ↓
puck 위치 (dx, dy) ← 사용자가 드래그한 상대 좌표
        ↓
극좌표로 해석:
  hue = atan2(dy, dx)
  saturation = sqrt(dx² + dy²) / R
```

### 드래그

```tsx
const R = 50
const [p, setP] = useState({ x: 0, y: 0 })

const drag = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  const move = (ev) => {
    let dx = ev.clientX - cx, dy = ev.clientY - cy
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }  // 원 밖으로 나가면 클램프
    setP({ x: dx, y: dy })
  }
  // ... window 리스너 패턴
}
```

**원형 클램프의 수학**:
```
점 (dx, dy)가 반지름 R인 원 안에 있으려면 sqrt(dx² + dy²) ≤ R
밖에 있으면, 같은 방향으로 길이만 R로 줄임:
  unit = (dx/d, dy/d)   ← 단위 벡터
  clamped = (R * dx/d, R * dy/d)
```

### conic-gradient로 그린 색상 휠

```css
.wheel .disc {
  background: conic-gradient(from 90deg,
    oklch(0.75 0.15 30),   /* 0° */
    oklch(0.80 0.14 65),
    oklch(0.85 0.13 110),
    oklch(0.80 0.13 155),
    oklch(0.78 0.14 200),
    oklch(0.70 0.15 250),
    oklch(0.68 0.17 295),
    oklch(0.70 0.17 340),
    oklch(0.75 0.15 30));  /* 360° = 0° (이음새) */
  border-radius: 50%;
}
```

- `conic-gradient`: 원형으로 회전하며 색이 바뀌는 그라데이션.
- 마지막 색을 첫 색과 같게 → 이음새가 안 보임.
- 가운데에 흰색 radial-gradient (`::after`)을 덮어 채도 표현.

### puck 표시

```tsx
<div className="puck" style={{
  transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`
}} />
```

- `translate(-50%, -50%)`로 puck 자기 중심을 원의 중심에 정렬.
- 거기에 `+ p.x`, `+ p.y`를 더해 사용자가 드래그한 만큼 이동.

## 4. Histogram — SVG path로 그린 RGB+L 분포

### 데이터 → path

```tsx
const toPath = (arr) => {
  const max = 80
  let d = `M ${pad} ${H - pad}`              // 왼쪽 아래에서 시작
  arr.forEach((v, i) => {
    const x = pad + (i / bins) * (W - pad * 2)
    const yy = H - pad - Math.min(H - pad * 2, (v / max) * (H - pad * 2))
    d += ` L ${x.toFixed(1)} ${yy.toFixed(1)}`
  })
  d += ` L ${W - pad} ${H - pad} Z`          // 오른쪽 아래로 가서 닫기 (Z)
  return d
}
```

**핵심**: path가 시작점(왼쪽 아래) → 데이터 라인(위) → 끝점(오른쪽 아래) → 시작점(Z) 순서로 닫힌 다각형. fill하면 면적이 칠해짐.

### 4채널 겹쳐 그리기

```tsx
<svg>
  <path d={toPath(y)} fill="oklch(0.9 0.01 250 / 0.15)"  stroke="..." />  {/* Luma */}
  <path d={toPath(r)} fill="oklch(0.65 0.19 28 / 0.35)"  stroke="..." />  {/* R */}
  <path d={toPath(g)} fill="oklch(0.70 0.17 150 / 0.35)" stroke="..." />  {/* G */}
  <path d={toPath(b)} fill="oklch(0.60 0.17 250 / 0.35)" stroke="..." />  {/* B */}
</svg>
```

- 각 채널을 독립적인 path로.
- 0.35 alpha로 겹쳐 칠해 — 겹친 부분이 자연스럽게 합쳐 보임.
- 어두운 배경(`oklch(0.13 0.005 250)`) 위에 그려 채널 색이 잘 보이게.

### 가짜 데이터 생성 (정규분포)

```tsx
const gen = (peak, spread, scale) =>
  Array.from({ length: bins }, (_, i) =>
    Math.max(0, scale * Math.exp(-Math.pow((i - peak) / spread, 2)) + ...))
```

`exp(-x²)` = 정규분포(가우시안). 봉우리 위치(peak)와 폭(spread)을 조절해 채널별로 다른 모양.

**실제로는 이미지의 픽셀을 256개 bin에 카운팅해야 함**:
```js
// 의사코드
const bins = new Array(256).fill(0)
for (const pixel of imageData) {
  bins[pixel.r]++
}
```

## 5. 슬라이더 그룹 — 패턴 재사용

```tsx
<div className="col" style={{ gap: 10 }}>
  <Slider label="Shadows"    value={-8}  onChange={() => {}} />
  <Slider label="Midtones"   value={6}   onChange={() => {}} />
  <Slider label="Highlights" value={-14} onChange={() => {}} />
</div>
```

- Step 03에서 본 `Slider`를 그대로 재사용.
- 라벨/값만 다르게.
- → 컴포넌트 재사용성의 진가.

## 6. 토글 — bypass 인디케이터

```tsx
<button className={`toggle ${!bypass ? 'on' : ''}`} onClick={onToggleBypass}>
  <Icon name={bypass ? 'eyeOff' : 'eye'} size={11} />
  {bypass ? 'BYPASSED' : 'ACTIVE'}
</button>
```

```css
.toggle { background: var(--panel); color: var(--fg-muted); }
.toggle.on {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent-border);
}
```

- "ACTIVE" 상태일 때만 액센트 색.
- 텍스트 + 아이콘 둘 다 바뀜 → 색맹 사용자도 인식 가능.
- 모노스페이스로 "기술적인" 느낌.

## 7. 디자인 패턴 요약

이 파일에서 반복되는 패턴들:

| 패턴 | 등장 위치 |
|------|----------|
| `useState` + 마우스 드래그 | ToneCurve, ColorWheel |
| 데이터 좌표 ↔ SVG 좌표 변환 | ToneCurve, Histogram |
| SVG path로 닫힌 영역 fill | Histogram |
| 모드/타입에 따른 분기 렌더 | TuningPanel root |
| 토큰 색상으로 카테고리 표현 | dot, cat-bar, accent toggle |

## 8. 직접 해보기

1. **베지어 톤 커브**: 직선이 아닌 부드러운 베지어 곡선으로 바꿔보세요. SVG `Q` 또는 catmull-rom 스플라인 사용.
2. **색상 휠 → HSL 값 변환**: puck 위치 (dx, dy)를 hue (degree)와 saturation (0~1)로 변환해서 화면에 표시해보세요.
3. **실제 히스토그램**: `<canvas>`에 이미지를 그리고, `getImageData()`로 픽셀을 읽어 히스토그램을 계산해보세요.
4. **컨트롤 포인트 추가/삭제**: 톤 커브의 빈 영역을 더블클릭하면 새 포인트 추가, 우클릭하면 삭제하도록 만들어보세요.
5. **언두/리두**: 톤 커브의 변경 이력을 유지해서 ⌘Z / ⌘⇧Z 가 동작하게 만들어보세요. (힌트: state 스택)

---

이전: [Step 06](./step-06-compare.md) · 다음: [Step 08 — 라이브러리](./step-08-library.md)
