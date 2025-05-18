import { useEffect, useState } from "react";
import { vscode } from "./vscode";
import { CameraState, stateSchema } from "../models/state";
import { useDebounce } from "use-debounce";

export function useSettings() {
  const [camera, setCamera] = useState<CameraState>(
    stateSchema.parse(vscode.getState())?.camera || {
      position: { y: 1.0, z: 0.7 },
    },
  );
  const [debouncedCameraState] = useDebounce(camera, 500);

  useEffect(() => {
    const state = stateSchema.parse(vscode.getState());
    vscode.setState({ ...state, camera });
  }, [debouncedCameraState]);

  return { camera, setCamera };
}
