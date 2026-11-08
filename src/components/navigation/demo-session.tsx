"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Button, Modal } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";

interface DemoSessionValue {
  signedIn: boolean;
  signIn: (options?: { onCancel?: () => void }) => void;
  signOut: () => void;
}

const DemoSessionContext = createContext<DemoSessionValue>({
  signedIn: false,
  signIn: () => {},
  signOut: () => {},
});

// Explicit URL identity is only a prototype selector, never authentication.
export function DemoSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslation();

  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const userId = params.get("user");
  const trigger = useRef<HTMLElement | null>(null);
  const cancelSignIn = useRef<(() => void) | undefined>(
    undefined,
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("learner");
  function close() {
    cancelSignIn.current?.();
    cancelSignIn.current = undefined;
    setOpen(false);
    requestAnimationFrame(() => {
      if (trigger.current?.isConnected)
        trigger.current.focus();
    });
  }

  function choose() {
    cancelSignIn.current = undefined;
    const next = new URLSearchParams(params);
    next.set("user", selected);
    next.delete("attempt");
    next.delete("tag");
    next.delete("mode");
    setOpen(false);
    router.push(`${pathname}?${next}`);
  }
  return (
    <DemoSessionContext.Provider
      value={{
        signedIn: !!userId,
        signIn: (options) => {
          cancelSignIn.current = options?.onCancel;
          trigger.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          setSelected(userId ?? "learner");
          setOpen(true);
        },
        signOut: () => router.push("/"),
      }}
    >
      {children}
      {open && (
        <Modal
          open={open}
          onClose={close}
          title={t("데모 사용자 선택")}
        >
          <div className="space-y-5">
            <Dropdown
              label={t("더미 사용자")}
              value={selected}
              onValueChange={setSelected}
              options={[
                { value: "learner", label: t("학습자") },
                { value: "author", label: t("작성자") },
                { value: "friend", label: t("친구") },
              ]}
            />
            <div className="flex justify-end">
              <Button onClick={choose}>
                {t("선택한 사용자로 시작")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DemoSessionContext.Provider>
  );
}
export function useDemoSession() {
  return useContext(DemoSessionContext);
}
