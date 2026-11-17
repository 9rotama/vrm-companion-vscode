import { useEffect, useState } from "react";
import { vscode } from "./vscode";
import {
  Assets,
  describeValidationError,
  messageToWebviewSchema,
  validate,
} from "shared";

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
      const message = validate(messageToWebviewSchema, event.data);
      if (!message.ok) {
        console.error(
          "Invalid message received:",
          describeValidationError(message.error),
        );
        return;
      }

      const data = message.value;
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
        case "measureRender":
          // Not handled here: Model listens for it so the measurement starts next to the renderer.
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
