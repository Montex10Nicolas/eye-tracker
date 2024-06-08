"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginRedirect(props: { time: number }) {
  const router = useRouter();

  const { time } = props;
  const [timer, setTimer] = useState(time);

  if (timer === 0) {
    router.push("/login");
  }

  setInterval(() => {
    const now = timer;
    setTimer(now - 1);
  }, 1000);

  return <>{timer}</>;
}

export function NoUser() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <div className="-mt-40 h-[50%] w-[90%] rounded-sm bg-white text-black">
        <p className="space-x-2 p-8 text-center text-3xl">
          You need an account to access this area, you will be redirected in wtf
        </p>
        <div className="text-center text-6xl">
          <LoginRedirect time={3} />
        </div>
      </div>
    </main>
  );
}
