"use client";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { redirect } from "next/navigation";
import SomeServerComponent from "./server";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Profile(props: { logout: () => Promise<never> }) {
  const { logout } = props;

  async function handleSubmit() {
    console.log("handle submit");
    await logout();
  }

  return (
    <section className="flex gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src="/github.logo.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="rounded-md bg-sky-300 text-black">
          <DropdownMenuItem>
            <Link href={"/profile"}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSubmit}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
}
