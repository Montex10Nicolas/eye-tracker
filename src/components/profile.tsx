"use client";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Profile() {
  return (
    <section>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src="/image_not_found.png" alt="avatar image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-md bg-cyan-600 px-6 py-2 text-white">
          <DropdownMenuItem>
            <Link href={"/profile"}>
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DropdownMenuLabel className="cursor-pointer text-red-600 ">
              <Link href={"/logout"}>Log Out</Link>
            </DropdownMenuLabel>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
}
