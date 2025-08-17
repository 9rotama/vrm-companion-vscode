# vrm-companion-vscode README

## features

- make your favorite VRM avatar stand out in the explorer view!
- the avatar will change its expression according to the number of diagnostics in the file being edited.

## requirements

gpu capable of general 3d rendering

## extension settings

- `vrm-companion-vscode.vrmFilePath`: defines the local file path of the VRM avatar you wish to view.

## issues

- avatar motion is fixed internally, only one type of motion.

## release notes

### 0.2.0

- added a feature to set blinking for each expression
- fixed avatar not displaying when local storage read/write fails
- move the settings popover to the bottom of the viewport.

### 0.1.1

- notification when VRM file path setting is empty or invalid

### 0.1.0

initial release

- display of VRM avatar
- expression change by number of diagnostics
