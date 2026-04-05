import { z } from "zod";

export const GenerateRequestSchema = z.object({
  imageBase64: z.string().min(1, "Imagem obrigatória"),
  mimeType: z.string().min(1, "Mime type obrigatório"),
  niche: z.string().min(2, "Nicho obrigatório"),
  objective: z.string().min(2, "Objetivo obrigatório"),
  audience: z.string().min(2, "Público obrigatório"),
  offer: z.string().min(2, "Oferta obrigatória"),
  platform: z.string().default("Meta Ads"),
  tone: z.string().default("Persuasivo"),
  copyStyle: z.string().default("Direta para venda"),
  extraContext: z.string().optional().default(""),
});

export const GeneratedCopySchema = z.object({
  creative_analysis: z.object({
    summary: z.string(),
    perceived_product: z.string(),
    visual_strengths: z.array(z.string()),
    visual_weaknesses: z.array(z.string()),
    improvement_suggestions: z.array(z.string()),
  }),
  headlines: z.array(z.string()),
  primary_texts: z.array(z.string()),
  descriptions: z.array(z.string()),
  ctas: z.array(z.string()),
  hooks: z.array(z.string()),
  angles: z.array(z.string()),
  campaign_strategy: z.object({
    awareness_level: z.string(),
    objective_fit: z.string(),
    suggested_test_plan: z.array(z.string()),
  }),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type GeneratedCopy = z.infer<typeof GeneratedCopySchema>;