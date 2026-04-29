# Step 08 — 라이브러리 (그리드/리스트, 다중 선택, 필터 결합)

> **목표**: 같은 데이터를 두 가지 뷰로 보여주고, 사이드바·툴바 필터를 결합해 동작하게 만드는 패턴을 익힌다.
>
> **참고 파일**: `whale-app/src/components/Library.tsx`, `whale-app/src/data.ts`

## 1. 페이지 레이아웃

```
┌──────────┬─────────────────────────────────────────┐
│          │  lib-bar (제목 / 검색 / 뷰 전환 / 업로드)  │
│ Sidebar  ├─────────────────────────────────────────┤
│  220px   │  lib-sub (선택 개수 / 일괄 액션 / 정렬)   │
│          ├─────────────────────────────────────────┤
│          │                                         │
│          │  lib-content                            │
│          │   - grid view (lib-grid)                │
│          │   - list view (lib-table)               │
│          │                                         │
└──────────┴─────────────────────────────────────────┘
```

CSS:
```css
.lib { display: grid; grid-template-columns: 220px 1fr; height: 100%; }
.lib-main { display: flex; flex-direction: column; min-width: 0; }
```

**`min-width: 0`이 중요**: grid 자식의 기본 `min-width: auto`는 콘텐츠 폭에 맞춰져 페이지가 가로로 쭉 늘어남. `0`으로 명시하면 컨테이너 안에서 줄어들 수 있음.

## 2. 다중 선택 — `Set` 패턴

```tsx
const [selected, setSelected] = useState(new Set([1, 2]))  // 초기 2개 선택

const toggleSel = (id) => {
  const n = new Set(selected)        // 새 Set으로 복사
  n.has(id) ? n.delete(id) : n.add(id)
  setSelected(n)
}
```

### 왜 `Set`?

- `.has(id)` — O(1) 조회 (배열은 O(n) `.includes`)
- `.add` / `.delete` 가 명확
- size로 개수 확인

### 왜 새 Set으로 복사?

```tsx
selected.add(id)        // ❌ 기존 Set 변경, React가 변경을 감지 못함
setSelected(selected)   // 같은 참조 → 리렌더 안 됨

const n = new Set(selected)  // ✅ 새 참조
n.add(id)
setSelected(n)
```

React는 **참조 비교**로 변경을 감지. 같은 객체를 변경하면 리렌더가 안 일어남.

### 시각화

```tsx
<div className={`lib-card ${selected.has(it.id) ? 'sel' : ''}`}
     onClick={() => toggleSel(it.id)}>
  ...
  <div className="chk">{selected.has(it.id) && <Icon name="check" size={12} />}</div>
</div>
```

```css
.lib-card.sel { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.lib-card .chk { display: none; ... }
.lib-card:hover .chk, .lib-card.sel .chk { display: flex; }
```

- 선택되거나 hover시 체크박스 노출.
- 선택되면 액센트 보더 + 글로우.

## 3. 필터 결합 — 함수형 chain

```tsx
const filtered = LIB_ITEMS.filter(it => {
  if (srcFilter !== 'all' && it.src !== srcFilter) return false
  if (filter === 'fav' && !it.fav) return false
  if (filter === 'ref' && it.src !== 'ref') return false
  if (filter === 'sim' && it.src !== 'sim') return false
  return true
})
```

### 패턴 — "거부 일찍, 승인 늦게"

- 각 조건은 "이 조건을 위반하면 거부".
- 모든 조건을 통과한 것만 `return true`.
- 새 필터 추가 = 한 줄 추가.

### 더 확장성 있는 방법 (참고)

조건이 많아지면:

```tsx
const predicates = [
  (it) => srcFilter === 'all' || it.src === srcFilter,
  (it) => filter !== 'fav' || it.fav,
  (it) => filter !== 'ref' || it.src === 'ref',
  // ...
]
const filtered = LIB_ITEMS.filter(it => predicates.every(p => p(it)))
```

→ 동적으로 필터를 추가/제거하기 쉬움. 본 프로젝트는 수가 적어서 inline.

## 4. 두 뷰, 한 데이터

```tsx
{view === 'grid' ? (
  <div className="lib-grid">
    {filtered.map(it => <Card key={it.id} item={it} ... />)}
  </div>
) : (
  <div className="lib-table">
    <TableHeader />
    {filtered.map(it => <Row key={it.id} item={it} ... />)}
  </div>
)}
```

같은 `filtered` 데이터, 다른 시각화. `view` 토글 한 번에 전환.

### Grid 뷰 — `auto-fill` 매직

```css
.lib-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
}
```

- `auto-fill` + `minmax(190px, 1fr)`:
  - 컨테이너 폭에 맞춰 카드 개수가 자동 변경.
  - 각 카드는 최소 190px, 남는 공간은 균등 분배.
- 미디어 쿼리 없이 반응형 그리드 완성.

### List 뷰 — Grid로 만든 테이블

```css
.lib-table .th, .lib-table .tr {
  display: grid;
  grid-template-columns: 24px 56px 2fr 0.8fr 1.4fr 0.9fr 0.9fr 0.7fr 0.5fr;
  gap: 10px;
}
```

- `<table>` 안 쓰고 div + grid.
- 헤더(`.th`)와 행(`.tr`)이 같은 컬럼 정의 → 자동 정렬.
- 컬럼 폭은 fr 단위로 비율 지정.

**왜 `<table>` 안 씀?**
- table은 셀 단위 hover/selection 스타일링이 어려움.
- grid는 row를 단일 hover/click 영역으로 다루기 쉬움.
- 단점: 시멘틱 손실 (스크린리더 호환 떨어짐). 접근성 중시 환경이면 `<table>` + `role="grid"` 고려.

## 5. 사이드바 — Collections / Sessions / Tags

세 영역의 패턴이 거의 같습니다:

```tsx
<div className="sh">Collections <button><Icon name="plus" size={12} /></button></div>
{COLLECTIONS.map(c => (
  <div key={c.id} className={`it ${filter === c.id ? 'active' : ''}`} onClick={() => setFilter(c.id)}>
    <Icon name={c.icon} size={13} className="ic" />
    <span>{c.name}</span>
    <span className="c num">{c.count}</span>
  </div>
))}
```

- **section header (`.sh`)** + **items (`.it`)** 반복.
- 활성 항목은 `--accent-soft` 배경.
- 카운트는 모노스페이스 + 약한 색.

### Tag 영역만 다른 점

태그는 다중 선택 가능 → 칩(chip) 스타일:

```tsx
{ALL_TAGS.slice(0, 12).map(t => (
  <span key={t.name}
    className={`lib-tag ${activeTags.has(t.name) ? 'active' : ''}`}
    onClick={() => toggleTag(t.name)}>
    {t.name}<span className="c">{t.count}</span>
  </span>
))}
```

- collections/sessions은 단일 선택 라디오 형태.
- tags는 다중 선택 체크박스 형태.
- 인터랙션 모델이 다르면 시각적으로도 다르게.

## 6. 일괄 액션 (Bulk Actions)

```tsx
<div className="lib-sub">
  <span className="mono">{filtered.length} of {LIB_ITEMS.length} items</span>
  <span>·</span>
  <span className="mono">{selected.size} selected</span>
  {selected.size > 0 && (
    <>
      <button className="btn sm"><Icon name="tag" /> Tag</button>
      <button className="btn sm"><Icon name="folder" /> Add to…</button>
      <button className="btn sm"><Icon name="star" /> Favorite</button>
      <button className="btn sm primary"><Icon name="split" /> Compare in E2E</button>
    </>
  )}
  ...
</div>
```

**디자인 결정**: 액션 버튼이 선택된 것이 있을 때만 등장.
- 기본 상태에서 UI 노이즈 감소.
- 선택과 동시에 다음 행동을 시각적으로 제안.
- 단점: 위치가 떨려 보일 수 있음 → flexbox로 자연스럽게 흘러가게.

## 7. 검색 입력 — Decoration

```tsx
<input className="input search" placeholder="Search images, tags, sessions…" />
```

```css
.input.search {
  padding-left: 26px;
  background-image: url("data:image/svg+xml;utf8,<svg ...></svg>");
  background-repeat: no-repeat;
  background-position: 8px 50%;
}
```

**SVG를 data URL로 인라인** = 추가 HTTP 요청 없이 아이콘. 색상은 SVG 안에 hardcoded (`stroke='%238A909B'`).

→ 액센트 색에 따라 변하지 않는 한계가 있음. 현재 프로젝트는 검색 아이콘이 항상 같은 색이라도 OK.

## 8. PhImg — placeholder 이미지의 hue 트릭

```tsx
<PhImg label="reference" hue={it.hue} ... />
```

```tsx
const bg1 = `oklch(0.93 0.04 ${hue})`
const bg2 = `oklch(0.97 0.02 ${hue})`
return <div style={{
  background: `repeating-linear-gradient(45deg, ${bg1} 0 10px, ${bg2} 10px 20px)`,
  ...
}}>...</div>
```

- 각 이미지마다 `hue`만 다르게 → 시각적으로 구분되는 placeholder.
- 실제 이미지가 들어오기 전 임시 자리표시.
- `repeating-linear-gradient`로 줄무늬 → "이건 placeholder다"는 시그널.

## 9. 데이터 정의 (`data.ts`) 살펴보기

```ts
export const LIB_ITEMS: LibraryItem[] = [
  { id: 1, name: "night_0042_ref.dng", src: "ref", tags: ["night", ...],
    hue: 210, fav: true, w: 6000, h: 4000, iso: 6400,
    date: "Apr 18", session: "night-A" },
  ...
]
```

**특징**:
- 하드코딩된 정적 데이터 → API 연동 전 mocking에 적합.
- 타입은 `types.ts`에서 import → 단일 진실 공급원.
- `fav`, `iso?: number | null` 같은 옵셔널/널 처리에 주의.

## 10. 직접 해보기

1. **검색 필터**: 검색 입력값으로 `name`을 필터하도록 `filtered`에 조건 추가.
2. **태그 필터**: `activeTags`가 비어있지 않을 때, 하나라도 매치되는 항목만 보이게.
3. **Shift + 클릭으로 범위 선택**: 카드를 Shift+클릭하면 마지막 선택 ~ 현재 클릭 사이 모두 선택. (힌트: `lastSelectedId` ref)
4. **즐겨찾기 토글**: 카드의 별 아이콘을 클릭하면 `fav` 상태 토글. data를 state로 끌어올려야 함.
5. **그룹화**: 정렬 옵션에서 "group by session"이 동작하게 — 같은 세션끼리 묶어 헤더 표시.
6. **무한 스크롤**: LIB_ITEMS가 1000개라면? `IntersectionObserver`로 화면에 들어올 때만 추가 로드.

---

이전: [Step 07](./step-07-tuning.md) · [메인으로](./README.md)
