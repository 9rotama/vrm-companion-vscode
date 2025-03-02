import { z } from "zod";

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
    command: z.literal("prepareVrmaUris"),
    body: z.object({ idle: z.string() }),
  }),
]);

export type MessageToWebview = z.infer<typeof messageToWebviewSchema>;

export const messageToVscodeSchema = z.object({
  command: z.literal("mounted"),
});

export type MessageToVscode = z.infer<typeof messageToVscodeSchema>;
