import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { vscode } from "../utilities/vscode";
import { Float } from "@react-three/drei";

function getExpression(issuesCount: number): {
  happy: number;
  angry: number;
  sad: number;
} {
  if (issuesCount < 2) {
    return { happy: 1.0, angry: 0, sad: 0 };
  } else if (issuesCount < 4) {
    return { happy: 0, angry: 0, sad: 0 };
  } else if (issuesCount < 8) {
    return { happy: 0, angry: 1.0, sad: 0 };
  } else {
    return { happy: 0, angry: 0, sad: 1.0 };
  }
}

export default function Model() {
  const { scene, camera } = useThree();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [issuesCount, setIssuesCount] = useState<number>(0);
  const [gltf, setGltf] = useState<GLTF>();
  const avatar = useRef<VRM>();

  useEffect(() => {
    const vrmFilePathForDev = import.meta.env.VITE_DEV_VRM;
    if (vrmFilePathForDev) {
      setDataUrl(vrmFilePathForDev);
    } else {
      vscode.postMessage({ command: "ready_for_receives" });
      window.addEventListener("message", (event) => {
        const message = event.data; // The JSON data our extension sent
        switch (message.command) {
          case "set_vrm":
            setDataUrl(message.state.vrmFileDataUrl);
            break;
          case "issues_count":
            setIssuesCount(message.state.issuesCount);
        }
      });
    }
  }, []);

  useEffect(
    function loadVrm() {
      if (gltf || !dataUrl) {
        return;
      }

      const loader = new GLTFLoader();

      loader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });

      loader.load(
        dataUrl,
        (gltf) => {
          setGltf(gltf);
          const vrm: VRM = gltf.userData.vrm;
          avatar.current = vrm;
          if (vrm.lookAt) {
            vrm.lookAt.target = camera;
          }
        },
        (xhr) => {
          const progress = (xhr.loaded / xhr.total) * 100;
          console.log(progress + "% loaded");
        },
        (error) => {
          console.log("An error happened");
          console.log(error);
        }
      );
    },
    [dataUrl]
  );

  useEffect(function updateExpressionByIssues() {
    if (avatar.current?.expressionManager) {
      const expression = getExpression(issuesCount);
      avatar.current.expressionManager.setValue("happy", expression.happy);
      avatar.current.expressionManager.setValue("angry", expression.angry);
      avatar.current.expressionManager.setValue("sad", expression.sad);
    }
  });

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    if (avatar.current?.expressionManager) {
      avatar.current.update(delta);
      const blinkDelay = 10;
      const blinkFrequency = 3;
      if (
        Math.round(t * blinkFrequency) % blinkDelay === 0 &&
        issuesCount !== 0
      ) {
        avatar.current.expressionManager.setValue(
          "blink",
          1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI))
        );
      }
    }
  });

  return (
    <Float
      speed={1.5}
      rotation={[0, Math.PI, 0]}
      position={[0, -4, 2.3]}
      rotationIntensity={0.3}
      floatIntensity={0.5}
    >
      <mesh scale={[5, 5, 5]}>{gltf && <primitive object={gltf.scene} />}</mesh>
    </Float>
  );
}
