import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import Profile from "~/components/profile";
import { Logout } from "~/server/queries";
import { getUser } from "./(user)/action";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Siuwi Tracker",
  description: "The place to track all your favorite series and movies",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const loggedIn = user !== null;

  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white`}
      >
        <section className="mx-2 mb-6 flex flex-row items-center justify-between rounded-b-2xl bg-slate-200 px-6 py-2 text-black">
          <div></div>
          <div className="ml-auto text-3xl font-bold">
            <Link className="cursor-pointer" href={"/"}>
              <h1>Siuwi Tracker</h1>
            </Link>
          </div>
          <div className="ml-auto">
            {loggedIn ? (
              <Profile logout={Logout} />
            ) : (
              <Link href={"/login"}>
                <button className="rounded-md bg-sky-700 px-4 py-2 font-semibold  text-white">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </section>
        {children}
        <footer className="bottom-0 mt-auto flex h-20 w-full items-center justify-between bg-slate-800 p-6">
          <div>
            Created by <span>Nicolas Montecchiani</span>
          </div>
          <div>
            <a href="https://github.com/montex10nicolas" target="_blank">
              <Image
                src={"/github_logo.png"}
                height={50}
                width={50}
                alt="github logo"
              />
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
