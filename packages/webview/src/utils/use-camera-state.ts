import { useEffect, useState } from "react";
import { vscode } from "./vscode";
import { CameraState, stateSchema } from "../models/state";
import debounce from "debounce";

export function useCameraState() {
  const [cameraState, setCameraState] = useState<CameraState>(
    stateSchema.parse(vscode.getState())?.camera || {
      position: { x: 0, y: 1.0, z: 0.7 },
    },
  );

  useEffect(
    debounce(() => {
      const state = stateSchema.parse(vscode.getState());
      vscode.setState({ camera: cameraState, ...state });
      console.log("debounced camera state");
    }, 500),
    [cameraState],
  );

  return { cameraState, setCameraState };
}
