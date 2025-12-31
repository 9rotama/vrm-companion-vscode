import { BlinkSettingsValues } from "../models/setting-values";

export function getExpression(
  issuesCount: number,
  blink: BlinkSettingsValues,
): Expression {
  if (issuesCount < 2) {
    return { values: { happy: 1.0, angry: 0, sad: 0 }, doBlink: blink.happy };
  } else if (issuesCount < 4) {
    return { values: { happy: 0, angry: 0, sad: 0 }, doBlink: blink.neutral };
  } else if (issuesCount < 8) {
    return { values: { happy: 0, angry: 1.0, sad: 0 }, doBlink: blink.angry };
  } else {
    return { values: { happy: 0, angry: 0, sad: 1.0 }, doBlink: blink.sad };
  }
}

export type Expression = {
  values: {
    happy: number;
    angry: number;
    sad: number;
  };
  doBlink: boolean;
};
