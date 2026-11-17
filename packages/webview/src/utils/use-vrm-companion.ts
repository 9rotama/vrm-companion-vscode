import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { getExpression } from "../utils/expression";
import {
  createVRMAnimationClip,
  VRMAnimation,
  VRMAnimationLoaderPlugin,
} from "@pixiv/three-vrm-animation";
import { AnimationMixer } from "three";
import { BlinkSettingsValues } from "../models/setting-values";

import { err, fromPromise, ok } from "shared";
import { vscode } from "./vscode";
import { loadCompanion } from "./load-companion";
import { getVrmFromGltf } from "./get-vrm-from-gltf";
import {
  CompanionLoadError,
  describeCompanionLoadError,
} from "../models/companion-load-error";

export const avatarMetrics = { modelLoads: 0, frames: 0, maxDelta: 0 };

export function useVrmCompanion({
  issuesCount,
  blink,
  vrmUrl,
  vrmaUrl,
}: {
  issuesCount: number;
  blink: BlinkSettingsValues;
  vrmUrl: string;
  vrmaUrl: string;
}) {
  const key = `${vrmUrl}\n${vrmaUrl}`;
  const [loaded, setLoaded] = useState<{ key: string; vrm: VRM }>();
  const vrm = loaded?.key === key ? loaded.vrm : undefined;
  const mixerRef = useRef<AnimationMixer | undefined>(undefined);
  const blinkConfig = useRef({ delay: 10, frequency: 3 });
  const expression = getExpression(issuesCount, blink);

  useEffect(
    function loadVrm() {
      if (!vrmUrl || !vrmaUrl) return;
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));
      loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
      let mixer: AnimationMixer | undefined;
      const fetchGltf = (asset: "model" | "animation", url: string) =>
        fromPromise(loader.loadAsync(url), (cause): CompanionLoadError => ({
          type: "fetchFailed",
          asset,
          url,
          cause,
        }));
      const task = loadCompanion({
        loadModel: async () => {
          avatarMetrics.modelLoads++;
          const gltf = await fetchGltf("model", vrmUrl);
          if (!gltf.ok) return gltf;
          const vrm = getVrmFromGltf(gltf.value);
          return vrm.ok ? vrm : err({ ...vrm.error, url: vrmUrl });
        },
        loadAnimation: async () => {
          const gltf = await fetchGltf("animation", vrmaUrl);
          if (!gltf.ok) return gltf;
          const animation: VRMAnimation | undefined =
            gltf.value.userData.vrmAnimations?.[0];
          return animation
            ? ok(animation)
            : err({ type: "notVrmAnimation" as const, url: vrmaUrl });
        },
        showModel: (model) => setLoaded({ key, vrm: model }),
        animate: (model, animation) => {
          const clip = createVRMAnimationClip(animation, model);
          mixer = new AnimationMixer(model.scene);
          mixerRef.current = mixer;
          mixer.clipAction(clip).play();
        },
        disposeModel: (model) => {
          mixer?.stopAllAction();
          mixer?.uncacheRoot(model.scene);
          if (mixerRef.current === mixer) mixerRef.current = undefined;
          VRMUtils.deepDispose(model.scene);
        },
        reportError: (error) => {
          const message = describeCompanionLoadError(error);
          console.error("Failed to load VRM or animation", message, error);
          vscode.postMessage({ command: "loadError", body: { message } });
        },
      });
      return () => {
        task.cancel();
      };
    },
    [vrmUrl, vrmaUrl, key],
  );

  useEffect(function updateExpressionByIssues() {
    if (vrm?.expressionManager) {
      vrm.expressionManager.setValue("happy", expression.values.happy);
      vrm.expressionManager.setValue("angry", expression.values.angry);
      vrm.expressionManager.setValue("sad", expression.values.sad);
    }
  });

  useFrame(function updateAvatarTime(_, delta) {
    const step = Math.min(delta, 0.05);
    avatarMetrics.frames++;
    avatarMetrics.maxDelta = Math.max(avatarMetrics.maxDelta, step);
    if (mixerRef.current) mixerRef.current.update(step);
    if (vrm) vrm.update(step);
  });

  useFrame(function blink({ clock }) {
    if (!vrm?.expressionManager || !expression.doBlink) return;

    const t = clock.getElapsedTime();
    const blinkDelay = blinkConfig.current.delay;
    const blinkFrequency = blinkConfig.current.frequency;

    if (Math.round(t * blinkFrequency) % blinkDelay === 0) {
      vrm.expressionManager.setValue(
        "blink",
        1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI)),
      );
    }
  });

  return { vrm };
}
