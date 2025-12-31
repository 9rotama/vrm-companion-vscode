import { useEffect, useState } from "react";
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

export function useBackgrounds(loadedBackgrounds: Background[] | undefined) {
  const [currentBackgroundId, setCurrentBackgroundId] = useState<string>(
    emptyBg.id,
  );

  const backgrounds = loadedBackgrounds
    ? [emptyBg, ...loadedBackgrounds]
    : [emptyBg];

  useEffect(() => {
    // load background id
    const state = stateSchema.safeParse(vscode.getState());

    if (!state.success || !state.data?.background) return;

    setCurrentBackgroundId(state.data.background.id);
  }, [loadedBackgrounds]);

  function setBackground(id: string) {
    // save background id
    const state = stateSchema.safeParse(vscode.getState());

    if (!state.success) return;

    setCurrentBackgroundId(id);
    vscode.setState(
      stateSchema.safeParse({
        ...state.data,
        background: { id: currentBackgroundId },
      } satisfies State),
    );
  }

  return {
    backgrounds,
    currentBackgroundId,
    setBackground,
  };
}
