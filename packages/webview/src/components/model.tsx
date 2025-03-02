import { useVrmCompanion } from "../utils/use-vrm-companion";

type Props = {
  vrmUrl: string;
  vrmaUrl: string;
  issuesCount: number;
};

export default function Model({ vrmUrl, vrmaUrl, issuesCount }: Props) {
  const { vrm } = useVrmCompanion({ vrmUrl, vrmaUrl, issuesCount });

  return (
    <mesh rotation={[0, Math.PI, 0]} position={[0, -4, 2.3]} scale={[5, 5, 5]}>
      {vrm && <primitive object={vrm.scene} />}
    </mesh>
  );
}
