import { useState } from "react";
import * as v from "valibot";
import { State, stateSchema } from "../models/state";
import { vscode } from "./vscode";

export type Background =
  | {
      type: "empty";
      id: "empty";
    }
  | {
      type: "image";
      id: string;
      imageUri: string;
      previewUri: string;
    };

export const emptyBg: Background = {
  id: "empty",
  type: "empty",
} as const;

function loadState(): NonNullable<State> {
  const parsed = v.safeParse(stateSchema, vscode.getState());
  if (!parsed.success) {
    console.warn("Failed to parse state:", parsed.issues);
    return {};
  }
  return parsed.output ?? {};
}

function loadInitialBackgroundId(): string {
  return loadState().background?.id ?? emptyBg.id;
}

export function useBackgrounds(loadedBackgrounds: Background[] | undefined) {
  const [currentBackgroundId, setCurrentBackgroundId] = useState<string>(
    loadInitialBackgroundId,
  );

  const backgrounds = loadedBackgrounds
    ? [emptyBg, ...loadedBackgrounds]
    : [emptyBg];

  function setBackground(id: string) {
    setCurrentBackgroundId(id);
    vscode.setState({
      ...loadState(),
      background: { id },
    } satisfies State);
  }

  return {
    backgrounds,
    currentBackgroundId,
    setBackground,
  };
}
