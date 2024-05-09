"use client";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function Profile(props: { logout: () => Promise<never> }) {
  const { logout } = props;
  return (
    <section>
      <Link href={"/profile"}>
        <button>go to profile</button>
      </Link>
      <form action={logout}>
        <button type="submit">logout</button>
      </form>
    </section>
  );
}
