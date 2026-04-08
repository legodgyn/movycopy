import { z } from "zod";

export const GenerateRequestSchema = z
  .object({
    imageBase64: z.string().min(1).optional(),
    mimeType: z.string().min(1).optional(),
    frames: z
      .array(
        z.object({
          base64: z.string().min(1),
          mimeType: z.string().min(1),
        })
      )
      .optional(),
    niche: z.string().min(1),
    objective: z.string().min(1),
    audience: z.string().min(1),
    offer: z.string().min(1),
    platform: z.string().min(1),
    tone: z.string().min(1),
    copyStyle: z.string().min(1),
    extraContext: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    const hasSingleImage = !!data.imageBase64 && !!data.mimeType;
    const hasFrames = !!data.frames && data.frames.length > 0;

    if (!hasSingleImage && !hasFrames) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Envie uma imagem única ou uma lista de frames do vídeo.",
        path: ["imageBase64"],
      });
    }
  });

export const GeneratedCopySchema = z.object({
  headlines: z.array(z.string()).min(1),
  primary_texts: z.array(z.string()).min(1),
  descriptions: z.array(z.string()).min(1),
  ctas: z.array(z.string()).min(1),
  hooks: z.array(z.string()).min(1),
  angles: z.array(z.string()).min(1),
  creative_analysis: z.object({
    summary: z.string(),
    perceived_product: z.string(),
    visual_strengths: z.array(z.string()),
    visual_weaknesses: z.array(z.string()),
    improvement_suggestions: z.array(z.string()),
  }),
  campaign_strategy: z.object({
    awareness_level: z.string(),
    objective_fit: z.string(),
    suggested_test_plan: z.array(z.string()),
  }),
  video_analysis: z
    .object({
      hook_strength: z.number(),
      retention_quality: z.number(),
      clarity_score: z.number(),
      cta_strength: z.number(),
      overall_score: z.number(),
    })
    .optional(),
  diagnosis: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
});

export type GeneratedCopy = z.infer<typeof GeneratedCopySchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
