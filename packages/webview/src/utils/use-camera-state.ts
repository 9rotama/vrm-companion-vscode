import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { vscode } from "./vscode";

export function useCameraState() {
  const { camera } = useThree();

  useEffect(() => {
    vscode.postMessage({ command: "ready_for_camera_state" });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "load_camera_state") {
        const cameraState = JSON.parse(message.state);
        camera.matrix.fromArray(cameraState);
        camera.matrix.decompose(
          camera.position,
          camera.quaternion,
          camera.scale
        );
      }
    });
  }, []);

  useEffect(function updateCameraState() {
    const interval = setInterval(() => {
      const cameraState = JSON.stringify(camera.matrix.toArray());
      vscode.postMessage({
        command: "save_camera_state",
        state: cameraState,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
}
