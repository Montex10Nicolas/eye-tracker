import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Siuwi Tracker",
  description: "The place to track all your favorite series and movies",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function searchMovieSeries(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;

    redirect(`/search/${search}`);
  }

  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white`}
      >
        <div className="flex w-full flex-col items-center justify-center gap-4 py-6">
          <Link href={"/"}>
            <h1 className="text-5xl">The Siuwi Tracker</h1>
          </Link>
          <form action={searchMovieSeries}>
            <input
              type="text"
              className="w-96 rounded-2xl p-2 text-center text-black"
              placeholder="Search a Movie a Series or a Person"
              name="search"
            />
          </form>
          <Link href={"/login"}>
            <button type="submit">Login</button>
          </Link>
          <Link href={"/register"}>
            <button type="submit">Register</button>
          </Link>
        </div>
        {children}
      </body>
    </html>
  );
}
