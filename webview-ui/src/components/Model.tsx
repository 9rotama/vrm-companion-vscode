import { useGLTF } from "@react-three/drei";

export default function Model() {
  const gltf = useGLTF("/test_models/VRM_NekoUmiushi.vrm");

  return (
    <mesh rotation={[0, Math.PI, 0]} scale={[5, 5, 5]} position={[0, -3, 0]}>
      <primitive object={gltf.scene} />
    </mesh>
  );
}
