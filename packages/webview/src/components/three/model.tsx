import { useVrmCompanion } from "../../utils/use-vrm-companion";
import { BlinkSettingsValues } from "../settings/values";

type Props = {
  vrmUrl: string;
  vrmaUrl: string;
  blink: BlinkSettingsValues;
  issuesCount: number;
};

export default function Model({ vrmUrl, vrmaUrl, blink, issuesCount }: Props) {
  const { vrm } = useVrmCompanion({ vrmUrl, vrmaUrl, blink, issuesCount });

  return (
    <mesh rotation={[0, Math.PI, 0]}>
      {vrm && <primitive object={vrm.scene} />}
    </mesh>
  );
}
