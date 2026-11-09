import * as v from "valibot";

const backgroundImageFilesSchema = v.array(
  v.object({
    id: v.string(),
    imageUri: v.string(),
    previewUri: v.string(),
  }),
);

const vrmaFilesSchema = v.object({
  idle: v.string(),
});

const assetsSchema = v.object({
  vrmaFiles: vrmaFilesSchema,
  backgroundImageFiles: backgroundImageFilesSchema,
});

export type Assets = v.InferOutput<typeof assetsSchema>;

export const messageToWebviewSchema = v.union([
  v.object({
    command: v.literal("visibility"),
    body: v.object({ visible: v.boolean() }),
  }),
  v.object({
    command: v.literal("measureRender"),
    body: v.object({ id: v.string() }),
  }),
  v.object({
    command: v.literal("updateVrm"),
    body: v.object({ uri: v.union([v.string(), v.undefined()]) }),
  }),
  v.object({
    command: v.literal("updateIssuesCount"),
    body: v.object({ count: v.number() }),
  }),
  v.object({
    command: v.literal("loadAssetsUri"),
    body: assetsSchema,
  }),
]);

export type MessageToWebview = v.InferOutput<typeof messageToWebviewSchema>;

export const messageToVscodeSchema = v.union([
  v.object({
    command: v.literal("mounted"),
  }),
  v.object({
    command: v.literal("rendered"),
    body: v.object({ elapsed: v.number(), reason: v.string() }),
  }),
]);

export type MessageToVscode = v.InferOutput<typeof messageToVscodeSchema>;
