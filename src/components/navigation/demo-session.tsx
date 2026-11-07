"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

const DemoSessionContext = createContext({
  signedIn: false,
  signIn: () => {},
  signOut: () => {},
});

// Header demonstration only: no OAuth, persistence, or API authorization.
export function DemoSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [signedIn, setSignedIn] = useState(false);

  return (
    <DemoSessionContext.Provider
      value={{
        signedIn,
        signIn: () => setSignedIn(true),
        signOut: () => setSignedIn(false),
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  return useContext(DemoSessionContext);
}
