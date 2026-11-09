import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { getExpression } from "../utils/expression";
import {
  createVRMAnimationClip,
  VRMAnimationLoaderPlugin,
} from "@pixiv/three-vrm-animation";
import { AnimationMixer } from "three";
import { BlinkSettingsValues } from "../models/setting-values";

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
  const [vrm, setVrm] = useState<VRM | undefined>(undefined);
  const mixerRef = useRef<AnimationMixer | undefined>(undefined);
  const blinkConfig = useRef({ delay: 10, frequency: 3 });
  const expression = getExpression(issuesCount, blink);

  useEffect(
    function loadVrm() {
      let cancelled = false;
      let loadedVrm: VRM | undefined;
      (async () => {
        if (!vrmUrl || !vrmaUrl) return;

        const loader = new GLTFLoader();
        loader.register((parser) => {
          return new VRMLoaderPlugin(parser);
        });
        loader.register((parser) => {
          return new VRMAnimationLoaderPlugin(parser);
        });

        const animationPromise = loader
          .loadAsync(vrmaUrl)
          .catch((error: unknown) => {
            console.error("Failed to load animation", error);
            return undefined;
          });
        const vrmGltf = await loader.loadAsync(vrmUrl);
        const vrm = vrmGltf.userData.vrm as VRM;
        if (cancelled) {
          VRMUtils.deepDispose(vrm.scene);
          return;
        }
        loadedVrm = vrm;
        setVrm(vrm);

        const vrmaGltf = await animationPromise;
        if (cancelled || !vrmaGltf) return;
        const vrmAnimation = vrmaGltf.userData.vrmAnimations[0];

        // create animation clip
        const clip = createVRMAnimationClip(vrmAnimation, vrm);

        // play animation
        const mixer = new AnimationMixer(vrm.scene);
        mixerRef.current = mixer;
        mixerRef.current.clipAction(clip).play();
      })().catch((error: unknown) =>
        console.error("Failed to load VRM or animation", error),
      );
      return () => {
        cancelled = true;
        mixerRef.current?.stopAllAction();
        mixerRef.current = undefined;
        if (loadedVrm) VRMUtils.deepDispose(loadedVrm.scene);
        setVrm(undefined);
      };
    },
    [vrmUrl, vrmaUrl],
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
