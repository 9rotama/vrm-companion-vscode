import { useState } from "react";
import { AssetsUri } from "../models/message";

export function useBackgrounds(bgsUrl: AssetsUri["bg"] | undefined) {
  const [currBgIdx, setCurrBgIdx] = useState<number | undefined>(undefined);
  const bgs = bgsUrl
    ? Object.entries(bgsUrl).map(([key, value]) => ({
        id: key,
        bg: value.bg,
        preview: value.preview,
      }))
    : [];

  return { currBgIdx, setCurrBgIdx, bgs };
}
