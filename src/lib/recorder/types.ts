// Mirrors files-sdk's SignedUpload shape locally so client code doesn't
// import from a package that pulls in the AWS SDK.
export type SignedUpload =
  | { method: "PUT"; url: string; headers?: Record<string, string> }
  | { method: "POST"; url: string; fields: Record<string, string> };

export type TrackKind = "SCREEN" | "CAMERA" | "MIC";

export type RecorderPhase =
  | "idle"
  | "requesting-devices"
  | "countdown"
  | "recording"
  | "stopping"
  | "stopped"
  | "error";
