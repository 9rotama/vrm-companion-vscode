import { useEffect, useState } from "react";
import { vscode } from "./vscode";
import { env } from "./env";
import { Assets, messageToWebviewSchema } from "../models/message";

export function useVscodeMessages() {
  const [vrmUrl, setVrmUrl] = useState<string | undefined>(undefined);
  const [vrmaFiles, setVrmaFiles] = useState<Assets["vrmaFiles"] | undefined>(
    undefined,
  );
  const [backgroundImageFiles, setBackgroundImageFiles] = useState<
    Assets["backgroundImageFiles"] | undefined
  >(undefined);
  const [issuesCount, setIssuesCount] = useState<number>(0);

  useEffect(function setVrm() {
    if (env.VITE_DEV_VRM) {
      setVrmUrl(`_dev_/${env.VITE_DEV_VRM}`);
      setVrmaFiles({ idle: "animation/idle.vrma" });
    } else {
      vscode.postMessage({ command: "mounted" });
      window.addEventListener("message", (event) => {
        const message = messageToWebviewSchema.safeParse(event.data);
        if (!message.success) {
          console.error("Invalid message received:", message.error);
          return;
        }

        const data = message.data;
        switch (data.command) {
          case "updateVrm":
            setVrmUrl(data.body.dataUrl);
            break;
          case "loadAssetsUri":
            setVrmaFiles(data.body.vrmaFiles);
            setBackgroundImageFiles(data.body.backgroundImageFiles);
            break;
          case "updateIssuesCount":
            setIssuesCount(data.body.count);
            break;
        }
      });
    }
  }, []);

  return { vrmUrl, vrmaFiles, backgroundImageFiles, issuesCount };
}
