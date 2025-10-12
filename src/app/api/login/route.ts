// app/api/login/route.ts
import { NextResponse } from "next/server";
import { users } from "@/src/lib/users";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("session", JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
