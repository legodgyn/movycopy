import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      imageBase64,
      mimeType,
      copyStyle,
      objective,
      extraInstruction,
    } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Imagem obrigatória." },
        { status: 400 }
      );
    }

    const styleInstruction = getStyleInstruction(copyStyle);
    const objectiveInstruction = getObjectiveInstruction(objective);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `
Você é um copywriter especialista em anúncios de alta conversão para plataformas como Meta Ads (Facebook e Instagram).

Sua função é gerar copies que convertem, MAS que também respeitam as políticas de anúncios e evitam reprovação.

REGRAS CRÍTICAS (OBRIGATÓRIO SEGUIR):

🚫 NÃO usar:
- Promessas exageradas (ex: "ganhe dinheiro rápido", "resultado imediato", "sem esforço")
- Garantias (ex: "100% garantido", "certeza", "sem risco")
- Linguagem sensacionalista ou enganosa
- Antes/depois implícito
- Afirmações absolutas

🚫 NÃO usar atributos pessoais:
- "Você está acima do peso"
- "Você tem dívidas"
- "Você sofre com..."
- "Você é..."
- "Você precisa..."

👉 Sempre falar de forma indireta:
✔ "Muitas pessoas enfrentam..."
✔ "Se isso faz sentido para você..."
✔ "Uma forma de melhorar..."

🚫 NÃO usar termos sensíveis:
- renda garantida
- dinheiro fácil
- enriquecimento rápido
- aprovado na hora
- sem burocracia
- cura
- emagrecimento rápido
- crédito para negativado
- solução definitiva

---

✅ USAR:
- Linguagem persuasiva, mas natural
- Benefícios sem exagero
- Tom profissional ou estratégico
- Curiosidade e desejo sem prometer demais
- Foco em valor percebido

---

🎯 OBJETIVO:
Gerar copy que:
- Tenha alta taxa de clique (CTR)
- Não seja barrada pela Meta
- Pareça anúncio real aprovado

---

📦 FORMATO OBRIGATÓRIO (JSON PURO):
{
  "headlines": [],
  "primary_texts": [],
  "descriptions": [],
  "ctas": [],
  "hooks": [],
  "angles": []
}

---

📊 QUANTIDADE:
- 5 headlines
- 3 primary_texts
- 3 descriptions
- 3 ctas
- 3 hooks
- 3 angles

---

📌 DIRETRIZ FINAL:
Se uma frase parecer agressiva ou arriscada, REESCREVA para uma versão mais segura sem perder persuasão.

Nunca quebre as regras acima.
Nunca explique.
Nunca use markdown.
Retorne apenas o JSON.

ESTILO:
${styleInstruction}

OBJETIVO:
${objectiveInstruction}

INSTRUÇÃO EXTRA:
${extraInstruction || "Nenhuma"}
              `,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analise o criativo e gere copies diferentes entre si, com foco em performance.
              `,
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const text = response.output_text;

    if (!text) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo." },
        { status: 500 }
      );
    }

    let json: unknown;

    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Resposta inválida da IA",
          raw: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: json });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

function getStyleInstruction(style: string) {
  switch (style) {
    case "Agressiva":
      return "Linguagem forte, direta, com urgência e impacto.";
    case "Emocional":
      return "Linguagem emocional, conectando dor e desejo.";
    case "Premium":
      return "Linguagem sofisticada, alto valor percebido.";
    case "Simples":
      return "Linguagem clara, simples e objetiva.";
    default:
      return "Linguagem persuasiva focada em venda.";
  }
}

function getObjectiveInstruction(objective: string) {
  switch (objective) {
    case "Lead":
      return "Foco em capturar contato.";
    case "WhatsApp":
      return "Foco em gerar conversa.";
    case "Tráfego":
      return "Foco em clique.";
    default:
      return "Foco em conversão direta.";
  }
}