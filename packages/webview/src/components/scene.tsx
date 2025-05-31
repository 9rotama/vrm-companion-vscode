import Model from "./model";
import { useFrame } from "@react-three/fiber";
import { CameraSettings } from "./settings";

export default function Scene({
  vrmUrl,
  vrmaUrl,
  issuesCount,
  cameraSettings,
}: {
  vrmUrl: string;
  vrmaUrl: string;
  issuesCount: number;
  cameraSettings: CameraSettings;
}) {
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
