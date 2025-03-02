import { Canvas } from "@react-three/fiber";
import Scene from "./scene";

export default function VRMCompanionCanvas() {
  return (
    <Canvas>
      <Scene />
    </Canvas>
  );
}
