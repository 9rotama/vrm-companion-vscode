import * as vscode from "vscode";

const configKeys = {
  vrmFilePath: "vrmFilePath",
};

function getWorkspaceConfig() {
  return vscode.workspace.getConfiguration("vrm-companion-vscode");
}

export function getConfigVrmFilePath(): string | undefined {
  return getWorkspaceConfig().get(configKeys.vrmFilePath);
}

export function setConfigVrmFilePath(value: string) {
  return getWorkspaceConfig().update(configKeys.vrmFilePath, value);
}
