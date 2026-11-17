import type { WebviewApi } from "vscode-webview";
import {
  describeValidationError,
  err,
  MessageToVscode,
  messageToVscodeSchema,
  ok,
  Result,
  validate,
} from "shared";

export type StorageError = { type: "corruptedStorage"; cause: unknown };

class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;

  constructor() {
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  public postMessage(message: MessageToVscode) {
    if (this.vsCodeApi) {
      const msg = validate(messageToVscodeSchema, message);
      if (!msg.ok) {
        console.error(
          "Invalid message format:",
          describeValidationError(msg.error),
        );
        return;
      }
      this.vsCodeApi.postMessage(msg.value);
    }
  }

  public getState(): Result<unknown, StorageError> {
    if (this.vsCodeApi) {
      return ok(this.vsCodeApi.getState());
    } else {
      const state = localStorage.getItem("vscodeState");
      if (!state) return ok(undefined);
      try {
        return ok(JSON.parse(state));
      } catch (cause) {
        return err({ type: "corruptedStorage", cause });
      }
    }
  }

  public setState<T extends unknown | undefined>(newState: T): T {
    if (this.vsCodeApi) {
      return this.vsCodeApi.setState(newState);
    } else {
      localStorage.setItem("vscodeState", JSON.stringify(newState));
      return newState;
    }
  }
}

export const vscode = new VSCodeAPIWrapper();
