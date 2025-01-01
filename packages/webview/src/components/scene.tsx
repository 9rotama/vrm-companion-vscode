import { Suspense } from "react";
import Model from "./model";
import { OrbitControls } from "@react-three/drei";
import { useVscodeMessages } from "../utils/use-camera-state";

export default function Scene() {
  const { vrmUrl, issuesCount } = useVscodeMessages();

  return (
    <>
      <ambientLight intensity={5} />
      {vrmUrl && (
        <Suspense fallback={null}>
          <Model vrmUrl={vrmUrl} issuesCount={issuesCount} />
        </Suspense>
      )}
      <OrbitControls />
    </>
  );
}
