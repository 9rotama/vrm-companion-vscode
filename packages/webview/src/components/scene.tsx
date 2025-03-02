import { Suspense } from "react";
import Model from "./model";
import { OrbitControls } from "@react-three/drei";
import { useVscodeMessages } from "../utils/use-vscode-messages";

export default function Scene() {
  const { vrmUrl, vrmaUrl, issuesCount } = useVscodeMessages();

  return (
    <>
      <ambientLight intensity={5} />
      {vrmUrl && vrmaUrl && (
        <Suspense fallback={null}>
          <Model vrmUrl={vrmUrl} vrmaUrl={vrmaUrl} issuesCount={issuesCount} />
        </Suspense>
      )}
      <OrbitControls />
    </>
  );
}
