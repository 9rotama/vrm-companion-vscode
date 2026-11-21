import * as vscode from "vscode";
import type { VrmPathError } from "./get-local-vrm-path";

export function notifyVrmFilePathNotSet() {
  const action = "open settings";
  vscode.window
    .showInformationMessage(
      "VRM file path is not set. please set it in the extension settings.",
      action,
    )
    .then((selection) => {
      if (selection === action) {
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "vrm-companion-vscode.vrmFilePath",
        );
      }
    });
}

export function notifyVrmFilePathNotFound() {
  vscode.window.showErrorMessage(
    "VRM file path is not found. please set a valid VRM file path in the extension settings.",
  );
}

export function notifyVrmPathError(error: VrmPathError) {
  switch (error.type) {
    case "notSet":
      notifyVrmFilePathNotSet();
      return;
    case "notAbsolute":
    case "notFound":
    case "notAFile":
      console.warn("[VRM path]", error);
      notifyVrmFilePathNotFound();
      return;
  }
}
