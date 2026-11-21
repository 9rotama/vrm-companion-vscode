import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { RuleTester } from "oxlint/plugins-dev";

RuleTester.describe = describe;
RuleTester.it = it;

export const fixtureFile = fileURLToPath(
  new URL("./fixtures/consumer.ts", import.meta.url),
);

export const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});
