import { Canvas } from "@react-three/fiber";
import Scene from "./three/scene";
import { useSettings } from "../utils/use-settings";
import { BackgroundsPopover } from "./backgrounds/backgrounds-popover";
import { useVscodeMessages } from "../utils/use-vscode-messages";
import { useBackgrounds } from "../utils/use-backgrounds";
import { SettingsValues } from "./settings/values";
import { SettingsPopover } from "./settings/settings-popover";

export default function VRMCompanion() {
  const { vrmUrl, vrmaUrl, issuesCount, bgsUrl } = useVscodeMessages();
  const { camera, setCamera, blink, setBlink } = useSettings();
  const { currBgIdx, setCurrBgIdx, saveBackground, bgs } =
    useBackgrounds(bgsUrl);

  function handleChangeSettings(next: SettingsValues) {
    setCamera((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        y: next.camera.position.y,
        z: next.camera.position.z,
      },
    }));
    setBlink({
      happy: next.blink.happy,
      neutral: next.blink.neutral,
      sad: next.blink.sad,
      angry: next.blink.angry,
    });
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
            blinkSettings={blink}
            issuesCount={issuesCount}
          />
        )}
      </Canvas>
      <div className="absolute top-1 right-1 text-white">
        <div className="flex flex-col gap-1">
          <SettingsPopover
            values={{ camera, blink }}
            onChange={handleChangeSettings}
          />
          <BackgroundsPopover
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
