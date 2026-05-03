import { useEffect, useState } from "react";
import * as v from "valibot";
import { vscode } from "./vscode";
import { BlinkState, CameraState, stateSchema } from "../models/state";
import { useDebounce } from "use-debounce";

export function useSettings() {
  const [camera, setCamera] = useState<CameraState>({
    height: 1.0,
    depth: 0.7,
  });
  const [blink, setBlink] = useState<BlinkState>({
    happy: false,
    neutral: false,
    sad: false,
    angry: false,
  });
  const [debouncedCameraState] = useDebounce(camera, 500);

  useEffect(() => {
    const parsedState = v.safeParse(stateSchema, vscode.getState());
    if (parsedState.success) {
      const data = parsedState.output;
      if (data?.camera) setCamera(data.camera);
      if (data?.blink) setBlink(data.blink);
    } else {
      console.warn("Failed to parse state:", parsedState.issues);
    }
  }, []);

  useEffect(() => {
    const state = v.safeParse(stateSchema, vscode.getState());
    if (state.success) {
      vscode.setState({ ...state.output, camera });
    } else {
      console.warn("Failed to parse state for setting camera:", state.issues);
    }
  }, [debouncedCameraState]);

  return { camera, setCamera, blink, setBlink };
}
