import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Model from "./Model";

export default function VRMCompanionCanvas() {
  return (
    <Canvas>
      <ambientLight intensity={5} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
