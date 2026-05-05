import * as v from "valibot";

const envSchema = v.object({
  VITE_DEV_VRM: v.optional(v.string()),
});

export const env = v.parse(envSchema, import.meta.env);
