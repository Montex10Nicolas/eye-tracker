"use client";

import { createContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const CloseContext = createContext<{ close: () => void } | null>(null);

export function EditSeason(props: {
  myButton: React.ReactNode;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const { myButton, children } = props;

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
        <div onClick={() => setVisible(true)}>{myButton}</div>
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
