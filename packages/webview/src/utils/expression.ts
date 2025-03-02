export function getExpression(issuesCount: number): Expression {
  if (issuesCount < 2) {
    return { values: { happy: 1.0, angry: 0, sad: 0 }, doBlink: false };
  } else if (issuesCount < 4) {
    return { values: { happy: 0, angry: 0, sad: 0 }, doBlink: true };
  } else if (issuesCount < 8) {
    return { values: { happy: 0, angry: 1.0, sad: 0 }, doBlink: true };
  } else {
    return { values: { happy: 0, angry: 0, sad: 1.0 }, doBlink: true };
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
