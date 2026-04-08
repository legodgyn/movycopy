import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { GenerateRequestSchema, GeneratedCopySchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const normalizedBody = {
      ...body,
      imageBase64:
        body?.imageBase64 ||
        body?.frames?.[0]?.base64 ||
        "",
      mimeType:
        body?.mimeType ||
        body?.frames?.[0]?.mimeType ||
        "",
    };

    const parsed = GenerateRequestSchema.safeParse(normalizedBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const visualInputs = Array.isArray(body?.frames) && body.frames.length > 0
      ? body.frames.map((frame: { base64: string; mimeType: string }) => ({
          type: "input_image" as const,
          image_url: `data:${frame.mimeType};base64,${frame.base64}`,
          detail: "auto" as const,
        }))
      : [
          {
            type: "input_image" as const,
            image_url: `data:${data.mimeType};base64,${data.imageBase64}`,
            detail: "auto" as const,
          },
        ];

    const videoInstruction = Array.isArray(body?.frames) && body.frames.length > 0
      ? `\nVocê recebeu vários frames de um vídeo publicitário. Trate a entrada como uma sequência visual do mesmo anúncio e analise:\n- abertura\n- desenvolvimento da mensagem\n- consistência visual\n- clareza da oferta\n- presença e força do CTA\n- ritmo e retenção visual\n- coerência entre início, meio e fim\n`
      : "";

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: buildSystemPrompt() }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${buildUserPrompt(data)}${videoInstruction}`,
            },
            ...visualInputs,
          ],
        },
      ],
    });

    const rawText = response.output_text;

    if (!rawText) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo." },
        { status: 500 }
      );
    }

    let json: unknown;

    try {
      json = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "A resposta da IA não veio em JSON válido.",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    const validated = GeneratedCopySchema.safeParse(json);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "O JSON retornado não bate com o schema esperado.",
          details: validated.error.flatten(),
          raw: json,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: validated.data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}
