import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Heart, 
  Trash2, 
  Check, 
  AlertCircle, 
  UserCheck, 
  Sparkles,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { CoupleData, CoupleRelationshipType } from '../../types';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface CoupleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple: CoupleData;
  userUid?: string;
  onUpdateCouple: (updatedData: Partial<CoupleData>) => Promise<void>;
  onUnpairCouple: () => Promise<void>;
}

export function CoupleSettingsModal({
  isOpen,
  onClose,
  couple,
  userUid,
  onUpdateCouple,
  onUnpairCouple
}: CoupleSettingsModalProps) {
  const isMePartner1 = couple.partner1.uid === userUid;
  const me = isMePartner1 ? couple.partner1 : couple.partner2;
  const myPartner = isMePartner1 ? couple.partner2 : couple.partner1;

  const [coupleTitle, setCoupleTitle] = useState(couple.coupleTitle || 'Tình Yêu Chúng Mình');
  const [anniversaryDate, setAnniversaryDate] = useState(couple.anniversaryDate || '');
  const [relationshipType, setRelationshipType] = useState<CoupleRelationshipType>(couple.relationshipType || 'dating');
  const [myNickname, setMyNickname] = useState(me?.nickname || 'Người Yêu');
  const [partnerNickname, setPartnerNickname] = useState(myPartner?.nickname || 'Người Yêu');
  const [myPhoto, setMyPhoto] = useState(me?.photoURL || '');
  const [bannerUrl, setBannerUrl] = useState(couple.bannerUrl || '');
  const [confirmUnpair, setConfirmUnpair] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedPayload: Partial<CoupleData> = {
        coupleTitle: coupleTitle.trim(),
        anniversaryDate,
        relationshipType,
        bannerUrl: bannerUrl.trim() || undefined
      };

      if (isMePartner1) {
        updatedPayload.partner1 = {
          ...couple.partner1,
          nickname: myNickname.trim(),
          photoURL: myPhoto.trim() || couple.partner1.photoURL
        };
        if (couple.partner2) {
          updatedPayload.partner2 = {
            ...couple.partner2,
            nickname: partnerNickname.trim()
          };
        }
      } else if (couple.partner2) {
        updatedPayload.partner2 = {
          ...couple.partner2,
          nickname: myNickname.trim(),
          photoURL: myPhoto.trim() || couple.partner2.photoURL
        };
        updatedPayload.partner1 = {
          ...couple.partner1,
          nickname: partnerNickname.trim()
        };
      }

      await onUpdateCouple(updatedPayload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative max-w-lg w-full max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4">
          <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Settings size={17} className="text-rose-400" />
            <span>Cài Đặt Không Gian Đôi</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300">Tên Không Gian Đôi</label>
            <input
              type="text"
              value={coupleTitle}
              onChange={(e) => setCoupleTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs text-white outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300">Mối Quan Hệ</label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as CoupleRelationshipType)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white outline-none"
            >
              <option value="dating">💖 Đang Hẹn Hò (Người Yêu)</option>
              <option value="engaged">💍 Đã Đính Hôn (Vị Hôn Thê / Phu)</option>
              <option value="married">👰🤵 Vợ Chồng Son (Hôn Nhân)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300">
              {relationshipType === 'married' ? 'Ngày Kỷ Niệm Cưới' : 'Ngày Bắt Đầu Yêu'}
            </label>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs text-white outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Biệt danh của bạn</label>
              <input
                type="text"
                value={myNickname}
                onChange={(e) => setMyNickname(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Biệt danh người ấy</label>
              <input
                type="text"
                value={partnerNickname}
                onChange={(e) => setPartnerNickname(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Avatar Picture From Device */}
          <ImageUploadPicker
            value={myPhoto}
            onChange={setMyPhoto}
            label="Ảnh đại diện của bạn (Từ máy)"
            helperText="Chọn ảnh đại diện của riêng bạn"
            aspectRatio="square"
          />

          <div className="pt-1 sm:pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>

        {/* Danger Zone: Unpair */}
        <div className="border-t border-zinc-800 pt-3 sm:pt-4 space-y-2">
          <div className="text-xs font-bold text-zinc-400">Khu vực nguy hiểm:</div>
          {confirmUnpair ? (
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2.5 sm:space-y-3">
              <div className="text-xs text-rose-300 font-medium">
                Bạn có chắc chắn muốn hủy ghép đôi không? Toàn bộ không gian đôi này sẽ đóng lại.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmUnpair(false)}
                  className="flex-1 py-1.5 sm:py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={onUnpairCouple}
                  className="flex-1 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Xác Nhận Hủy Ghép Đôi
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmUnpair(true)}
              className="w-full py-2 sm:py-2.5 rounded-xl border border-zinc-800 hover:border-rose-500/40 text-zinc-500 hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Hủy Ghép Đôi / Rời Phòng</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
