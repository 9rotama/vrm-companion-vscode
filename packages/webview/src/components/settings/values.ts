export type CameraSettingsValues = {
  position: { y: number; z: number };
};

export type BlinkSettingsValues = {
  happy: boolean;
  neutral: boolean;
  sad: boolean;
  angry: boolean;
};

export type SettingsValues = {
  camera: CameraSettingsValues;
  blink: BlinkSettingsValues;
};
