import { useCallback } from "react";

interface UseCopyToClipboardParams {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

interface UseCopyToClipboardReturn {
  copy: (text: string) => Promise<boolean>;
}

/**
 * 텍스트를 클립보드에 복사하는 훅
 *
 * 보안 컨텍스트(HTTPS)에서는 Clipboard API를 사용하고,
 * 그 외 환경에서는 textarea + execCommand 폴백을 사용합니다.
 *
 * @param onSuccess - 복사 성공 시 실행할 콜백 (선택)
 * @param onError - 복사 실패 시 실행할 콜백 (선택)
 * @returns { copy } - 복사 함수, 성공 여부를 boolean으로 반환
 *
 * @example
 * const { copy } = useCopyToClipboard({
 *   onSuccess: () => toast('복사되었습니다'),
 *   onError: () => toast.error('복사에 실패했습니다'),
 * });
 * return <button onClick={() => copy('복사할 텍스트')}>복사</button>;
 */
export function useCopyToClipboard({
  onSuccess,
  onError,
}: UseCopyToClipboardParams = {}): UseCopyToClipboardReturn {
  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        // 브라우저가 Clipboard API를 지원하고, 현재 페이지가 보안 컨텍스트(HTTPS)인 경우
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          window.isSecureContext
        ) {
          // 비동기로 동작하며 깔끔하게 텍스트를 복사할 수 있습니다.
          await navigator.clipboard.writeText(text);
        } else {
          // fallback: HTTPS가 아닌 환경 대응
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "");
          textarea.style.cssText = "position:fixed;left:-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          // deprecated이지만 비보안 컨텍스트 폴백으로 의도적으로 사용
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        onSuccess?.();
        return true;
      } catch (err) {
        onError?.(err);
        return false;
      }
    },
    [onSuccess, onError]
  );

  return { copy };
}
