# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development

- `npm run compile` - Compile TypeScript and run linting checks
- `npm run watch` - Watch mode for both esbuild and TypeScript compilation
- `npm run package` - Build production version for VS Code publishing
- `npm run check-types` - TypeScript type checking without emitting files
- `npm run lint` - Run oxlint for code linting
- `npm run format` - Format code with Prettier

### Webview Development

- `npm run -F webview watch` - Watch mode for the webview package (React/Vite)
- `npm run -F webview dev` - Development server for webview
- `npm run -F webview build` - Build webview for production

### Testing

- `npm run test` - Run VS Code extension tests
- `npm run pretest` - Prepare tests (compile, lint, build)

## Architecture Overview

This is a VS Code extension that displays VRM avatars in the Explorer view with expression changes based on diagnostic counts.

### Core Structure

- **Extension Entry**: `src/extension.ts` - Main activation logic, sets up webview provider and diagnostic listeners
- **Webview Provider**: `src/webview-provider.ts` - Manages the webview lifecycle and messaging
- **React Webview**: `packages/webview/` - Separate React application for the 3D VRM display

### Key Components

- **VRM Integration**: Uses `@pixiv/three-vrm` for 3D avatar rendering with Three.js
- **Workspace Monorepo**: Uses npm workspaces with separate webview package
- **Real-time Updates**: Diagnostic changes trigger expression updates via VS Code API
- **Configuration**: `vrm-companion-vscode.vrmFilePath` setting for avatar file path

### Build System

- **Main Extension**: Uses esbuild via `esbuild.js` for bundling
- **Webview**: Uses Vite for React development and building
- **TypeScript**: Separate tsconfig files for extension and webview
- **Styling**: Tailwind CSS v4 for webview UI

### Development Workflow

1. Run `npm i` to install dependencies
2. Use `npm run -F webview watch` for webview development
3. Use `npm run watch` for extension development
4. Test with F5 in VS Code to launch Extension Development Host

### File Structure Notes

- Extension source in `src/`
- Webview React app in `packages/webview/`
- Built extension output in `dist/`
- VRM assets stored in `packages/webview/public/`

### UI Components

The webview uses a collection of base UI components located in `packages/webview/src/components/ui/`:

- **IconButton**: Clickable buttons with icon support for actions
- **Checkbox**: Form input component for boolean selections
- **Slider**: Range input component for numeric value adjustments
- **Separator**: Visual divider component for layout organization
- **ScrollArea**: Custom scrollable container with styled scrollbars

These components follow consistent design patterns and are built with Tailwind CSS for styling. They provide the foundation for the webview's user interface elements like settings panels and control interfaces.
