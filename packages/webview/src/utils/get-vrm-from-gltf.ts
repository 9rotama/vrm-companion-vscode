import { VRM, VRMUtils } from "@pixiv/three-vrm";
import type { Group } from "three";

export function getVrmFromGltf(gltf: {
  scene: Group;
  userData: Record<string, unknown>;
}): VRM {
  const vrm = gltf.userData.vrm as VRM | undefined;
  if (!vrm) {
    VRMUtils.deepDispose(gltf.scene);
    throw new Error("The selected file does not contain a VRM model");
  }
  return vrm;
}
