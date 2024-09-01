import { useGLTF } from "@react-three/drei";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { GLTF, GLTFLoader, GLTFLoaderPlugin } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";

export default function Model() {
  const { scene, camera } = useThree();

  const [gltf, setGltf] = useState<GLTF>();
  const [progress, setProgress] = useState<number>(0);
  const avatar = useRef<VRM>();

  useEffect(() => {
    if (gltf) return;

    const loader = new GLTFLoader();

    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });

    loader.load(
      "/test_models/VRM_NekoUmiushi.vrm",
      (gltf) => {
        setGltf(gltf);
        const vrm: VRM = gltf.userData.vrm;
        avatar.current = vrm;
        if (vrm.lookAt) vrm.lookAt.target = camera;
      },
      (xhr) => {
        setProgress((xhr.loaded / xhr.total) * 100);
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log("An error happened");
        console.log(error);
      }
    );
  });

  return (
    <mesh rotation={[0, Math.PI, 0]} scale={[5, 5, 5]} position={[0, -3, 0]}>
      {gltf && <primitive object={gltf.scene} />}
    </mesh>
  );
}
