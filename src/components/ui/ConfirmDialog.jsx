import { useState, useCallback, createContext, useContext } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

const ConfirmContext = createContext(null);

/**
 * Provides an imperative confirm() that returns a promise<boolean>.
 * Usage:  const confirm = useConfirm();  if (await confirm({...})) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(state)}
        onClose={() => close(false)}
        size="sm"
        title={state?.title || "Are you sure?"}
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              {state?.cancelText || "Cancel"}
            </Button>
            <Button
              variant={state?.destructive ? "danger" : "primary"}
              onClick={() => close(true)}
            >
              {state?.confirmText || "Confirm"}
            </Button>
          </>
        }
      >
        <div className="flex gap-4">
          {state?.destructive && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <p className="text-sm leading-relaxed text-ink-600">
            {state?.message || "This action cannot be undone."}
          </p>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
