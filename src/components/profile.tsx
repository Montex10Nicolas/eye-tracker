"use client";
import { AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

export default function Profile(props: { logout: () => Promise<never> }) {
  const { logout } = props;
  const router = useRouter();

  async function handleSubmit() {
    await logout();
  }

  async function goToProfile() {
    router.push("/profile");
  }

  return (
    <section className="z-50 flex gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="overflow-hidden rounded-full bg-foreground">
          <Avatar>
            <AvatarImage src={"/github_logo.png"} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="z-50 flex w-32 cursor-pointer flex-col items-center rounded-md bg-sky-300 text-black">
          <DropdownMenuItem
            className="z-50 w-full cursor-pointer"
            onClick={goToProfile}
          >
            <Link href={"/profile"}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="z-50 w-full cursor-pointer"
            onClick={() => router.push("/list")}
          >
            <Link href={"/list"}>Your List</Link>
          </DropdownMenuItem>
          <Separator orientation="horizontal" className="bg-black" />
          <DropdownMenuItem
            className="z-50 w-full cursor-pointer bg-red-500 hover:bg-red-500"
            onClick={handleSubmit}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
}
