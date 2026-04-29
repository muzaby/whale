# Step 05 — SVG 노드 그래프 (boustrophedon 레이아웃)

> **목표**: ISP 파이프라인을 노드 그래프로 그리는 알고리즘과 SVG path로 노드를 잇는 방법을 이해한다.
>
> **참고 파일**: `whale-app/src/components/e2e/NodeGraph.tsx`, `whale-app/src/data.ts`

## 1. 무엇을 그리는가

13개의 ISP 블록(`PIPELINE` 배열)을 5열 그리드에 배치하고, 순서대로 화살표로 연결합니다. 단순한 좌→우 배치는 너무 가로로 길어서, 줄을 바꿀 때 **방향을 뒤집어** 자연스럽게 이어지게 합니다.

```
1 → 2 → 3 → 4 → 5
                ↓
10 ← 9 ← 8 ← 7 ← 6
↓
11 → 12 → 13
```

이런 패턴을 [boustrophedon](https://en.wikipedia.org/wiki/Boustrophedon)("소가 밭을 갈 듯") 라고 부릅니다.

## 2. 노드 좌표 계산

```tsx
const cols = 5
const cellW = 160, cellH = 80, gapX = 40, gapY = 44

const pos = (i: number) => {
  const row = Math.floor(i / cols)
  // 짝수행: 왼→오, 홀수행: 오→왼
  const col = row % 2 === 0
    ? i % cols
    : cols - 1 - (i % cols)
  return {
    x: 20 + col * (cellW + gapX),
    y: 20 + row * (cellH + gapY),
  }
}
```

**핵심 한 줄**: `col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols)`

| i | row | i%cols | 짝수행 col | 홀수행 col |
|---|-----|--------|-----------|-----------|
| 0 | 0 | 0 | 0 | — |
| 4 | 0 | 4 | 4 | — |
| 5 | 1 | 0 | — | 4 |  ← 행이 바뀌면 가장 오른쪽부터
| 9 | 1 | 4 | — | 0 |
| 10| 2 | 0 | 0 | — |  ← 또 왼쪽부터

## 3. 노드 간 연결선

```tsx
const conns = PIPELINE.slice(0, -1).map((_, i) => {
  const a = pos(i),     b = pos(i + 1)
  const ax = a.x + cellW, ay = a.y + cellH / 2     // a의 오른쪽 변 중앙
  const bx = b.x,         by = b.y + cellH / 2     // b의 왼쪽 변 중앙

  const sameRow = Math.abs(ay - by) < 1
  let d: string
  if (sameRow) {
    // 같은 행 → 부드러운 베지어
    const mid = (ax + bx) / 2
    d = `M ${ax} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${bx} ${by}`
  } else {
    // 행이 다름 → 직각 코너 (right-down-left)
    d = `M ${ax} ${ay} L ${ax + 20} ${ay} L ${ax + 20} ${by} L ${bx} ${by}`
  }
  return { d, key: i }
})
```

### SVG path 명령어 복습

| 명령 | 의미 |
|------|------|
| `M x y` | Move to (펜 들고 이동) |
| `L x y` | Line to (직선) |
| `C cp1x cp1y, cp2x cp2y, x y` | Cubic Bezier (제어점 2개) |
| `Q cpx cpy, x y` | Quadratic Bezier (제어점 1개) |

**같은 행 — Cubic Bezier**:
- 두 제어점을 끝점들의 중간 x에 두면 → 부드러운 S 커브 없이 자연스러운 호.
- `M ax ay C mid ay, mid by, bx by` → 양쪽 끝에서 수평 접선을 가진 곡선.

**다른 행 — 꺾인 선**:
- 베지어로 부드럽게 할 수도 있지만, **직각이 더 명확** ("이게 다음 행으로 넘어간다"는 신호).
- 끝점에서 살짝 오른쪽으로 빠진 뒤 (20px) 수직으로 내려가서 다음 노드의 왼쪽으로.

## 4. 노드 렌더링

```tsx
{PIPELINE.map((n, i) => {
  const p = pos(i)
  const params = Object.entries(n.params)
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
  return (
    <div
      key={n.id}
      className={`node ${selected === n.id ? 'sel' : ''} ${n.bypass ? 'bypass' : ''}`}
      style={{ left: p.x, top: p.y }}
      onClick={() => onSelect(n.id)}
    >
      <div className="cat-bar" style={{ background: CAT_COLOR[n.cat] }} />
      <div className="head">
        <span className="name">{n.name}</span>
        <span className="mono">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <div className="body">{params || '—'}</div>
      {n.cat !== 'source' && <div className="port in" />}
      {n.cat !== 'sink' && <div className="port out" />}
    </div>
  )
})}
```

### 디테일

**(a) `cat-bar` — 카테고리 색상 띠**
- 노드 위쪽에 3px 띠로 카테고리 시각화.
- color/tone/detail 같은 카테고리를 한눈에 구분.

**(b) `port` — 입출력 점**
- 좌(in), 우(out)에 9x9 동그라미.
- `cat: source`는 in 없음, `cat: sink`는 out 없음.
- 선택되면 (`sel`) 액센트 색으로 변함.

**(c) `String(i + 1).padStart(2, '0')`**
- `01`, `02`, ..., `13` — 두 자리 고정.
- 모노스페이스 폰트와 함께 시각적 정렬.

## 5. SVG와 div의 z-order

```tsx
<div style={{ position: 'relative', width: w, height: h }}>
  <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {/* 연결선 */}
  </svg>
  {/* 노드 div들 */}
</div>
```

**왜 SVG가 먼저?**
- DOM 순서대로 z-index가 쌓이므로 나중에 그린 노드가 위.
- 노드가 연결선보다 위에 그려져야 함 (당연).

**`pointerEvents: 'none'`**
- SVG가 위에 있을 수 있어도, 마우스 이벤트는 통과.
- 노드 div가 정상적으로 클릭됨.

## 6. 점 패턴 배경

```css
.nodegraph-wrap {
  background:
    radial-gradient(circle at 1px 1px, oklch(0.86 0.005 240) 1px, transparent 1px) 0 0 / 14px 14px,
    var(--bg-subtle);
}
```

- `radial-gradient`로 1px 점을 14x14 격자에 반복.
- 노드 그래프임을 시각적으로 알리는 약한 단서.
- 무겁지 않게 — 1px 점만 (선 격자가 아님).

## 7. 비교: List 뷰와 Timeline 뷰

같은 데이터를 다르게 표현:

| 뷰 | 강조점 | 적합한 작업 |
|----|--------|-----------|
| **NodeGraph** | 데이터 흐름 | 파이프라인 토폴로지 이해 |
| **StepList** (`StepList.tsx`) | 카테고리 / 파라미터 | 빠른 검색, 일괄 편집 |
| **Timeline** (`Timeline.tsx`) | 실행 시간 | 성능 프로파일링 |

**한 데이터, 세 시각화** = 본 앱의 핵심 사용자 가치 중 하나.

## 8. 반응형 — 어떻게?

현재 구현은 **반응형이 아닙니다**. `cols = 5`가 하드코딩되어 있어요.

반응형으로 바꾸려면:
```tsx
const [cols, setCols] = useState(5)
useEffect(() => {
  const compute = () => {
    const w = window.innerWidth
    setCols(w < 800 ? 3 : w < 1200 ? 4 : 5)
  }
  compute()
  window.addEventListener('resize', compute)
  return () => window.removeEventListener('resize', compute)
}, [])
```

→ 이런 게 필요해지면 `ResizeObserver`로 컨테이너 크기에 반응하게 만드는 것이 더 좋음.

## 9. 직접 해보기

1. **노드 드래그**: 노드를 마우스로 끌어서 위치를 바꿀 수 있게 만들어보세요. 좌표를 어디에 저장하면 좋을까요? (힌트: state로 `Map<id, {x, y}>`)
2. **곡선만으로 그리기**: 다른 행 연결선도 직각이 아니라 부드러운 곡선으로 그려보세요. 어떤 베지어 제어점을 쓰면 자연스러운가요?
3. **그래프 zoom**: 마우스 휠로 zoom in/out 가능하게 만들어보세요. (힌트: 컨테이너에 `transform: scale()`, 휠 이벤트 처리)
4. **동적 레이아웃**: PIPELINE 길이를 바꿔도 (예: 20개) 잘 동작하는지 확인. 고치고 싶은 부분이 있나요?
5. **Bezier 시각화**: 베지어 제어점을 작은 점으로 표시해서 어떻게 곡선이 만들어지는지 눈으로 확인해보세요.

---

이전: [Step 04](./step-04-shell.md) · 다음: [Step 06 — 이미지 비교 뷰어](./step-06-compare.md)
