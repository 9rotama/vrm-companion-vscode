import { Canvas } from "@react-three/fiber";
import Scene from "./scene";
import { useSettings } from "../utils/use-camera-state";
import { CameraSettings, Settings } from "./settings";

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
    <>
      <Canvas
        camera={{
          rotation: [0, 0, 0],
        }}
      >
        <Scene cameraSettings={camera} />
      </Canvas>
      <div className="absolute top-1 right-1 text-white">
        <Settings values={{ camera }} onChange={handleChangeSettings} />
      </div>
    </>
  );
}
