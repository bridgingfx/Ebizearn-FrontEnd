import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react';

/**
 * KYC selfie taken live with the device camera — no gallery or file upload,
 * so the photo is taken now, by the person holding the ID. Returns a JPEG
 * File through onCapture.
 */
export const SelfieCamera: React.FC<{ open: boolean; onClose: () => void; onCapture: (file: File) => void }> = ({
  open,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shot, setShot] = useState<{ url: string; blob: Blob } | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('unsupported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch (e) {
      const name = (e as { name?: string })?.name;
      setError(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Camera access was blocked. Allow camera access for this site in your browser settings, then try again.'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
            ? 'No camera was found on this device. Please use a phone or computer with a camera.'
            : 'The camera could not be started on this browser. Please try another browser or device.',
      );
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void start();
    return () => stop();
  }, [open, start, stop]);

  useEffect(() => () => {
    if (shot) URL.revokeObjectURL(shot.url);
  }, [shot]);

  if (!open) return null;

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setShot({ url: URL.createObjectURL(blob), blob });
        stop();
      },
      'image/jpeg',
      0.9,
    );
  };

  const retake = () => {
    setShot(null);
    void start();
  };

  const usePhoto = () => {
    if (!shot) return;
    onCapture(new File([shot.blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    setShot(null);
    stop();
    onClose();
  };

  const close = () => {
    stop();
    setShot(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 p-4" role="dialog" aria-modal="true" aria-label="Take a selfie">
      <div className="w-full max-w-lg bg-white dark:bg-[#0C1322] rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-gray-100">Selfie holding your ID</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Hold the ID next to your face. Both must be clear.</p>
          </div>
          <button type="button" onClick={close} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" aria-label="Close camera">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-black aspect-[4/3]">
          {shot ? (
            <img src={shot.url} alt="Your selfie" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover [transform:scaleX(-1)]" />
          )}
          {starting && !shot && (
            <div className="absolute inset-0 flex items-center justify-center text-white/80">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-wrap justify-center gap-2">
          {shot ? (
            <>
              <button
                type="button"
                onClick={retake}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200"
              >
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                type="button"
                onClick={usePhoto}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16B364] hover:bg-[#12995a] text-white text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4" /> Use this photo
              </button>
            </>
          ) : error ? (
            <button
              type="button"
              onClick={() => void start()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#168BFF] text-white text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          ) : (
            <button
              type="button"
              disabled={starting}
              onClick={capture}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#168BFF] hover:bg-[#0f7ae5] text-white text-sm font-bold disabled:opacity-50"
            >
              <Camera className="w-5 h-5" /> Take photo
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
