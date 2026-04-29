# Whale 프로젝트 학습 가이드

이 디렉토리는 **Whale 이미지 튜닝 스튜디오**(`whale-app/`) 프로젝트를 단계별로 학습하기 위한 자료입니다. 신입/경력 인수인계자가 이 프로젝트의 구현 방식을 이해하고 직접 손으로 만져보면서 익힐 수 있도록 구성했습니다.

## 학습 순서

| Step | 파일 | 핵심 개념 |
|------|------|----------|
| 01 | [step-01-structure.md](./step-01-structure.md) | 프로젝트 구조, 의존성 흐름, 빌드 파이프라인 |
| 02 | [step-02-tokens.md](./step-02-tokens.md) | 디자인 토큰, CSS 변수, oklch 색공간, 테마 전환 |
| 03 | [step-03-primitives.md](./step-03-primitives.md) | Icon(SVG), Slider, Seg 등 기본 컴포넌트 패턴 |
| 04 | [step-04-shell.md](./step-04-shell.md) | TopBar, state 기반 라우팅, localStorage 영속화 |
| 05 | [step-05-node-graph.md](./step-05-node-graph.md) | SVG 노드 그래프 — 좌표 계산과 path 연결선 |
| 06 | [step-06-compare.md](./step-06-compare.md) | 이미지 비교 — Split / Slider(clip-path) / Overlay |
| 07 | [step-07-tuning.md](./step-07-tuning.md) | 튜닝 컨트롤 — Tone Curve, Color Wheel, Histogram |
| 08 | [step-08-library.md](./step-08-library.md) | 라이브러리 — 그리드/리스트, 다중 선택, 필터 결합 |

## 학습 방법

1. **순서대로** 진행하세요. 각 단계는 이전 단계의 개념을 전제로 합니다.
2. 각 MD 파일은 **개념 설명 → 실제 코드 → 직접 해보기** 순서로 구성됩니다.
3. 읽기만 하지 말고 `whale-app/`의 실제 파일을 같이 열어두세요. 각 단계에서 어떤 파일을 보면 좋은지 명시합니다.
4. 끝의 "직접 해보기" 과제를 풀어보면 이해도가 크게 올라갑니다.

## 사전 지식

- React 함수 컴포넌트와 hooks (`useState`, `useEffect`, `useRef`)
- TypeScript 기본 문법 (인터페이스, 제네릭)
- CSS Grid / Flexbox
- SVG 기본 (path, viewBox, transform)

부족한 부분은 진행하면서 README에서 보충 설명합니다.

## 프로젝트 실행

학습 중 변경사항을 직접 보고 싶다면:

```bash
cd whale-app
npm install
npm run dev
```

http://localhost:5173 에서 확인 가능합니다.
