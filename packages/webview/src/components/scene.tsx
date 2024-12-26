import { Suspense } from "react";
import Model from "./model";
import { OrbitControls } from "@react-three/drei";
import { useCameraState } from "../utils/use-camera-state";

export default function Scene() {
  useCameraState();

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
