import { useEffect, useRef, useId } from "react";
import { Button } from "./Button";

interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  "data-testid"?: string;
}

export function ConfirmDialog({
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  "data-testid": testid = "confirm-dialog",
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const msgId = useId();

  useEffect(() => {
    confirmRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      data-testid={`${testid}-backdrop`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        data-testid={testid}
        role="alertdialog"
        aria-modal="true"
        aria-describedby={msgId}
        className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id={msgId}
          data-testid={`${testid}-message`}
          className="mb-6 text-sm text-slate-200"
        >
          {message}
        </p>
        <div className="flex gap-3">
          <Button
            ref={confirmRef}
            data-testid={`${testid}-confirm`}
            onClick={onConfirm}
            className="bg-red-700 text-white hover:bg-red-600 border-red-700"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="secondary"
            data-testid={`${testid}-cancel`}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
