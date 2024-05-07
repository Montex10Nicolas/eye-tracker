import "~/styles/globals.css";

import { DisplaySearchMultiple } from "./detail/_components/Search";

export const metadata = {
  title: "Siuwi Tracker",
  description: "The place to track all your favorite series and movies",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <DisplaySearchMultiple />
      {children}
    </section>
  );
}
