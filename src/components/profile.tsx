"use client";
import { AvatarImage } from "@radix-ui/react-avatar";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

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
            <AvatarImage src={"/github_logo.png"} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="flex w-32 cursor-pointer flex-col items-center rounded-md bg-sky-300 text-black">
          <DropdownMenuItem className="w-full cursor-pointer">
            <Link href={"/profile"}>Profile</Link>
          </DropdownMenuItem>
          <Separator orientation="horizontal" className="bg-black" />
          <DropdownMenuItem
            className="w-full cursor-pointer bg-red-500 hover:bg-red-500"
            onClick={handleSubmit}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
}