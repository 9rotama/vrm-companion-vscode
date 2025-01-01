import { Float } from "@react-three/drei";
import { useVrmCompanion } from "../utils/use-vrm-companion";

type Props = {
  vrmUrl: string;
  issuesCount: number;
};

export default function Model({ vrmUrl, issuesCount }: Props) {
  const { vrm } = useVrmCompanion({ vrmUrl, issuesCount });

  return (
    <Float
      speed={1.5}
      rotation={[0, Math.PI, 0]}
      position={[0, -4, 2.3]}
      rotationIntensity={0.3}
      floatIntensity={0.5}
    >
      <mesh scale={[5, 5, 5]}>{vrm && <primitive object={vrm.scene} />}</mesh>
    </Float>
  );
}
