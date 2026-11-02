import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Camera, AlertCircle } from 'lucide-react';

export interface QRBadgeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onScanSuccess: (badgeOwnerId: string) => void;
}

export const QRBadgeScanner: React.FC<QRBadgeScannerProps> = ({
  isOpen,
  onClose,
  roomId,
  onScanSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        setIsScanning(false);
      }
      setError(null);
      return;
    }

    const scannerId = 'html5-qr-reader-container';

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            // Verify format: hallwaysync:badge:{roomId}:{attendeeId} or legacy hackbuild:badge:
            if (decodedText.startsWith('hallwaysync:badge:') || decodedText.startsWith('hackbuild:badge:')) {
              const parts = decodedText.split(':');
              const badgeOwnerId = parts[3];

              if (badgeOwnerId) {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
                setIsScanning(false);
                onScanSuccess(badgeOwnerId);
                onClose();
              }
            }
          },
          () => {
            // Frame scan without QR (ignore)
          }
        );
        setIsScanning(true);
      } catch (err: any) {
        console.warn('Camera error:', err);
        setError(
          err?.message || 'Camera permission denied or camera not accessible in this browser.'
        );
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, [isOpen, roomId, onScanSuccess, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan In-Person Badge">
      <div className="space-y-4 text-center">
        <p className="text-xs text-slate-400">
          Point your phone camera at another attendee's "My Badge" QR code.
        </p>

        {error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs space-y-2">
            <AlertCircle className="w-5 h-5 mx-auto text-rose-400" />
            <p>{error}</p>
            <Button variant="secondary" size="sm" onClick={onClose} className="mt-2">
              Close Scanner
            </Button>
          </div>
        ) : (
          <div className="relative mx-auto w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-black border border-surface-border flex items-center justify-center">
            <div id="html5-qr-reader-container" className="w-full h-full" />
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-surface-card">
                <Camera className="w-6 h-6 animate-pulse mb-2 text-brand-400" />
                <span className="text-xs">Starting camera...</span>
              </div>
            )}
          </div>
        )}

        <Button variant="ghost" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
