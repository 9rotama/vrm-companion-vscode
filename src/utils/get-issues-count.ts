import * as vscode from "vscode";

export function getIssuesCount() {
  const diags = vscode.languages.getDiagnostics();

  let issues = 0;
  for (const diag of diags) {
    const collection = diag[1];
    for (const c of collection) {
      if (c.severity === 0 || c.severity === 1) {
        issues++;
      }
    }
  }

  return issues;
}
