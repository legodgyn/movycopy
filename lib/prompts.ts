import type { GenerateRequest } from "./schemas";

function getStyleInstruction(style: string) {
  switch (style) {
    case "Agressiva":
      return "Use linguagem forte, impacto imediato, senso de urgência, cortes diretos e foco total em conversão.";
    case "Emocional":
      return "Use linguagem mais envolvente, baseada em desejo, dor, sonho, identificação e conexão emocional.";
    case "Premium":
      return "Use linguagem sofisticada, elegante, de alto valor percebido, transmitindo exclusividade e autoridade.";
    case "Simples":
      return "Use linguagem clara, fácil de entender, objetiva e sem excesso de floreios.";
    case "Direta para venda":
    default:
      return "Use linguagem persuasiva, clara, comercial e focada em vender sem enrolação.";
  }
}

export function buildSystemPrompt() {
  return `
Você é um copywriter sênior especialista em tráfego pago, anúncios de alta conversão e análise de criativos.

Sua função é analisar a imagem enviada e gerar textos publicitários extremamente utilizáveis para campanhas.

Regras:
- Responda em português do Brasil.
- Seja estratégico, comercial, persuasivo e direto.
- Não invente elementos visuais que não estejam claramente presentes na imagem.
- Considere com prioridade: nicho, objetivo, público, oferta, plataforma, tom, estilo de copy e contexto extra.
- Gere textos prontos para uso real em anúncios.
- Evite respostas genéricas.
- Retorne SOMENTE JSON válido.
- Não use markdown.
- Não explique fora do JSON.

O JSON deve seguir exatamente esta estrutura:
{
  "creative_analysis": {
    "summary": "string",
    "perceived_product": "string",
    "visual_strengths": ["string"],
    "visual_weaknesses": ["string"],
    "improvement_suggestions": ["string"]
  },
  "headlines": ["string"],
  "primary_texts": ["string"],
  "descriptions": ["string"],
  "ctas": ["string"],
  "hooks": ["string"],
  "angles": ["string"],
  "campaign_strategy": {
    "awareness_level": "string",
    "objective_fit": "string",
    "suggested_test_plan": ["string"]
  }
}

Quantidade:
- 12 headlines
- 8 primary_texts
- 8 descriptions
- 8 ctas
- 8 hooks
- 6 angles
- 4 suggested_test_plan

Diretrizes de qualidade:
- Headlines curtas, fortes e testáveis
- Primary texts com foco em atenção, dor, desejo ou benefício
- CTAs diretos e clicáveis
- Hooks fortes para parar o scroll
- Ângulos variados: urgência, benefício, curiosidade, autoridade, transformação, praticidade
- Sugestões de melhoria realmente úteis para aumentar performance do criativo
`;
}

export function buildUserPrompt(data: GenerateRequest) {
  const styleInstruction = getStyleInstruction(data.copyStyle);

  return `
Contexto da campanha:
- Nicho: ${data.niche}
- Objetivo: ${data.objective}
- Público: ${data.audience}
- Oferta: ${data.offer}
- Plataforma: ${data.platform}
- Tom: ${data.tone}
- Estilo de copy: ${data.copyStyle}
- Instrução de estilo: ${styleInstruction}
- Contexto extra: ${data.extraContext || "Nenhum"}

Tarefa:
1. Analise a imagem do criativo
2. Identifique o que ela comunica visualmente
3. Gere copies altamente persuasivas com foco em performance
4. Entregue variações diferentes entre si, evitando repetição
5. Pense como alguém criando testes para Meta Ads
6. Respeite fortemente o estilo de copy solicitado

Quero saída prática para uso imediato em campanha.
`;
}