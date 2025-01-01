import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { vscode } from "./vscode";
import { env } from "./env";

export function useVscodeMessages() {
  const { camera } = useThree();
  const [vrmUrl, setVrmUrl] = useState<string | undefined>(undefined);
  const [issuesCount, setIssuesCount] = useState<number>(0);

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

  useEffect(function setVrm() {
    if (env.VITE_DEV_VRM) {
      setVrmUrl(env.VITE_DEV_VRM);
    } else {
      vscode.postMessage({ command: "ready_for_receives" });
      window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
          case "set_vrm":
            setVrmUrl(message.state.vrmFileDataUrl);
            break;
          case "issues_count":
            setIssuesCount(message.state.issuesCount);
        }
      });
    }
  }, []);

  return { vrmUrl, issuesCount };
}
