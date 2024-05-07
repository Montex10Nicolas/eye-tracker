import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { DisplaySearchMultiple } from "./detail/_components/Search";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Siuwi Tracker",
  description: "The place to track all your favorite series and movies",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <DisplaySearchMultiple />
      {children}
    </section>
  );
}
