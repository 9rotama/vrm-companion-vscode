import { useEffect, useState } from "react";
import { vscode } from "./vscode";
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

  useEffect(() => {
    const handleReceived = (event: MessageEvent) => {
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
    };

    vscode.postMessage({ command: "mounted" });
    window.addEventListener("message", handleReceived);

    return () => {
      window.removeEventListener("message", handleReceived);
    };
  }, []);

  return { vrmUrl, vrmaFiles, backgroundImageFiles, issuesCount };
}
