import Model from "./model";
import { useVscodeMessages } from "../utils/use-vscode-messages";
import { useFrame } from "@react-three/fiber";
import { CameraSettings } from "./settings";

export default function Scene({
  cameraSettings,
}: {
  cameraSettings: CameraSettings;
}) {
  const { vrmUrl, vrmaUrl, issuesCount } = useVscodeMessages();

  useFrame(({ camera }) => {
    camera.position.set(
      0,
      cameraSettings.position.y,
      cameraSettings.position.z,
    );
  });

  return (
    <>
      {vrmUrl && vrmaUrl && (
        <>
          <ambientLight intensity={1} />
          <directionalLight intensity={3} />
          <Model vrmUrl={vrmUrl} vrmaUrl={vrmaUrl} issuesCount={issuesCount} />
        </>
      )}
    </>
  );
}
