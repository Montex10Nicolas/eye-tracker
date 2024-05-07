import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, lucia } from "~/lib/auth";

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
  async function searchMovieSeries(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;

    redirect(`/search/${search}`);
  }

  async function LogOut() {
    "use server";
    const user = await getUser();
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (sessionId !== null) {
      await lucia.invalidateSession(sessionId);
    }
    if (user !== null) {
      await lucia.invalidateUserSessions(user.username);
    }

    cookies().delete(lucia.sessionCookieName);
  }

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
              <form action={LogOut}>
                <button className="rounded-md bg-sky-700 px-4 py-2 font-semibold  text-white">
                  Log Out
                </button>
              </form>
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
      </body>
    </html>
  );
}
