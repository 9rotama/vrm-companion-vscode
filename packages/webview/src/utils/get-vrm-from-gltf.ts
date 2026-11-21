import { VRM, VRMUtils } from "@pixiv/three-vrm";
import type { Group } from "three";
import { err, ok, Result } from "shared";

export function getVrmFromGltf(gltf: {
  scene: Group;
  userData: Record<string, unknown>;
}): Result<VRM, { type: "notVrm" }> {
  const vrm = gltf.userData.vrm as VRM | undefined;
  if (!vrm) {
    VRMUtils.deepDispose(gltf.scene);
    return err({ type: "notVrm" });
  }
  return ok(vrm);
}
