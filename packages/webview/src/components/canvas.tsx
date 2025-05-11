import { Canvas } from "@react-three/fiber";
import Scene from "./scene";
import { useCameraState } from "../utils/use-camera-state";

export default function VRMCompanionCanvas() {
  const {
    cameraState: { position },
  } = useCameraState();
  return (
    <Canvas
      camera={{
        position: [position.x, position.y, position.z],
        rotation: [0, 0, 0],
      }}
    >
      <Scene />
    </Canvas>
  );
}
