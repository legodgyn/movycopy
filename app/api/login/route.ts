import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body?.password || "");

    if (!process.env.APP_LOGIN_PASSWORD) {
      return NextResponse.json(
        { error: "Senha do sistema não configurada no .env.local" },
        { status: 500 }
      );
    }

    if (password !== process.env.APP_LOGIN_PASSWORD) {
      return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
    }

    const cookieStore = await cookies();

    cookieStore.set("copy_ai_auth", "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao fazer login." }, { status: 500 });
  }
}