// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Check for BarcodeDetector API (Experimental in some browsers)
        if ('BarcodeDetector' in window) {
          // @ts-ignore
          const barcodeDetector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });
          const detect = async () => {
            if (videoRef.current && stream?.active) {
              try {
                // @ts-ignore
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  onScan(barcodes[0].rawValue);
                  return;
                }
              } catch (e) {
                // Silently fail detection loop frame
              }
              requestAnimationFrame(detect);
            }
          };
          detect();
        }
      } catch (err) {
        setError(t('Camera access denied or not available', 'ক্যামেরা অ্যাক্সেস পাওয়া যায়নি'));
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, t]);

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-square bg-gray-800 rounded-2xl overflow-hidden border-2 border-emerald-500">
        {!error ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Scanner Animation */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white border-opacity-30 rounded-lg relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500 animate-bounce shadow-[0_0_15px_#10b981]"></div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
            <Camera size={48} className="text-gray-500"/>
            <p>{error}</p>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full text-black shadow-lg"
        >
          <X size={24}/>
        </button>
      </div>

      <div className="mt-8 w-full max-w-md space-y-4">
        <p className="text-center text-white text-sm">
          {t('Align barcode within the frame', 'বারকোডটি ফ্রেমের ভেতরে আনুন')}
        </p>
        
        <div className="bg-white p-4 rounded-xl flex gap-2">
          <input 
            type="text" 
            placeholder={t('Enter product ID manually...', 'ম্যানুয়ালি আইডি লিখুন...')}
            className="flex-1 outline-none text-sm"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button 
            onClick={() => onScan(manualCode)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
          >
            {t('Go', 'যাও')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;