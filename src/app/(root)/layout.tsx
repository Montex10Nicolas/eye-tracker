import "~/styles/globals.css";

import { DisplaySearchMultiple } from "./detail/_components/Search";

export const metadata = {
  title: "Siuwi Tracker",
  description: "The place to track all your favorite series and movies",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function AppRootLayout({
  children,
  season,
}: {
  children: React.ReactNode;
  season: React.ReactNode;
}) {
  return (
    <section>
      <DisplaySearchMultiple />
      {season}
      {children}
    </section>
  );
}
