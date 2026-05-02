# react-ssutil

React 환경에서 사용할 수 있는 커스텀 훅 모음 라이브러리입니다.  
React, Next.js 환경을 지원하며, TypeScript로 작성되어 있습니다.

## 설치

```bash
npm install react-ssutil
# or
pnpm add react-ssutil
# or
yarn add react-ssutil
```

## 지원 환경

- React 17+
- Next.js (App Router / Pages Router)
- TypeScript 5+

## 훅 목록

| 훅 | 설명 |
|---|---|
| `useDebounce` | 함수 호출을 지연 처리 |
| `useThrottle` | 함수 호출 빈도 제한 |
| `useBoolean` | boolean 상태 관리 |
| `usePrevious` | 이전 렌더링 값 추적 |
| `useLocalStorage` | localStorage 동기화 상태 |
| `useOutsideClick` | 외부 클릭 감지 |
| `useMediaQuery` | CSS 미디어 쿼리 매칭 |
| `useQueryState` | URL query string과 React state 동기화 |

## 사용법

### useDebounce

```tsx
import { useDebounce } from "react-ssutil";

function SearchInput() {
  const [query, setQuery] = useState("");

  const handleSearch = useDebounce((value: string) => {
    fetchResults(value);
  }, 500);

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        handleSearch(e.target.value);
      }}
    />
  );
}
```

### useThrottle

```tsx
import { useThrottle } from "react-ssutil";

function ScrollTracker() {
  const handleScroll = useThrottle(() => {
    console.log("scrolled:", window.scrollY);
  }, 100);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
}
```

### useBoolean

```tsx
import { useBoolean } from "react-ssutil";

function Modal() {
  const { value: isOpen, setTrue: open, setFalse: close, toggle } = useBoolean(false);

  return (
    <>
      <button onClick={open}>열기</button>
      {isOpen && <div>모달 내용 <button onClick={close}>닫기</button></div>}
    </>
  );
}
```

### usePrevious

```tsx
import { usePrevious } from "react-ssutil";

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return <p>현재: {count} / 이전: {prevCount ?? "없음"}</p>;
}
```

### useLocalStorage

```tsx
import { useLocalStorage } from "react-ssutil";

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");

  return (
    <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
      현재 테마: {theme}
    </button>
  );
}
```

### useOutsideClick

```tsx
import { useOutsideClick } from "react-ssutil";

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(true)}>열기</button>
      {isOpen && <ul>...</ul>}
    </div>
  );
}
```

### useMediaQuery

```tsx
import { useMediaQuery } from "react-ssutil";

function ResponsiveLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");

  return <div>{isMobile ? "모바일" : "데스크톱"}</div>;
}
```

### useQueryState

```tsx
import { useQueryState } from "react-ssutil";

function ProductList() {
  const [page, setPage] = useQueryState("page", 1, {
    parse: (value) => Number(value || 1),
    serialize: (value) => String(value),
  });
  const [sort, setSort] = useQueryState("sort", "latest");

  return (
    <>
      <button onClick={() => setSort("price")}>가격순</button>
      <button onClick={() => setPage((prev) => prev + 1)}>다음 페이지</button>
      <div>현재 페이지: {page}</div>
      <div>정렬 기준: {sort}</div>
    </>
  );
}
```

## 개발 환경 실행

```bash
# 의존성 설치
pnpm install

# 라이브러리 빌드 (watch 모드)
pnpm dev

# playground 실행 (별도 터미널)
cd playground && pnpm dev

# 테스트 실행
pnpm test

# 테스트 watch 모드
pnpm test:watch

# 타입 체크
pnpm lint
```

## 프로젝트 구조

```
react-ssutil/
├── src/
│   ├── hooks/
│   │   ├── useDebounce/
│   │   ├── useThrottle/
│   │   ├── useBoolean/
│   │   ├── usePrevious/
│   │   ├── useLocalStorage/
│   │   ├── useOutsideClick/
│   │   ├── useMediaQuery/
│   │   ├── useQueryState/
│   │   └── index.ts
│   └── index.ts
├── playground/          # React+TS 개발/테스트 환경
├── dist/               # 빌드 결과물 (자동 생성)
├── tsup.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## 배포

```bash
# npm 배포 (package.json의 version을 먼저 올릴 것)
pnpm publish --access public
```

## License

MIT
