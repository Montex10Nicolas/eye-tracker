import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "~/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Siuwi Tracker",
  description: "The place to track all your favorite series and movies",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export function DisplaySearchMultiple() {
  async function searchMovieSeries(formData: FormData) {
    "use server";
    const search = formData.get("search") as string;

    redirect(`/search/${search}`);
  }

  return (
    <form action={searchMovieSeries} className="mb-3 mt-2 flex justify-center">
      <input
        type="text"
        name="search"
        placeholder={"Search a TV Series a Movie or a Person"}
        className="w-96 rounded-full px-4 py-2 text-lg text-black"
      />
    </form>
  );
}

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
