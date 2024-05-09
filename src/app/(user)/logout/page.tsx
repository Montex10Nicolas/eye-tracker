"use server";
import { Logout } from "~/server/queries";

export default async function Page() {
  await Logout();
}
