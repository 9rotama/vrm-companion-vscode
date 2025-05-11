import { useVrmCompanion } from "../utils/use-vrm-companion";

type Props = {
  vrmUrl: string;
  vrmaUrl: string;
  issuesCount: number;
};

export default function Model({ vrmUrl, vrmaUrl, issuesCount }: Props) {
  const { vrm } = useVrmCompanion({ vrmUrl, vrmaUrl, issuesCount });

  return (
    <mesh rotation={[0, Math.PI, 0]}>
      {vrm && <primitive object={vrm.scene} />}
    </mesh>
  );
}
