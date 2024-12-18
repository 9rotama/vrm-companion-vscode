import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { vscode } from "../utilities/vscode";
import { Float } from "@react-three/drei";

export default function Model() {
  const { scene, camera } = useThree();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
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
          case "setState":
            setDataUrl(message.state.vrmFileDataUrl);
            break;
        }
      });
    }
  }, []);

  useEffect(() => {
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
  }, [dataUrl]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    if (avatar.current?.expressionManager) {
      avatar.current.update(delta);
      const blinkDelay = 10;
      const blinkFrequency = 3;
      if (Math.round(t * blinkFrequency) % blinkDelay === 0) {
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
