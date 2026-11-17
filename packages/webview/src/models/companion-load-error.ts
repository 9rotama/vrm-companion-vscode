export type CompanionLoadError =
  | {
      type: "fetchFailed";
      asset: "model" | "animation";
      url: string;
      cause: unknown;
    }
  | { type: "notVrm"; url: string }
  | { type: "notVrmAnimation"; url: string };

export type UnexpectedError = { type: "unexpected"; cause: unknown };

export function describeCompanionLoadError(
  error: CompanionLoadError | UnexpectedError,
): string {
  switch (error.type) {
    case "fetchFailed":
      return `Failed to fetch ${error.asset} (${error.url}): ${String(error.cause)}`;
    case "notVrm":
      return `The selected file does not contain a VRM model (${error.url})`;
    case "notVrmAnimation":
      return `The animation file does not contain a VRM animation (${error.url})`;
    case "unexpected":
      return `Unexpected error: ${String(error.cause)}`;
  }
}
