import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { vscode } from "../utilities/vscode";

export default function Model() {
  const { scene, camera } = useThree();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [gltf, setGltf] = useState<GLTF>();
  const avatar = useRef<VRM>();

  useEffect(() => {
    vscode.postMessage({ command: "readyForReceiveVrmFileData" });
    window.addEventListener("message", (event) => {
      const message = event.data; // The JSON data our extension sent
      switch (message.command) {
        case "setState":
          setDataUrl(message.state.vrmFileDataUrl);
          break;
      }
    });
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
    <mesh rotation={[0, Math.PI, 0]} scale={[5, 5, 5]} position={[0, -3, 0]}>
      {gltf && <primitive object={gltf.scene} />}
    </mesh>
  );
}
