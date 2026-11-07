import { z } from "zod";

export const workSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string().max(200),
  status: z.enum(["running 24/7", "live", "live · private"]),
  repo: z.enum(["v1", "matrix", "xchart"]),
  object: z.enum(["rack", "matrix", "xchart"]),
  stack: z.array(z.string()).min(1),
  order: z.number(),
});

export type WorkMeta = z.infer<typeof workSchema>;
