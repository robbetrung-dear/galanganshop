import React, { useState } from 'react';
import { SiteConfig } from '../../types';
import { generateB2BQuotationPDF } from '../../utils/pdfGenerator';

interface B2BSectionProps {
  config: SiteConfig;
}

export const B2BSection: React.FC<B2BSectionProps> = ({ config }) => {
  const [b2bForm, setB2bForm] = useState({
    company: '',
    pic: '',
    phone: '',
    address: '',
    quantity: 50,
    eventDate: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b2bForm.company || !b2bForm.pic || !b2bForm.phone || !b2bForm.address) {
      alert('Mohon lengkapi semua bidang wajib formulir B2B!');
      return;
    }

    // Generate PDF quotation
    generateB2BQuotationPDF(b2bForm, config);

    // Send to WhatsApp
    const adminPhone = (config.phone || '6281234567890').replace(/[^0-9]/g, '');
    const cleanPhone = adminPhone.startsWith('0') ? '62' + adminPhone.slice(1) : adminPhone;

    const message = `*PROPOSAL PENGAJUAN CATERING & GROSIR B2B*\n\n` +
      `🏢 Perusahaan / Instansi: ${b2bForm.company}\n` +
      `👤 Nama PIC: ${b2bForm.pic}\n` +
      `📞 No WhatsApp PIC: ${b2bForm.phone}\n` +
      `📍 Alamat Pengiriman: ${b2bForm.address}\n` +
      `📦 Kebutuhan Jumlah: ${b2bForm.quantity} Box / Paket\n` +
      `📅 Tanggal Acara: ${b2bForm.eventDate}\n` +
      `📝 Catatan Tambahan: ${b2bForm.notes || '-'}\n\n` +
      `Mohon diterbitkan invoice faktur dan jadwal pengiriman. Terima kasih!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="b2b-section" className="mt-16 bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
      <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
        <i className="fa-solid fa-briefcase text-[200px]"></i>
      </div>

      <div className="relative max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/70 border border-orange-500/30 px-3 py-1 rounded-full">
          {config.b2bBadge || 'Layanan Khusus Corporate & Event'}
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-serif mt-3">
          {config.b2bTitle || 'Pesanan Catering & Grosir Perusahaan / B2B'}
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
          {config.b2bSubtitle || 'Kebutuhan meeting kantor, seminar perusahaan, shooting, atau wedding gathering? Kami sediakan faktur pajak / invoice resmi, menu custom test food gratis, dan koordinasi langsung dengan tim admin B2B kami.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-stone-900">
            <input
              type="text"
              required
              value={b2bForm.company}
              onChange={e => setB2bForm({ ...b2bForm, company: e.target.value })}
              placeholder="Nama Perusahaan / Instansi *"
              className="p-3 rounded-xl bg-white text-xs sm:text-sm focus:outline-none"
            />
            <input
              type="text"
              required
              value={b2bForm.pic}
              onChange={e => setB2bForm({ ...b2bForm, pic: e.target.value })}
              placeholder="Nama PIC (Contact Person) *"
              className="p-3 rounded-xl bg-white text-xs sm:text-sm focus:outline-none"
            />
            <input
              type="tel"
              required
              value={b2bForm.phone}
              onChange={e => setB2bForm({ ...b2bForm, phone: e.target.value })}
              placeholder="No. WhatsApp PIC *"
              className="p-3 rounded-xl bg-white text-xs sm:text-sm focus:outline-none"
            />
            <input
              type="text"
              required
              value={b2bForm.address}
              onChange={e => setB2bForm({ ...b2bForm, address: e.target.value })}
              placeholder="Alamat Pengiriman *"
              className="p-3 rounded-xl bg-white text-xs sm:text-sm focus:outline-none"
            />
            <input
              type="number"
              min={15}
              required
              value={b2bForm.quantity}
              onChange={e => setB2bForm({ ...b2bForm, quantity: parseInt(e.target.value) || 15 })}
              placeholder="Jumlah Box / Paket (Min. 15) *"
              className="p-3 rounded-xl bg-white text-xs sm:text-sm focus:outline-none"
            />
            <input
              type="date"
              required
              value={b2bForm.eventDate}
              onChange={e => setB2bForm({ ...b2bForm, eventDate: e.target.value })}
              className="p-3 rounded-xl bg-white text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <textarea
            value={b2bForm.notes}
            onChange={e => setB2bForm({ ...b2bForm, notes: e.target.value })}
            rows={2}
            placeholder="Catatan menu, request faktur pajak / invoice resmi, atau jam kedatangan..."
            className="w-full p-3 rounded-xl bg-white text-stone-900 text-xs sm:text-sm focus:outline-none"
          ></textarea>

          <button
            type="submit"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i>
            <span>Kirim Pesanan & Unduh PDF Penawaran B2B</span>
          </button>
        </form>
      </div>
    </section>
  );
};
