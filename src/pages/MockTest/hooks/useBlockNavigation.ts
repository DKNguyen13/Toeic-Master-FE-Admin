import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function useBlockNavigation(
  shouldBlock: boolean,
  onConfirmLeave?: () => void
) {
  const navigate = useNavigate();
  const originalNavigate = useRef(navigate);

  // 1️⃣ Cảnh báo khi reload / đóng tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock]);

  // 2️⃣ Chặn click link nội bộ
  useEffect(() => {
    if (!shouldBlock) return;

    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link && link.href && link.origin === window.location.origin) {
        e.preventDefault();
        e.stopPropagation(); // chặn lan truyền thêm
        const confirmLeave = window.confirm(
          "Bạn có chắc muốn rời trang này không? Mọi thay đổi chưa lưu sẽ bị mất."
        );
        if (confirmLeave) {
          onConfirmLeave?.();
          navigate(link.pathname + link.search + link.hash);
        }
      }
    };

    // ✅ Thêm useCapture = true
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [shouldBlock, onConfirmLeave, navigate]);

  // 3️⃣ Ghi đè navigate() trong code
  useEffect(() => {
    if (!shouldBlock) return;

    const customNavigate = (to: any, options?: any) => {
      const confirmLeave = window.confirm(
        "Bạn có chắc muốn rời trang này không? Mọi thay đổi chưa lưu sẽ bị mất."
      );
      if (confirmLeave) {
        onConfirmLeave?.();
        originalNavigate.current(to, options);
      }
    };

    (window as any).navigate = customNavigate;
    return () => {
      (window as any).navigate = originalNavigate.current;
    };
  }, [shouldBlock, onConfirmLeave]);
}
