import React, { useState } from 'react';
import { 
  Wallet, 
  Building2, 
  Smartphone, 
  PiggyBank, 
  TrendingUp, 
  CreditCard, 
  Heart, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeftRight, 
  Check, 
  X, 
  Banknote,
  DollarSign
} from 'lucide-react';
import { FinanceWallet, FinanceWalletType } from '../../types';

interface FinanceWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: FinanceWallet[];
  onAddWallet: (wallet: Omit<FinanceWallet, 'id' | 'createdAt'>) => void;
  onEditWallet: (id: string, wallet: Partial<FinanceWallet>) => void;
  onDeleteWallet: (id: string) => void;
  onTransfer: (fromId: string, toId: string, amount: number, note: string) => void;
}

const WALLET_TYPE_ICONS: Record<FinanceWalletType, React.ElementType> = {
  cash: Banknote,
  bank: Building2,
  e_wallet: Smartphone,
  savings: PiggyBank,
  investment: TrendingUp,
  credit_card: CreditCard,
  couple_shared: Heart,
};

const WALLET_TYPE_NAMES: Record<FinanceWalletType, string> = {
  cash: 'Tiền mặt',
  bank: 'Tài khoản ngân hàng',
  e_wallet: 'Ví điện tử',
  savings: 'Sổ tiết kiệm tích lũy',
  investment: 'Tài khoản đầu tư / Cổ phiếu',
  credit_card: 'Thẻ tín dụng',
  couple_shared: 'Quỹ chung Cặp đôi 💕',
};

const COLOR_PRESETS = ['#10b981', '#059669', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b', '#dc2626'];

export function FinanceWalletsModal({
  isOpen,
  onClose,
  wallets,
  onAddWallet,
  onEditWallet,
  onDeleteWallet,
  onTransfer,
}: FinanceWalletsModalProps) {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'add' | 'transfer'>('list');
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);

  // Add / Edit Wallet Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<FinanceWalletType>('bank');
  const [formBalance, setFormBalance] = useState('');
  const [formBankName, setFormBankName] = useState('Vietcombank');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formColor, setFormColor] = useState('#10b981');
  const [formIsCoupleShared, setFormIsCoupleShared] = useState(false);

  // Transfer Form State
  const [transferFromId, setTransferFromId] = useState(wallets[0]?.id || '');
  const [transferToId, setTransferToId] = useState(wallets[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOpenAdd = () => {
    setEditingWalletId(null);
    setFormName('');
    setFormType('bank');
    setFormBalance('0');
    setFormBankName('Vietcombank');
    setFormAccountNumber('');
    setFormColor('#10b981');
    setFormIsCoupleShared(false);
    setActiveSubTab('add');
  };

  const handleOpenEdit = (w: FinanceWallet) => {
    setEditingWalletId(w.id);
    setFormName(w.name);
    setFormType(w.type);
    setFormBalance(w.balance.toString());
    setFormBankName(w.bankName || 'Vietcombank');
    setFormAccountNumber(w.accountNumber || '');
    setFormColor(w.color || '#10b981');
    setFormIsCoupleShared(!!w.isCoupleShared);
    setActiveSubTab('add');
  };

  const handleSubmitWalletForm = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(formBalance.replace(/[^0-9]/g, '')) || 0;

    if (!formName.trim()) {
      alert('Vui lòng nhập tên ví hoặc tài khoản');
      return;
    }

    if (editingWalletId) {
      onEditWallet(editingWalletId, {
        name: formName.trim(),
        type: formType,
        balance: balanceNum,
        bankName: formType === 'bank' ? formBankName : undefined,
        accountNumber: formAccountNumber || undefined,
        color: formColor,
        isCoupleShared: formIsCoupleShared || formType === 'couple_shared',
      });
    } else {
      onAddWallet({
        name: formName.trim(),
        type: formType,
        balance: balanceNum,
        currency: 'VND',
        bankName: formType === 'bank' ? formBankName : undefined,
        accountNumber: formAccountNumber || undefined,
        color: formColor,
        icon: 'Building2',
        isCoupleShared: formIsCoupleShared || formType === 'couple_shared',
      });
    }

    setActiveSubTab('list');
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount.replace(/[^0-9]/g, '')) || 0;
    if (amountNum <= 0) {
      alert('Vui lòng nhập số tiền chuyển hợp lệ');
      return;
    }
    if (transferFromId === transferToId) {
      alert('Ví nguồn và ví đích không được trùng nhau');
      return;
    }

    onTransfer(transferFromId, transferToId, amountNum, transferNote || 'Chuyển tiền nội bộ');
    setTransferAmount('');
    setTransferNote('');
    setActiveSubTab('list');
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Quản Lý Ví &amp; Tài Khoản</h3>
              <p className="text-xs text-zinc-400">
                Tổng số dư ({wallets.length} ví): <strong className="text-emerald-400 font-black">{formatVND(totalBalance)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-800/80 bg-zinc-900/30">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === 'list' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Danh sách Ví ({wallets.length})
          </button>
          <button
            onClick={handleOpenAdd}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'add' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus size={13} />
            <span>{editingWalletId ? 'Chỉnh sửa ví' : 'Thêm ví mới'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('transfer')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'transfer' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowLeftRight size={13} />
            <span>Chuyển tiền giữa các ví</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* TAB 1: LIST */}
          {activeSubTab === 'list' && (
            <div className="space-y-3">
              {wallets.map((w) => {
                const IconComponent = WALLET_TYPE_ICONS[w.type] || Wallet;
                return (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border"
                        style={{
                          backgroundColor: `${w.color}20`,
                          borderColor: `${w.color}40`,
                          color: w.color
                        }}
                      >
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{w.name}</h4>
                          {w.isCoupleShared && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                              <Heart size={10} className="fill-rose-400 text-rose-400" /> Quỹ Đôi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {WALLET_TYPE_NAMES[w.type]} {w.bankName ? `• ${w.bankName}` : ''} {w.accountNumber ? `(${w.accountNumber})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-black text-white">{formatVND(w.balance)}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={13} />
                        </button>
                        {wallets.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa ví "${w.name}" không?`)) {
                                onDeleteWallet(w.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                            title="Xóa ví"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleOpenAdd}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 text-xs font-bold text-zinc-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus size={15} />
                <span>+ Thêm Ví / Tài Khoản Ngân Hàng Mới</span>
              </button>
            </div>
          )}

          {/* TAB 2: ADD / EDIT */}
          {activeSubTab === 'add' && (
            <form onSubmit={handleSubmitWalletForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-zinc-300">Tên Ví / Tài Khoản *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Vietcombank Lương, MoMo Sinh Hoạt..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-zinc-300">Loại Tài Khoản *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as FinanceWalletType)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bank">Tài khoản Ngân hàng</option>
                    <option value="cash">Tiền mặt ví tay</option>
                    <option value="e_wallet">Ví điện tử (MoMo, ZaloPay...)</option>
                    <option value="savings">Sổ tiết kiệm tích lũy</option>
                    <option value="investment">Tài khoản Đầu tư / Chứng khoán</option>
                    <option value="couple_shared">Quỹ chung Cặp đôi (I Love Haevy)</option>
                    <option value="credit_card">Thẻ tín dụng (Credit Card)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-zinc-300">Số Dư Hiện Tại (VND) *</label>
                  <input
                    type="number"
                    required
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {formType === 'bank' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-300">Tên Ngân Hàng</label>
                    <select
                      value={formBankName}
                      onChange={(e) => setFormBankName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="MB Bank">MB Bank</option>
                      <option value="ACB">ACB</option>
                      <option value="VPBank">VPBank</option>
                      <option value="TPBank">TPBank</option>
                      <option value="BIDV">BIDV</option>
                      <option value="VietinBank">VietinBank</option>
                      <option value="Sacombank">Sacombank</option>
                      <option value="Ngân hàng khác">Ngân hàng khác</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-zinc-300">Số Tài Khoản (Tùy chọn)</label>
                    <input
                      type="text"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      placeholder="****8888"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Color Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-zinc-300">Màu Sắc Đại Diện</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-xl transition-all ${
                        formColor === c ? 'scale-110 ring-2 ring-white shadow-lg' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Couple Shared Check */}
              <label className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsCoupleShared || formType === 'couple_shared'}
                  onChange={(e) => setFormIsCoupleShared(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500"
                />
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Heart size={13} className="text-rose-400 fill-rose-400" />
                  Đánh dấu là Quỹ chung Cặp đôi (I Love Haevy)
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('list')}
                  className="px-4 py-2 rounded-2xl bg-zinc-900 text-zinc-300 text-xs font-bold"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black"
                >
                  {editingWalletId ? 'Cập Nhật Ví' : 'Tạo Ví Mới'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TRANSFER */}
          {activeSubTab === 'transfer' && (
            <form onSubmit={handleSubmitTransfer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-zinc-300">Từ Ví Nguồn *</label>
                  <select
                    value={transferFromId}
                    onChange={(e) => setTransferFromId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-zinc-300">Đến Ví Đích *</label>
                  <select
                    value={transferToId}
                    onChange={(e) => setTransferToId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {wallets.filter(w => w.id !== transferFromId).map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-zinc-300">Số Tiền Chuyển (VND) *</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Ví dụ: 1000000"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-sm font-black text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-zinc-300">Lý Do / Ghi Chú</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Rút tiền mặt tiêu vặt, gửi tiết kiệm..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('list')}
                  className="px-4 py-2 rounded-2xl bg-zinc-900 text-zinc-300 text-xs font-bold"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black shadow-lg shadow-cyan-500/20"
                >
                  Xác Nhận Chuyển Tiền
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
