'use client';

import React from 'react';

interface KycLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function KycLightboxModal({
  imageUrl,
  onClose,
}: KycLightboxModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Phóng to ảnh thẻ"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-2 border-white/20"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white text-lg hover:bg-black/80 transition cursor-pointer shadow-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
