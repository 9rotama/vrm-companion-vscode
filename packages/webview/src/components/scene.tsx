import { Suspense } from "react";
import Model from "./model";
import { OrbitControls } from "@react-three/drei";

export default function Scene() {
  return (
    <>
      <ambientLight intensity={5} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls />
    </>
  );
}
