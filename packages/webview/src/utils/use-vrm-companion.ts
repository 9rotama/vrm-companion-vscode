import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { vscode } from "../utils/vscode";
import { getExpression } from "../utils/expression";
import { env } from "../utils/env";

export function useVrmCompanion() {
  const [vrmUrl, setVrmUrl] = useState<string | null>(null);
  const [vrmGltf, setVrmGltf] = useState<GLTF>();
  const [issuesCount, setIssuesCount] = useState<number>(0);
  const blinkConfig = useRef({ delay: 10, frequency: 3 });
  const avatar = useRef<VRM>();

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

  useEffect(
    function loadVrm() {
      if (!vrmUrl) return;

      const loader = new GLTFLoader();

      loader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });

      loader.load(
        vrmUrl,
        (gltf) => {
          setVrmGltf(gltf);
          const vrm: VRM = gltf.userData.vrm;
          avatar.current = vrm;
        },
        (error) => {
          console.log("GLTFLoader.load", error);
        }
      );
    },
    [vrmUrl]
  );

  useEffect(function updateExpressionByIssues() {
    if (avatar.current?.expressionManager) {
      const expression = getExpression(issuesCount);
      avatar.current.expressionManager.setValue(
        "happy",
        expression.values.happy
      );
      avatar.current.expressionManager.setValue(
        "angry",
        expression.values.angry
      );
      avatar.current.expressionManager.setValue("sad", expression.values.sad);
    }
  });

  useFrame(function updateAvatarTime(_, delta) {
    if (!avatar.current) return;
    avatar.current.update(delta);
  });

  useFrame(function blink({ clock }, delta) {
    const expression = getExpression(issuesCount);
    if (!avatar.current?.expressionManager || !expression.doBlink) return;

    const t = clock.getElapsedTime();
    const blinkDelay = blinkConfig.current.delay;
    const blinkFrequency = blinkConfig.current.frequency;

    if (Math.round(t * blinkFrequency) % blinkDelay === 0) {
      avatar.current.expressionManager.setValue(
        "blink",
        1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI))
      );
    }
  });

  return { vrmGltf };
}
