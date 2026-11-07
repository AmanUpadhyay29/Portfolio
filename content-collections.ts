import { z } from "zod";
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { workSchema } from "./src/lib/work-schema";

const work = defineCollection({
  name: "work",
  directory: "content/work",
  include: "*.mdx",
  schema: workSchema.extend({ content: z.string() }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc);
    return { ...doc, mdx };
  },
});

export default defineConfig({ content: [work] });
