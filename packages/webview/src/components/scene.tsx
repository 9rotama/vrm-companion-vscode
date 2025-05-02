import Model from "./model";
import { OrbitControls } from "@react-three/drei";
import { useVscodeMessages } from "../utils/use-vscode-messages";

export default function Scene() {
  const { vrmUrl, vrmaUrl, issuesCount } = useVscodeMessages();

  return (
    <>
      {vrmUrl && vrmaUrl && (
        <>
          <ambientLight intensity={5} />
          <Model vrmUrl={vrmUrl} vrmaUrl={vrmaUrl} issuesCount={issuesCount} />
          <OrbitControls />
        </>
      )}
    </>
  );
}
