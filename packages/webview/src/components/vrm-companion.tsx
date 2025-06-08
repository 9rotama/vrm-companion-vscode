import { Canvas } from "@react-three/fiber";
import Scene from "./scene";
import { useSettings } from "../utils/use-settings";
import { CameraSettings, Settings } from "./settings";
import { Backgrounds } from "./backgrounds/backgrounds";
import { useVscodeMessages } from "../utils/use-vscode-messages";
import { useBackgrounds } from "../utils/use-backgrounds";

export default function VRMCompanion() {
  const { vrmUrl, vrmaUrl, issuesCount, bgsUrl } = useVscodeMessages();
  const { camera, setCamera } = useSettings();
  const { currBgIdx, setCurrBgIdx, saveBackground, bgs } =
    useBackgrounds(bgsUrl);

  function handleChangeSettings(next: { camera: CameraSettings }) {
    setCamera((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        y: next.camera.position.y,
        z: next.camera.position.z,
      },
    }));
  }

  return (
    <div
      className="w-screen h-screen relative"
      style={{
        background: bgs[currBgIdx]?.bg
          ? `url("${bgs[currBgIdx].bg}")`
          : "transparent",
      }}
    >
      <Canvas
        camera={{
          rotation: [0, 0, 0],
        }}
      >
        {vrmUrl && vrmaUrl && (
          <Scene
            cameraSettings={camera}
            vrmUrl={vrmUrl}
            vrmaUrl={vrmaUrl}
            issuesCount={issuesCount}
          />
        )}
      </Canvas>
      <div className="absolute top-1 right-1 text-white">
        <div className="flex flex-col gap-1">
          <Settings values={{ camera }} onChange={handleChangeSettings} />
          <Backgrounds
            bgs={bgs}
            currIdx={currBgIdx}
            onChange={(next) => {
              setCurrBgIdx(next);
              saveBackground(next);
            }}
          />
        </div>
      </div>
    </div>
  );
}
