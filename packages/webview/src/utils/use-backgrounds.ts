import { useEffect, useState } from "react";
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

export function useBackgrounds(loadedBackgrounds: Background[] | undefined) {
  const [currentBackgroundId, setCurrentBackgroundId] = useState<string>(
    emptyBg.id,
  );

  const backgrounds = loadedBackgrounds
    ? [emptyBg, ...loadedBackgrounds]
    : [emptyBg];

  useEffect(() => {
    // load background id
    const state = v.safeParse(stateSchema, vscode.getState());

    if (!state.success || !state.output?.background) return;

    setCurrentBackgroundId(state.output.background.id);
  }, [loadedBackgrounds]);

  function setBackground(id: string) {
    // save background id
    const state = v.safeParse(stateSchema, vscode.getState());

    if (!state.success) return;

    setCurrentBackgroundId(id);
    vscode.setState(
      v.safeParse(stateSchema, {
        ...state.output,
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
