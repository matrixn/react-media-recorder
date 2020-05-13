/// <reference types="dom-mediacapture-record" />
declare type ReactMediaRecorderHook = {
    error: string;
    muteAudio: () => void;
    unMuteAudio: () => void;
    startRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => void;
    mediaBlobUrl?: string;
    mediaBlob?: Blob;
    status: StatusMessages;
    isAudioMuted: boolean;
    previewStream: MediaStream | null;
};
declare type ReactMediaRecorderProps = {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
    screen?: boolean;
    onStop?: (blobUrl: string) => void;
    blobPropertyBag?: BlobPropertyBag;
    mediaRecorderOptions?: MediaRecorderOptions | null;
};
declare type StatusMessages = "media_aborted" | "permission_denied" | "no_specified_media_found" | "media_in_use" | "invalid_media_constraints" | "no_constraints" | "recorder_error" | "idle" | "acquiring_media" | "delayed_start" | "recording" | "stopping" | "stopped";
export declare const useReactMediaRecorder: ({ audio, video, onStop, blobPropertyBag, screen, mediaRecorderOptions }: ReactMediaRecorderProps) => ReactMediaRecorderHook;
export {};
