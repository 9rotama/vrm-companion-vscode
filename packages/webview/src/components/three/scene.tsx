import Model from "./model";
import { useFrame } from "@react-three/fiber";
import { BlinkSettingsValues, CameraSettingsValues } from "../settings/values";

export default function Scene({
  vrmUrl,
  vrmaUrl,
  issuesCount,
  blinkSettings,
  cameraSettings,
}: {
  vrmUrl: string;
  vrmaUrl: string;
  issuesCount: number;
  blinkSettings: BlinkSettingsValues;
  cameraSettings: CameraSettingsValues;
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
          <Model
            vrmUrl={vrmUrl}
            vrmaUrl={vrmaUrl}
            blink={blinkSettings}
            issuesCount={issuesCount}
          />
        </>
      )}
    </>
  );
}
