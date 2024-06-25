"use client";

import { createContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const CloseContext = createContext<{ close: () => void } | null>(null);

export function EditSeason(props: {
  myButton: React.ReactNode;
  children: React.ReactNode;

  // Ease of programming
  value?: boolean;
}) {
  const { myButton, children, value } = props;
  const [visible, setVisible] = useState(value ?? false);

  useEffect(() => {
    document.body.style.overflowY = visible ? "hidden" : "visible";
  }, [visible]);

  useEffect(() => {
    return () => {
      document.body.style.overflowY = "visible";
    };
  }, []);

  if (!visible) {
    return (
      <>
        <div className="w-2/5 sm:w-full" onClick={() => setVisible(true)}>
          {myButton}
        </div>
      </>
    );
  }

  function closeDialog() {
    setVisible(false);
  }

  return (
    <div className="">
      {createPortal(
        <div className="fixed left-0 top-0 flex h-[100vh] min-h-screen w-screen overflow-auto bg-slate-900 bg-opacity-95">
          <div
            onClick={() => {
              setVisible(false);
            }}
            className="absolute left-0 top-0 min-h-full min-w-full cursor-crosshair bg-transparent"
          ></div>
          <CloseContext.Provider value={{ close: closeDialog }}>
            {children}
          </CloseContext.Provider>
        </div>,
        document.body,
      )}
    </div>
  );
}
