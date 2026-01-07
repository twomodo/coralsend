'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { cn } from '@/lib/utils';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;
    
    setErrorMsg(null);
    
    try {
      // Check for camera permission
      const devices = await Html5Qrcode.getCameras();
      
      if (devices.length === 0) {
        setHasCamera(false);
        setErrorMsg('No camera found');
        onError?.('No camera found');
        return;
      }

      if (scannerRef.current) {
        await scannerRef.current.stop();
      }

      scannerRef.current = new Html5Qrcode('qr-reader', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          console.log('QR Scanned:', decodedText);
          // Vibration feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
          onScan(decodedText);
        },
        undefined
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Scanner error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
      setErrorMsg(errorMessage);
      onError?.(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    // Start scanner on mount
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Scanner container */}
      <div 
        ref={containerRef}
        className="relative bg-slate-900 rounded-xl overflow-hidden aspect-square"
      >
        <div id="qr-reader" className="w-full h-full" />
        
        {/* Scanning overlay with corner markers */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px]">
              {/* Top-left corner */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
              {/* Top-right corner */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
              {/* Bottom-left corner */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
              {/* Bottom-right corner */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
              
              {/* Scanning line animation */}
              <div 
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-[scan_2s_ease-in-out_infinite]"
                style={{
                  animation: 'scan 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* No camera state */}
        {!hasCamera && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 p-4">
            <CameraOff className="w-16 h-16 text-slate-500 mb-4" />
            <p className="text-slate-400 text-center">No camera available</p>
          </div>
        )}

        {/* Error state */}
        {errorMsg && hasCamera && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 p-4">
            <CameraOff className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-red-400 text-sm text-center mb-4">{errorMsg}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={startScanner}
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-center text-slate-400 text-sm mt-3">
        Point your camera at the QR code
      </p>

      {/* Custom styles for html5-qrcode */}
      <style jsx global>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
          background: transparent !important;
        }
        #qr-reader__scan_region video {
          border-radius: 0.75rem;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #qr-reader__header_message {
          display: none !important;
        }
        
        @keyframes scan {
          0%, 100% { top: 0; opacity: 1; }
          50% { top: 100%; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

