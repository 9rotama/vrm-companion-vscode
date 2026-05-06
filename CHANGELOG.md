# Changelog

All notable changes to the "vrm-companion-vscode" extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2026-05-06

### Fixed

- Background selection and blink settings not being persisted across reloads

### Changed

- Migrate schema validation library from zod to valibot
  (bundle: webview −56 kB raw / −13 kB gzip, extension −55 kB raw)

## [0.2.0] - 2025-08-18

### Added

- Per-expression blink setting (happy / neutral / sad / angry)

### Fixed

- Avatar not displaying when local storage read/write fails

### Changed

- Settings popover moved to the bottom of the viewport

## [0.1.1] - 2025-06-13

### Added

- Notification when the VRM file path setting is empty or invalid

## [0.1.0] - 2025-06-06

Initial release.

### Added

- Display of VRM avatar in the Explorer view
- Expression change driven by the number of diagnostics in the active file
