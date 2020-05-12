/// <reference types="dom-mediacapture-record" />
import { ReactElement } from 'react';
declare type ReactMediaRecorderRenderProps = {
    error: string;
    muteAudio: () => void;
    unMuteAudio: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    mediaBlobUrl: null | string;
    mediaBlob: Blob | null;
    status: StatusMessages;
    isAudioMuted: boolean;
    previewStream: MediaStream | null;
};
declare type ReactMediaRecorderProps = {
    render: (props: ReactMediaRecorderRenderProps) => ReactElement;
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
    screen?: boolean;
    onStop?: (blobUrl: string) => void;
    blobPropertyBag?: BlobPropertyBag;
    mediaRecorderOptions?: MediaRecorderOptions | null;
};
declare type StatusMessages = 'idle' | 'acquiring_media' | 'recording' | 'stopping' | 'stopped';
export declare const ReactMediaRecorder: ({ render, audio, video, onStop, blobPropertyBag, screen, mediaRecorderOptions, }: ReactMediaRecorderProps) => ReactElement<any, string | ((props: any) => ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>;
export {};
