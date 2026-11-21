import { useState } from "react";
import { vscode } from "./vscode";
import { loadStateOrDefault } from "./load-state";
import { BlinkState, CameraState, State } from "../models/state";
import { useDebouncedCallback } from "use-debounce";

const defaultCamera: CameraState = { height: 1.0, depth: 0.7 };
const defaultBlink: BlinkState = {
  happy: false,
  neutral: false,
  sad: false,
  angry: false,
};

function saveState(patch: NonNullable<State>) {
  vscode.setState({ ...loadStateOrDefault(), ...patch } satisfies State);
}

export function useSettings() {
  const [initial] = useState(loadStateOrDefault);
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
