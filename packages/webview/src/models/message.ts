import { z } from "zod";

const backgroundImageFilesSchema = z.array(
  z.object({
    id: z.string(),
    imageUri: z.string(),
    previewUri: z.string(),
  }),
);

const vrmaFilesSchema = z.object({
  idle: z.string(),
});

const assetsSchema = z.object({
  vrmaFiles: vrmaFilesSchema,
  backgroundImageFiles: backgroundImageFilesSchema,
});

export type Assets = z.infer<typeof assetsSchema>;

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
    body: assetsSchema,
  }),
]);

export type MessageToWebview = z.infer<typeof messageToWebviewSchema>;

export const messageToVscodeSchema = z.object({
  command: z.literal("mounted"),
});

export type MessageToVscode = z.infer<typeof messageToVscodeSchema>;
