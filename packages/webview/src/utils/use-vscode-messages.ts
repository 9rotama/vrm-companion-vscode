import { useEffect, useState } from "react";
import * as v from "valibot";
import { vscode } from "./vscode";
import { Assets, messageToWebviewSchema } from "shared";

export function useVscodeMessages() {
  const [visible, setVisible] = useState(true);
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
      const message = v.safeParse(messageToWebviewSchema, event.data);
      if (!message.success) {
        console.error("Invalid message received:", message.issues);
        return;
      }

      const data = message.output;
      switch (data.command) {
        case "visibility":
          setVisible(data.body.visible);
          break;
        case "updateVrm":
          setVrmUrl(data.body.uri);
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

    window.addEventListener("message", handleReceived);
    vscode.postMessage({ command: "mounted" });

    return () => {
      window.removeEventListener("message", handleReceived);
    };
  }, []);

  return { visible, vrmUrl, vrmaFiles, backgroundImageFiles, issuesCount };
}
