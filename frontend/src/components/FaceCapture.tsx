import React, { useRef, useState, useEffect, useCallback } from 'react';

interface FaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel?: () => void;
  title?: string;
  captureButtonText?: string;
  retakeButtonText?: string;
  showPreview?: boolean;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({
  onCapture,
  onCancel,
  title = 'Face Capture',
  captureButtonText = 'Capture Photo',
  retakeButtonText = 'Retake',
  showPreview = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setError('');
      setCameraReady(false);

      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to access camera. Please check your device settings.');
      }
    }
  }, [facingMode, stream]);

  // Start camera on mount
  useEffect(() => {
    startCamera();

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (stream) {
      startCamera();
    }
  }, [facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);

    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="face-capture-container">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Position your face in the center of the frame
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden" style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Video Preview or Captured Image */}
        {!capturedImage ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            {/* Face oval guide overlay */}
            {cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-white border-dashed rounded-full opacity-50"
                  style={{ width: '60%', paddingBottom: '80%' }}>
                </div>
              </div>
            )}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          showPreview && (
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-full h-auto"
            />
          )
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3 justify-center flex-wrap">
        {!capturedImage ? (
          <>
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {captureButtonText}
            </button>

            {/* Toggle camera button (for devices with multiple cameras) */}
            <button
              onClick={toggleCamera}
              className="px-4 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={confirmCapture}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm
            </button>
            <button
              onClick={retake}
              className="px-6 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {retakeButtonText}
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      {!capturedImage && cameraReady && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Tips for best results:</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Ensure good lighting on your face</li>
            <li>• Face the camera directly</li>
            <li>• Remove glasses if possible</li>
            <li>• Keep a neutral expression</li>
            <li>• Make sure only your face is visible</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FaceCapture;
