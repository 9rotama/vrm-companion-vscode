import { Canvas } from "@react-three/fiber";
import Scene from "./three/scene";
import { useSettings } from "../utils/use-settings";
import { BackgroundsDialog } from "./backgrounds/backgrounds-dialog";
import { useVscodeMessages } from "../utils/use-vscode-messages";
import { useBackgrounds } from "../utils/use-backgrounds";
import { SettingsValues } from "../models/setting-values";
import { SettingsDialog } from "./settings/settings-dialog";

export default function VRMCompanionApp() {
  const { vrmUrl, vrmaFiles, issuesCount, backgroundImageFiles } =
    useVscodeMessages();
  const { camera, setCamera, blink, setBlink } = useSettings();
  const { backgrounds, currentBackgroundId, setBackground } = useBackgrounds(
    backgroundImageFiles?.map((file) => ({
      type: "image" as const,
      id: file.id,
      imageUri: file.imageUri,
      previewUri: file.previewUri,
    })),
  );

  const currentBackground = backgrounds.find(
    (bg) => bg.id === currentBackgroundId,
  );

  function handleChangeSettings(next: SettingsValues) {
    setCamera(next.camera);
    setBlink(next.blink);
  }

  return (
    <div
      className={"relative h-screen w-screen"}
      style={
        currentBackground && {
          background:
            currentBackground.type === "image"
              ? `url("${currentBackground.imageUri}")`
              : "transparent",
        }
      }
    >
      <Canvas
        camera={{
          rotation: [0, 0, 0],
        }}
      >
        {vrmUrl && vrmaFiles && (
          <Scene
            cameraSettings={camera}
            vrmUrl={vrmUrl}
            vrmaUrl={vrmaFiles.idle}
            blinkSettings={blink}
            issuesCount={issuesCount}
          />
        )}
      </Canvas>
      <div className="absolute top-1 right-1">
        <div className="flex flex-col gap-1">
          <SettingsDialog
            values={{ camera, blink }}
            onChange={handleChangeSettings}
          />
          <BackgroundsDialog
            backgrounds={backgrounds}
            currentBackgroundId={currentBackgroundId}
            onChange={setBackground}
          />
        </div>
      </div>
    </div>
  );
}
