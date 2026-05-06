import { useState } from "react";
import * as v from "valibot";
import { vscode } from "./vscode";
import { BlinkState, CameraState, State, stateSchema } from "../models/state";
import { useDebouncedCallback } from "use-debounce";

const defaultCamera: CameraState = { height: 1.0, depth: 0.7 };
const defaultBlink: BlinkState = {
  happy: false,
  neutral: false,
  sad: false,
  angry: false,
};

function loadState(): NonNullable<State> {
  const parsed = v.safeParse(stateSchema, vscode.getState());
  if (!parsed.success) {
    console.warn("Failed to parse state:", parsed.issues);
    return {};
  }
  return parsed.output ?? {};
}

function saveState(patch: NonNullable<State>) {
  vscode.setState({ ...loadState(), ...patch } satisfies State);
}

export function useSettings() {
  const [initial] = useState(loadState);
  const [camera, setCameraState] = useState<CameraState>(
    initial.camera ?? defaultCamera,
  );
  const [blink, setBlinkState] = useState<BlinkState>(
    initial.blink ?? defaultBlink,
  );

  const saveCameraDebounced = useDebouncedCallback((next: CameraState) => {
    saveState({ camera: next });
  }, 500);

  function setCamera(next: CameraState) {
    setCameraState(next);
    saveCameraDebounced(next);
  }

  function setBlink(next: BlinkState) {
    setBlinkState(next);
    saveState({ blink: next });
  }

  return { camera, setCamera, blink, setBlink };
}
