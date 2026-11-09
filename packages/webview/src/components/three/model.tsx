import { BlinkSettingsValues } from "../../models/setting-values";
import { useVrmCompanion, avatarMetrics } from "../../utils/use-vrm-companion";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { vscode } from "../../utils/vscode";

type Props = {
  vrmUrl: string;
  vrmaUrl: string;
  blink: BlinkSettingsValues;
  issuesCount: number;
};

export default function Model({ vrmUrl, vrmaUrl, blink, issuesCount }: Props) {
  const { vrm } = useVrmCompanion({ vrmUrl, vrmaUrl, blink, issuesCount });
  const pending = useRef<{ start: number; reason: string } | undefined>({
    start: performance.now(),
    reason: "initial",
  });
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.command === "measureRender" &&
        typeof event.data.body?.id === "string"
      ) {
        pending.current = {
          start: performance.now(),
          reason: event.data.body.id,
        };
      }
    };
    const onVisibility = () => {
      if (!document.hidden)
        pending.current = { start: performance.now(), reason: "resume" };
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("message", onMessage);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("message", onMessage);
    };
  }, []);
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera);
    if (vrm && !document.hidden && pending.current) {
      const { start, reason } = pending.current;
      pending.current = undefined;
      vscode.postMessage({
        command: "rendered",
        body: {
          reason,
          modelUri: vrmUrl,
          documentId: performance.timeOrigin,
          elapsed: performance.now() - start,
          metrics: { ...avatarMetrics, ...gl.info.memory, issuesCount },
        },
      });
    }
  }, 1);

  return (
    <mesh rotation={[0, Math.PI, 0]}>
      {vrm && <primitive object={vrm.scene} />}
    </mesh>
  );
}
