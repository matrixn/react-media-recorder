import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

type ReactMediaRecorderRenderProps = {
  error: string
  muteAudio: () => void
  unMuteAudio: () => void
  startRecording: () => void
  stopRecording: () => void
  mediaBlobUrl: null | string
  mediaBlob: Blob | null
  status: StatusMessages
  isAudioMuted: boolean
  previewStream: MediaStream | null
}

type ReactMediaRecorderProps = {
  render: (props: ReactMediaRecorderRenderProps) => ReactElement
  audio?: boolean | MediaTrackConstraints
  video?: boolean | MediaTrackConstraints
  screen?: boolean
  onStop?: (blobUrl: string) => void
  blobPropertyBag?: BlobPropertyBag
  mediaRecorderOptions?: MediaRecorderOptions | null
}

type StatusMessages = 'idle' | 'acquiring_media' | 'recording' | 'stopping' | 'stopped'

enum RecorderErrors {
  AbortError = 'media_aborted',
  NotAllowedError = 'permission_denied',
  NotFoundError = 'no_specified_media_found',
  NotReadableError = 'media_in_use',
  OverconstrainedError = 'invalid_media_constraints',
  TypeError = 'no_constraints',
  NONE = '',
  NO_RECORDER = 'recorder_error',
}

export const ReactMediaRecorder = ({
  render,
  audio = true,
  video = false,
  onStop = () => null,
  blobPropertyBag,
  screen = false,
  mediaRecorderOptions = null,
}: ReactMediaRecorderProps) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const mediaChunks = useRef<Blob[]>([])
  const mediaStream = useRef<MediaStream | null>(null)
  const previewStream = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<StatusMessages>('idle')
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false)
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null)
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<keyof typeof RecorderErrors>('NONE')

  const getMediaStream = useCallback(async () => {
    setStatus('acquiring_media')
    const requiredMedia: MediaStreamConstraints = {
      audio: typeof audio === 'boolean' ? !!audio : audio,
      video: typeof video === 'boolean' ? !!video : video,
    }
    try {
      if (screen) {
        //@ts-ignore
        const stream = (await window.navigator.mediaDevices.getDisplayMedia({
          video: video || true,
        })) as MediaStream
        if (audio) {
          const audioStream = await window.navigator.mediaDevices.getUserMedia({
            audio,
          })

          audioStream.getAudioTracks().forEach((audioTrack) => stream.addTrack(audioTrack))
        }
        mediaStream.current = stream
      } else {
        const stream = await window.navigator.mediaDevices.getUserMedia(requiredMedia)
        mediaStream.current = stream
        previewStream.current = new MediaStream(stream.getVideoTracks())
      }
      setStatus('idle')
    } catch (error) {
      setError(error.name)
      setStatus('idle')
    }
  }, [audio, video, screen])

  useEffect(() => {
    if (!window.MediaRecorder) {
      throw new Error('Unsupported Browser')
    }

    if (screen) {
      //@ts-ignore
      if (!window.navigator.mediaDevices.getDisplayMedia) {
        throw new Error("This browser doesn't support screen capturing")
      }
    }

    const checkConstraints = (mediaType: MediaTrackConstraints) => {
      const supportedMediaConstraints = navigator.mediaDevices.getSupportedConstraints()
      const unSupportedConstraints = Object.keys(mediaType).filter(
        (constraint) => !(supportedMediaConstraints as { [key: string]: any })[constraint]
      )

      if (unSupportedConstraints.length > 0) {
        console.error(
          `The constraints ${unSupportedConstraints.join(
            ','
          )} doesn't support on this browser. Please check your ReactMediaRecorder component.`
        )
      }
    }

    if (typeof audio === 'object') {
      checkConstraints(audio)
    }
    if (typeof video === 'object') {
      checkConstraints(video)
    }

    if (mediaRecorderOptions && mediaRecorderOptions.mimeType) {
      if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType)) {
        console.error(
          `The specified MIME type you supplied for MediaRecorder doesn't support this browser`
        )
      }
    }

    async function loadStream() {
      await getMediaStream()
    }

    if (!mediaStream.current) {
      loadStream()
    }
  }, [audio, screen, video, getMediaStream, mediaRecorderOptions])

  // Media Recorder Handlers

  const startRecording = async () => {
    setError('NONE')
    if (!mediaStream.current) {
      await getMediaStream()
    }
    if (mediaStream.current) {
      mediaChunks.current = []
      setMediaBlobUrl(null)
      mediaRecorder.current = new MediaRecorder(mediaStream.current)
      mediaRecorder.current.ondataavailable = onRecordingActive
      mediaRecorder.current.onstop = onRecordingStop
      mediaRecorder.current.onerror = () => {
        setError('NO_RECORDER')
        setStatus('idle')
      }
      mediaRecorder.current.start()
      setStatus('recording')
    }
  }

  const onRecordingActive = ({ data }: BlobEvent) => {
    mediaChunks.current.push(data)
  }

  const onRecordingStop = () => {
    const blobProperty: BlobPropertyBag =
      blobPropertyBag || video ? { type: 'video/mp4' } : { type: 'audio/wav' }
    const blob = new Blob(mediaChunks.current, blobProperty)
    const url = URL.createObjectURL(blob)
    setStatus('stopped')
    setMediaBlobUrl(url)
    setMediaBlob(blob)
    onStop(url)
  }

  const muteAudio = (mute: boolean) => {
    setIsAudioMuted(mute)
    if (mediaStream.current) {
      mediaStream.current.getAudioTracks().forEach((audioTrack) => (audioTrack.enabled = !mute))
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      setStatus('stopping')
      mediaRecorder.current.stop()
    }
  }

  return render({
    error: RecorderErrors[error],
    muteAudio: () => muteAudio(true),
    unMuteAudio: () => muteAudio(false),
    startRecording,
    stopRecording,
    mediaBlobUrl,
    mediaBlob,
    status,
    isAudioMuted,
    previewStream: previewStream.current,
  })
}
