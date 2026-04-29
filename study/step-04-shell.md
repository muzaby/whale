# Step 04 — 페이지 셸과 라우팅

> **목표**: `App.tsx`가 어떻게 페이지를 전환하고, `TopBar`가 어떻게 그 상태를 시각화하는지 이해한다. 라이브러리 없이 만든 라우팅의 한계도 본다.
>
> **참고 파일**: `whale-app/src/App.tsx`, `whale-app/src/components/TopBar.tsx`

## 1. 전체 셸 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  TopBar (48px)  brand · nav · crumb · profile          │ <- grid row 1
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Content (1fr)                                          │ <- grid row 2
│  - Home / E2E / Library 중 하나                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

CSS:
```css
.app {
  display: grid;
  grid-template-rows: var(--topbar-h) 1fr;
  height: 100vh;
  min-height: 600px;
}
```

**왜 `grid` + `100vh`?**
- TopBar 높이 고정, 본문이 나머지를 모두 차지.
- `flex column`도 가능하지만 grid가 더 명시적 ("두 줄 레이아웃").

## 2. 라우팅 — useState만으로 충분?

```tsx
const [page, setPage] = useState<PageId>(
  () => (localStorage.getItem('whale:page') as PageId) ?? 'home'
)

useEffect(() => {
  localStorage.setItem('whale:page', page)
}, [page])
```

이게 전부입니다. `react-router`도 안 씁니다.

### 잘 되는 이유

- 페이지가 3개뿐.
- URL 동기화가 굳이 필요 없음 (앱이 단일 페이지 형태로 동작).
- 새로고침해도 localStorage가 마지막 페이지를 기억.

### 한계 (언젠가 마주칠 문제)

- ❌ 뒤로가기 버튼이 안 먹음 (history API를 안 씀).
- ❌ 깊은 링크 불가 (`/library?filter=fav` 같은 거).
- ❌ 페이지 안의 sub-state (선택된 블록 ID 등)가 URL에 안 남음.
- ❌ 페이지마다 같은 검색 페이지에서 시작.

→ 이 한계가 실제 문제가 되면 `react-router`나 `wouter` 도입 시점.

## 3. `localStorage` 쓸 때의 함정

```tsx
const [page, setPage] = useState<PageId>(
  () => (localStorage.getItem('whale:page') as PageId) ?? 'home'
)
```

**(a) `useState`에 직접 함수 전달**
```tsx
useState(localStorage.getItem(...))     // ❌ 매 렌더마다 호출
useState(() => localStorage.getItem(...)) // ✅ 최초 한 번만 호출 (lazy init)
```

**(b) `as PageId` 타입 캐스팅의 위험**
- localStorage에 `"random-string"`이 들어 있으면 그대로 `page`가 됨.
- 더 안전하게 하려면:
```tsx
const stored = localStorage.getItem('whale:page')
const initial: PageId = stored === 'e2e' || stored === 'library' ? stored : 'home'
```

**(c) SSR 호환성**
- `localStorage`는 브라우저에만 존재. Next.js 같은 SSR 환경에선 `typeof window`로 가드 필요.
- Vite의 SPA 모드에서는 문제없음.

## 4. TopBar — 3-column grid

```css
.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;  /* 왼쪽 | 가운데 | 오른쪽 */
  align-items: center;
  padding: 0 14px;
  gap: 12px;
}
```

**왜 1fr / auto / 1fr?**
- 가운데 nav는 내용에 맞는 폭 (`auto`).
- 양쪽이 동일한 폭(`1fr`)이라서 nav가 **정확히 중앙에 고정**됨.
- crumb이 길어져도 nav가 떨리지 않음 (오른쪽 영역 안에서만 늘어남).

**`flex justify-content: space-between`과의 차이**:
- `space-between`은 가운데가 떠다님 (양쪽 컨텐츠 폭에 따라).
- `1fr auto 1fr`은 가운데가 절대 중앙 고정.

## 5. nav — segmented control 스타일

```tsx
<div className="nav" role="tablist">
  <button className={page === 'home' ? 'active' : ''} onClick={() => onNav('home')}>
    <Icon name="home" size={12} /> Home
  </button>
  ...
</div>
```

- 시각적으로는 Step 03의 `Seg`와 거의 같음 (트랙 + 활성 알약).
- 별도 컴포넌트로 안 빼고 `.topbar .nav`에서 직접 스타일.
- 이유: 페이지 nav는 앱 전체에 한 번만 등장 → 추상화 이득 없음.

## 6. crumb — 현재 위치 표시

`App.tsx`에서 페이지에 따라 crumb를 동적으로 만들고 TopBar에 prop으로 전달:

```tsx
const crumb = page === 'e2e' ? (
  <>
    <span>sensor-A</span><span className="sep">/</span>
    <span>night-tuning</span><span className="sep">/</span>
    <span style={{ color: 'var(--fg)' }}>pass-3 · rev-7</span>
  </>
) : page === 'library' ? (
  <><span>library</span><span className="sep">/</span><span>all images</span></>
) : null

<TopBar page={page} onNav={setPage} crumb={crumb} />
```

**디자인 포인트**:
- 마지막 항목만 `--fg` (강조), 나머지는 `--fg-subtle`.
- `/` 구분자는 `--fg-faint` (더 흐리게).
- `font-family: mono` → 시스템 경로 같은 느낌.

## 7. Tweaks 패널 — 외부 도구 통합

`App.tsx`의 흥미로운 부분 — Claude Design 같은 외부 디자인 도구와의 핸드셰이크:

```tsx
useEffect(() => {
  const onMsg = (e: MessageEvent) => {
    if (e.data?.type === '__activate_edit_mode')   setTweaksOn(true)
    if (e.data?.type === '__deactivate_edit_mode') setTweaksOn(false)
  }
  window.addEventListener('message', onMsg)
  window.parent.postMessage({ type: '__edit_mode_available' }, '*')
  return () => window.removeEventListener('message', onMsg)
}, [])
```

- 부모 프레임(Claude Design)이 메시지를 보내면 Tweaks 패널 활성/비활성.
- 사용자가 Tweaks를 변경하면 부모에게 다시 전달:
```tsx
window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*')
```

**핵심**: 이 코드는 Claude Design 안에서만 의미가 있고, 일반 배포 환경에서는 그냥 no-op이라 안전합니다.

**프로덕션 배포 시 고려할 점**:
- 프로덕션에서는 이 코드가 필요 없으니 제거하거나 환경변수로 가드해도 OK.
- 그대로 둬도 `window.parent === window`인 일반 페이지에선 본인에게 메시지 보내는 거라 문제 없음.

## 8. 페이지 컴포넌트가 받는 props

```tsx
{page === 'home'    && <Home goto={setPage} />}
{page === 'e2e'     && <E2EPage />}
{page === 'library' && <Library />}
```

- `Home`만 `goto={setPage}`를 받습니다 — "Open E2E Pipeline" 같은 카드 클릭시 페이지 이동에 필요.
- E2E와 Library는 이동 트리거가 없으니 아예 안 받음.
- → **필요한 만큼만 prop drilling**. 글로벌 상태/Context로 끌어올리지 않음.

언젠가 모든 페이지에서 페이지 이동이 필요하면 그때 Context로 올리는 게 적절. 지금은 과한 추상화를 피함.

## 9. 직접 해보기

1. **뒤로가기 지원**: `pushState`/`popstate`를 써서 브라우저 뒤로가기 버튼이 작동하도록 만들어보세요.
2. **deep link**: `#e2e`처럼 hash가 붙으면 해당 페이지로 시작하도록 수정하세요. (힌트: `window.location.hash`)
3. **TopBar에 검색**: nav 옆에 ⌘K 검색 버튼을 추가하고, 누르면 모달이 뜨도록 만들어보세요. 모달은 어디에 마운트하는 게 좋을까요? (힌트: portal)
4. **페이지 전환 애니메이션**: `<Home>` ↔ `<E2EPage>` 전환시 페이드를 넣어보세요. 함정: 둘 다 마운트되어 있어야 트랜지션이 가능. CSS만으로 깔끔하게 가능할까요?

---

이전: [Step 03](./step-03-primitives.md) · 다음: [Step 05 — SVG 노드 그래프](./step-05-node-graph.md)
