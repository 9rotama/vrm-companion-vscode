import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { getExpression } from "../utils/expression";
import {
  createVRMAnimationClip,
  VRMAnimationLoaderPlugin,
} from "@pixiv/three-vrm-animation";
import { AnimationMixer } from "three";

export function useVrmCompanion({
  issuesCount,
  vrmUrl,
  vrmaUrl,
}: {
  issuesCount: number;
  vrmUrl: string;
  vrmaUrl: string;
}) {
  const [vrm, setVrm] = useState<VRM | undefined>(undefined);
  const mixerRef = useRef<AnimationMixer | undefined>(undefined);
  const blinkConfig = useRef({ delay: 10, frequency: 3 });
  const expression = getExpression(issuesCount);


  useEffect(
    function loadVrm() {
      (async () => {
        if (!vrmUrl || !vrmaUrl) return;

        const loader = new GLTFLoader();
        loader.register((parser) => {
          return new VRMLoaderPlugin(parser);
        });
        loader.register((parser) => {
          return new VRMAnimationLoaderPlugin(parser);
        });

        const vrmGltf = await loader.loadAsync(vrmUrl);
        const vrm = vrmGltf.userData.vrm as VRM;
        const vrmaGltf = await loader.loadAsync(vrmaUrl);
        const vrmAnimation = vrmaGltf.userData.vrmAnimations[0];

        // create animation clip
        const clip = createVRMAnimationClip(vrmAnimation, vrm);

        // play animation
        const mixer = new AnimationMixer(vrm.scene);
        mixerRef.current = mixer;
        mixerRef.current.clipAction(clip).play();

        // display vrm
        setVrm(vrm);
      })();
    },
    [vrmUrl]
  );

  useEffect(function updateExpressionByIssues() {
    if (vrm?.expressionManager) {
      const expression = getExpression(issuesCount);
      vrm.expressionManager.setValue("happy", expression.values.happy);
      vrm.expressionManager.setValue("angry", expression.values.angry);
      vrm.expressionManager.setValue("sad", expression.values.sad);
    }
  });

  useFrame(function updateAvatarTime(_, delta) {
    if (mixerRef.current) mixerRef.current.update(delta);
    if (vrm) vrm.update(delta);
  });

  useFrame(function blink({ clock }) {
    if (!vrm?.expressionManager || !expression.doBlink) return;

    const t = clock.getElapsedTime();
    const blinkDelay = blinkConfig.current.delay;
    const blinkFrequency = blinkConfig.current.frequency;

    if (Math.round(t * blinkFrequency) % blinkDelay === 0) {
      vrm.expressionManager.setValue(
        "blink",
        1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI))
      );
    }
  });

  return { vrm };
}
