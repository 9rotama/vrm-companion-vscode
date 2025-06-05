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
    const state = stateSchema.parse(vscode.getState());
    console.log("Background loaded:", state?.bg?.id, bgs);

    if (!state) return;
    if (!state.bg) return;

    const loadedBgId = state.bg.id;
    const targetBgIdx = bgs.findIndex((v) => v.id === loadedBgId);
    console.log("Target background index:", targetBgIdx);

    if (targetBgIdx !== -1) setCurrBgIdx(targetBgIdx);
  }, [assetsBgs]);

  function saveBackground(nextBgIdx: number) {
    // save background id
    const state = stateSchema.parse(vscode.getState());
    console.log("Background saved:", { id: bgs[nextBgIdx].id });

    vscode.setState(
      stateSchema.parse({
        ...state,
        bg: { id: bgs[nextBgIdx].id },
      } satisfies State),
    );
  }

  return { currBgIdx, setCurrBgIdx, saveBackground, bgs };
}
