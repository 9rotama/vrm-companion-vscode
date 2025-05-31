import { z } from "zod";

const bgSchema = z.object({
  bg: z.string(),
  preview: z.string(),
});

export type Bg = z.infer<typeof bgSchema>;

const assetsUriSchema = z.object({
  vrma: z.object({ idle: z.string() }),
  bg: z.object({ whiteDots: bgSchema }),
});

export type AssetsUri = z.infer<typeof assetsUriSchema>;

export const messageToWebviewSchema = z.union([
  z.object({
    command: z.literal("updateVrm"),
    body: z.object({ dataUrl: z.union([z.string(), z.undefined()]) }),
  }),
  z.object({
    command: z.literal("updateIssuesCount"),
    body: z.object({ count: z.number() }),
  }),
  z.object({
    command: z.literal("loadAssetsUri"),
    body: assetsUriSchema,
  }),
]);

export type MessageToWebview = z.infer<typeof messageToWebviewSchema>;

export const messageToVscodeSchema = z.object({
  command: z.literal("mounted"),
});

export type MessageToVscode = z.infer<typeof messageToVscodeSchema>;
