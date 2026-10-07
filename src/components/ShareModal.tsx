import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, MessageCircle, Share2, Download, ExternalLink, Globe, EyeOff } from 'lucide-react';
import { Profile } from '../types/database';
import { downloadVCard } from '../lib/vcard';
import { db } from '../lib/supabase';

interface ShareModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onPublish?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ profile, isOpen, onClose, onPublish }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = `https://profile.dj/${profile.username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      db.recordAnalyticsEvent(profile.id, 'share', { type: 'copy_link' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    db.recordAnalyticsEvent(profile.id, 'share', { type: 'native_share' });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.display_name || profile.username} | PROFILE.DJ`,
          text: `Connect with ${profile.display_name || profile.username} on PROFILE.DJ`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const shareOnWhatsApp = () => {
    db.recordAnalyticsEvent(profile.id, 'share', { type: 'whatsapp' });
    const text = encodeURIComponent(`Check out my digital profile on PROFILE.DJ: ${profileUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadVCard = () => {
    db.recordAnalyticsEvent(profile.id, 'contact_save', { source: 'share_modal' });
    downloadVCard(profile);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('profile-qr-svg');
    if (!svg) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 600, 600);
          ctx.drawImage(img, 50, 50, 500, 500);
        }
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${profile.username}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.warn('QR code download failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-[#141517] border border-white/10 p-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-heading font-bold tracking-tight">Share Profile</h3>
            <p className="text-xs text-neutral-400">profile.dj/{profile.username}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center py-5">
          <div className="p-4 bg-white rounded-2xl shadow-inner flex items-center justify-center">
            <QRCodeSVG 
              id="profile-qr-svg"
              value={profileUrl} 
              size={180}
              level="M"
              includeMargin={false}
            />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-xs text-neutral-400">Scan to open profile</p>
            <span className="text-neutral-600">·</span>
            <button
              onClick={handleDownloadQR}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download QR</span>
            </button>
          </div>
        </div>

        {/* Direct Link Input */}
        {!profile.is_published && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs">
              <EyeOff className="w-4 h-4 shrink-0" />
              <span>Draft Mode (Private)</span>
            </div>
            {onPublish && (
              <button
                onClick={() => {
                  onPublish();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                <span>Publish Now</span>
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 p-1.5 bg-[#1b1d20] border border-white/10 rounded-xl mb-4">
          <input 
            type="text" 
            readOnly 
            value={profileUrl}
            className="flex-1 bg-transparent px-3 text-xs text-neutral-200 outline-none select-all truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={shareOnWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all text-xs font-medium text-neutral-300 hover:text-emerald-400"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all text-xs font-medium text-neutral-300 hover:text-amber-400"
          >
            <Share2 className="w-5 h-5 text-amber-400" />
            <span>Share</span>
          </button>

          <button
            onClick={handleDownloadVCard}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all text-xs font-medium text-neutral-300 hover:text-blue-400"
          >
            <Download className="w-5 h-5 text-blue-400" />
            <span>vCard .vcf</span>
          </button>
        </div>
      </div>
    </div>
  );
};
