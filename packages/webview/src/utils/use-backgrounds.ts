import { useState } from "react";
import { State } from "../models/state";
import { vscode } from "./vscode";
import { loadStateOrDefault } from "./load-state";

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

function loadInitialBackgroundId(): string {
  return loadStateOrDefault().background?.id ?? emptyBg.id;
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
      ...loadStateOrDefault(),
      background: { id },
    } satisfies State);
  }

  return {
    backgrounds,
    currentBackgroundId,
    setBackground,
  };
}
