import { useEffect, useState } from "react";
import { vscode } from "./vscode";
import { env } from "./env";
import { AssetsUri, messageToWebviewSchema } from "../models/message";

export function useVscodeMessages() {
  const [vrmUrl, setVrmUrl] = useState<string | undefined>(undefined);
  const [vrmaUrl, setVrmaUrl] = useState<string | undefined>(undefined);
  const [bgsUrl, setBgsUrl] = useState<AssetsUri["bg"] | undefined>(undefined);
  const [issuesCount, setIssuesCount] = useState<number>(0);

  useEffect(function setVrm() {
    if (env.VITE_DEV_VRM) {
      setVrmUrl(`_dev_/${env.VITE_DEV_VRM}`);
      setVrmaUrl("animation/idle.vrma");
    } else {
      vscode.postMessage({ command: "mounted" });
      window.addEventListener("message", (event) => {
        const message = messageToWebviewSchema.parse(event.data);
        switch (message.command) {
          case "updateVrm":
            setVrmUrl(message.body.dataUrl);
            break;
          case "loadAssetsUri":
            setVrmaUrl(message.body.vrma.idle);
            setBgsUrl(message.body.bg);
            break;
          case "updateIssuesCount":
            setIssuesCount(message.body.count);
            break;
        }
      });
    }
  }, []);

  return { vrmUrl, vrmaUrl, bgsUrl, issuesCount };
}
