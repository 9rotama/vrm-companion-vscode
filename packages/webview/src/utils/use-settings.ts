import { useEffect, useState } from "react";
import { vscode } from "./vscode";
import { BlinkState, CameraState, stateSchema } from "../models/state";
import { useDebounce } from "use-debounce";

export function useSettings() {
  const [camera, setCamera] = useState<CameraState>({
    position: { y: 1.0, z: 0.7 },
  });
  const [blink, setBlink] = useState<BlinkState>({
    happy: false,
    neutral: false,
    sad: false,
    angry: false,
  });
  const [debouncedCameraState] = useDebounce(camera, 500);

  useEffect(() => {
    const parsedState = stateSchema.safeParse(vscode.getState());
    if (parsedState.success) {
      const data = parsedState.data;
      if (data?.camera) setCamera(data.camera);
      if (data?.blink) setBlink(data.blink);
    } else {
      console.warn("Failed to parse state:", parsedState.error);
    }
  }, []);

  useEffect(() => {
    const state = stateSchema.safeParse(vscode.getState());
    if (state.success) {
      vscode.setState({ ...state.data, camera });
    } else {
      console.warn("Failed to parse state for setting camera:", state.error);
    }
  }, [debouncedCameraState]);

  return { camera, setCamera, blink, setBlink };
}
