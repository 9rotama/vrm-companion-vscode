import { Canvas } from "@react-three/fiber";
import Scene from "./scene";
import { useSettings } from "../utils/use-camera-state";
import { CameraSettings, Settings } from "./settings";
import { whiteDots } from "../assets/bg";
import { Backgrounds } from "./backgrounds/backgrounds";

export default function VRMCompanion() {
  const { camera, setCamera } = useSettings();

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
      style={{ background: `url("${whiteDots}")` }}
    >
      <Canvas
        camera={{
          rotation: [0, 0, 0],
        }}
      >
        <Scene cameraSettings={camera} />
      </Canvas>
      <div className="absolute top-1 right-1 text-white">
        <div className="flex flex-col gap-1">
          <Settings values={{ camera }} onChange={handleChangeSettings} />
          <Backgrounds />
        </div>
      </div>
    </div>
  );
}
