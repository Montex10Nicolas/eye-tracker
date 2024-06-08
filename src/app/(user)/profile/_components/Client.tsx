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
