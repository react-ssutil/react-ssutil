import { useState, useCallback } from "react";
import {
  useDebounce,
  useThrottle,
  useBoolean,
  usePrevious,
  useMediaQuery,
  useLocalStorage,
  useCopyToClipboard,
} from "react-ssutil";

const styles = {
  app: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "32px 20px",
  } as React.CSSProperties,
  header: {
    marginBottom: 40,
    borderBottom: "1px solid #333",
    paddingBottom: 20,
  } as React.CSSProperties,
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 8,
  } as React.CSSProperties,
  subtitle: {
    color: "#888",
    fontSize: 14,
  } as React.CSSProperties,
  section: {
    background: "#1a1a1a",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    border: "1px solid #2a2a2a",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#a78bfa",
    marginBottom: 16,
    fontFamily: "monospace",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "#252525",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#ececec",
    fontSize: 14,
    outline: "none",
    marginBottom: 12,
  } as React.CSSProperties,
  log: {
    background: "#111",
    borderRadius: 6,
    padding: "10px 14px",
    fontSize: 13,
    color: "#4ade80",
    fontFamily: "monospace",
    minHeight: 40,
  } as React.CSSProperties,
  row: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap" as const,
  },
  button: {
    padding: "8px 16px",
    background: "#7c3aed",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  } as React.CSSProperties,
  badge: (active: boolean) =>
    ({
      padding: "4px 12px",
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 600,
      background: active ? "#4ade80" : "#ef4444",
      color: "#000",
    }) as React.CSSProperties,
  value: {
    color: "#facc15",
    fontFamily: "monospace",
    fontSize: 14,
  } as React.CSSProperties,
};

function DebounceDemo() {
  const [input, setInput] = useState("");
  const [debouncedLog, setDebouncedLog] = useState("(입력을 시작하세요)");
  const [callCount, setCallCount] = useState(0);

  const handleDebounced = useDebounce((value: string) => {
    setDebouncedLog(`debounced: "${value}"`);
    setCallCount((c) => c + 1);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    handleDebounced(e.target.value);
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>useDebounce (500ms)</div>
      <input
        style={styles.input}
        value={input}
        onChange={handleChange}
        placeholder="빠르게 입력해보세요..."
      />
      <div style={styles.log}>
        {debouncedLog}
        <span style={{ color: "#888", marginLeft: 12 }}>
          실행 횟수: {callCount}
        </span>
      </div>
    </div>
  );
}

function ThrottleDemo() {
  const [clickCount, setClickCount] = useState(0);
  const [throttledCount, setThrottledCount] = useState(0);

  const handleThrottled = useThrottle(() => {
    setThrottledCount((c) => c + 1);
  }, 1000);

  const handleClick = () => {
    setClickCount((c) => c + 1);
    handleThrottled();
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>useThrottle (1000ms)</div>
      <div style={styles.row}>
        <button style={styles.button} onClick={handleClick}>
          빠르게 클릭!
        </button>
        <span style={styles.value}>클릭: {clickCount}번</span>
        <span style={styles.value}>실제 실행: {throttledCount}번</span>
      </div>
      <div style={styles.log}>
        1초에 1번만 실행됩니다. (클릭 {clickCount} / 실행 {throttledCount})
      </div>
    </div>
  );
}

function BooleanDemo() {
  const { value: isOpen, setTrue: open, setFalse: close, toggle } = useBoolean(false);

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>useBoolean</div>
      <div style={styles.row}>
        <span style={styles.badge(isOpen)}>{isOpen ? "true" : "false"}</span>
        <button style={styles.button} onClick={open}>setTrue</button>
        <button style={styles.button} onClick={close}>setFalse</button>
        <button style={styles.button} onClick={toggle}>toggle</button>
      </div>
    </div>
  );
}

function PreviousDemo() {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>usePrevious</div>
      <div style={styles.row}>
        <button style={styles.button} onClick={() => setCount((c) => c + 1)}>
          +1 증가
        </button>
        <span style={styles.value}>현재: {count}</span>
        <span style={styles.value}>이전: {prev ?? "없음"}</span>
      </div>
    </div>
  );
}

function MediaQueryDemo() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>useMediaQuery</div>
      <div style={styles.row}>
        <span style={styles.value}>모바일(&lt;768px):</span>
        <span style={styles.badge(isMobile)}>{isMobile ? "YES" : "NO"}</span>
        <span style={styles.value}>다크모드:</span>
        <span style={styles.badge(isDark)}>{isDark ? "YES" : "NO"}</span>
      </div>
    </div>
  );
}

function LocalStorageDemo() {
  const [stored, setStored, remove] = useLocalStorage("playground-value", "");
  const [input, setInput] = useState("");

  const handleSave = useCallback(() => {
    setStored(input);
    setInput("");
  }, [input, setStored]);

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>useLocalStorage</div>
      <div style={styles.row}>
        <input
          style={{ ...styles.input, marginBottom: 0, flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="저장할 값을 입력하세요..."
        />
        <button style={styles.button} onClick={handleSave}>저장</button>
        <button style={{ ...styles.button, background: "#dc2626" }} onClick={remove}>삭제</button>
      </div>
      <div style={{ ...styles.log, marginTop: 12 }}>
        localStorage["playground-value"]: {stored ? `"${stored}"` : "(비어있음)"}
      </div>
    </div>
  );
}

function CopyToClipboardDemo() {
  const [input, setInput] = useState("복사할 텍스트를 입력하세요");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const { copy } = useCopyToClipboard({
    onSuccess: () => setStatus("success"),
    onError: () => setStatus("error"),
  });

  const handleCopy = useCallback(async () => {
    setStatus("idle");
    await copy(input);
  }, [copy, input]);

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>useCopyToClipboard</div>
      <div style={styles.row}>
        <input
          style={{ ...styles.input, marginBottom: 0, flex: 1 }}
          value={input}
          onChange={(e) => { setInput(e.target.value); setStatus("idle"); }}
        />
        <button style={styles.button} onClick={handleCopy}>복사</button>
      </div>
      {status !== "idle" && (
        <div style={{ ...styles.log, marginTop: 12, color: status === "success" ? "#4ade80" : "#ef4444" }}>
          {status === "success" ? "클립보드에 복사되었습니다" : "복사에 실패했습니다"}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.title}>react-ssutil playground</div>
        <div style={styles.subtitle}>
          커스텀 훅 라이브러리 개발 환경 — 각 훅을 직접 테스트해보세요.
        </div>
      </div>
      <DebounceDemo />
      <ThrottleDemo />
      <BooleanDemo />
      <PreviousDemo />
      <MediaQueryDemo />
      <LocalStorageDemo />
      <CopyToClipboardDemo />
    </div>
  );
}
