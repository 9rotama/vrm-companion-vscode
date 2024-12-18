import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Model from "./model";

export default function VRMCompanionCanvas() {
  return (
    <Canvas>
      <ambientLight intensity={5} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
