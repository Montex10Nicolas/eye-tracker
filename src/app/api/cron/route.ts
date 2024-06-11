import { NextResponse } from "next/server";
import { lucia } from "~/lib/auth";

export async function DELETE() {
  await lucia.deleteExpiredSessions();

  console.log("hello");

  return NextResponse.json({ deleted: true });
}
