import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from './ui/button';

export interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  showActions?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  title,
  subtitle,
  showActions = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('room-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'event-room-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card text-center">
      {title && <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}

      {/* High-contrast QR Container */}
      <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-full flex items-center justify-center">
        <QRCodeSVG
          id="room-qr-code"
          value={value}
          size={size}
          className="max-w-[200px] max-h-[200px] sm:max-w-none sm:max-h-none w-auto h-auto"
          level="H"
          includeMargin={false}
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>

      <p className="text-[11px] font-mono text-slate-400 mt-3 max-w-[240px] truncate">
        {value}
      </p>

      {showActions && (
        <div className="flex items-center gap-2 mt-4 w-full">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="flex-1 min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-brand-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center"
            title="Download QR code image"
            aria-label="Download QR image"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
