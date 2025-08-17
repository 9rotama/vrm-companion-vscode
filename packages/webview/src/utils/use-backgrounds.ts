import { useEffect, useState } from "react";
import { Bg } from "../models/message";
import { State, stateSchema } from "../models/state";
import { vscode } from "./vscode";

export const emptyBg: Bg = {
  id: "empty",
  bg: "",
  preview: "",
};

export function useBackgrounds(assetsBgs: Bg[] | undefined) {
  const [currBgIdx, setCurrBgIdx] = useState<number>(0);

  const bgs = assetsBgs ? [emptyBg, ...assetsBgs] : [emptyBg];

  useEffect(() => {
    // load background id
    const state = stateSchema.safeParse(vscode.getState());

    if (!state.success || !state.data?.bg) return;

    const loadedBgId = state.data.bg.id;
    const targetBgIdx = bgs.findIndex((v) => v.id === loadedBgId);

    if (targetBgIdx !== -1) setCurrBgIdx(targetBgIdx);
  }, [assetsBgs]);

  function saveBackground(nextBgIdx: number) {
    // save background id
    const state = stateSchema.safeParse(vscode.getState());

    if (!state.success) return;

    vscode.setState(
      stateSchema.safeParse({
        ...state.data,
        bg: { id: bgs[nextBgIdx].id },
      } satisfies State),
    );
  }

  return { currBgIdx, setCurrBgIdx, saveBackground, bgs };
}
