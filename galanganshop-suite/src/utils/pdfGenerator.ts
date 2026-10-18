import { jsPDF } from 'jspdf';
import { Order, SiteConfig } from '../types';

export const generateOrderReceiptPDF = (order: Order, siteConfig: SiteConfig): void => {
  try {
    const brandName = (siteConfig.brandName || 'GALANGAN SHOP SUITE').toUpperCase();
    const itemCount = order.items.length;
    const pageHeight = Math.max(160, 135 + itemCount * 9);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, pageHeight]
    });

    let y = 8;

    // Header Brand
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    const brandLines = doc.splitTextToSize(brandName, 72);
    brandLines.forEach((line: string) => {
      doc.text(line, 40, y, { align: 'center' });
      y += 4.5;
    });

    // Tagline / Address / Contact
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    const addrLines = doc.splitTextToSize(siteConfig.address || 'Jl. Niaga Raya No. 88, Jakarta', 72);
    addrLines.forEach((line: string) => {
      doc.text(line, 40, y, { align: 'center' });
      y += 3.5;
    });
    doc.text(`WA: ${siteConfig.phone || '0812-3456-7890'}`, 40, y, { align: 'center' });
    y += 3.5;
    doc.text('----------------------------------------', 40, y, { align: 'center' });
    y += 4.5;

    // Order info
    doc.setFontSize(7.5);
    doc.text(`No Order : ${order.orderId}`, 5, y);
    y += 3.5;
    const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleString('id-ID');
    doc.text(`Tgl/Jam  : ${dateFormatted}`, 5, y);
    y += 3.5;

    const custName = order.customer?.name || order.customerName || 'Pelanggan';
    const custLines = doc.splitTextToSize(`Pelanggan: ${custName}`, 70);
    custLines.forEach((line: string) => {
      doc.text(line, 5, y);
      y += 3.5;
    });

    const courierTitle = order.isPickup
      ? 'Ambil di Toko (Pickup)'
      : (order.courier?.name || order.selectedCourier?.courier_name || 'Kurir Toko');
    doc.text(`Layanan  : ${courierTitle}`, 5, y);
    y += 3.5;
    doc.text(`Metode   : ${(order.paymentMethod || 'QRIS').toUpperCase()}`, 5, y);
    y += 3.5;
    doc.text('----------------------------------------', 40, y, { align: 'center' });
    y += 4.5;

    // Items list
    order.items.forEach(item => {
      const itemName = item.name;
      const itemTotal = item.price * item.quantity;
      doc.setFont('courier', 'bold');
      const nameLines = doc.splitTextToSize(itemName, 50);

      nameLines.forEach((line: string, idx: number) => {
        doc.text(line, 5, y);
        if (idx === nameLines.length - 1) {
          const priceText = `${item.quantity}x = Rp${itemTotal.toLocaleString('id-ID')}`;
          doc.text(priceText, 75, y, { align: 'right' });
        }
        y += 3.8;
      });
      y += 0.8;
    });

    y += 1.5;
    doc.setFont('courier', 'normal');
    doc.text('----------------------------------------', 40, y, { align: 'center' });
    y += 4.5;

    // Summary
    doc.text('Subtotal:', 5, y);
    doc.text(`Rp${(order.subtotal || 0).toLocaleString('id-ID')}`, 75, y, { align: 'right' });
    y += 3.5;

    if (!order.isPickup && order.courierFee) {
      doc.text('Ongkir:', 5, y);
      doc.text(`Rp${order.courierFee.toLocaleString('id-ID')}`, 75, y, { align: 'right' });
      y += 3.5;
    }

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.text('TOTAL BAYAR:', 5, y);
    doc.text(`Rp${(order.totalAmount || 0).toLocaleString('id-ID')}`, 75, y, { align: 'right' });
    y += 6.5;

    doc.setFontSize(9.5);
    doc.text('*** LUNAS ***', 40, y, { align: 'center' });
    y += 5.5;

    // Footer note
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.8);
    const footerLines = doc.splitTextToSize(`Terima kasih telah berbelanja di ${siteConfig.brandName}. Struk resmi ini sah sebagai bukti transaksi.`, 72);
    footerLines.forEach((line: string) => {
      doc.text(line, 40, y, { align: 'center' });
      y += 3.2;
    });

    doc.save(`Struk_${order.orderId}.pdf`);
  } catch (err) {
    console.error('Error generating PDF receipt:', err);
  }
};

export const generateB2BQuotationPDF = (
  b2bForm: { company: string; pic: string; phone: string; address: string; quantity: number; eventDate: string; notes?: string },
  siteConfig: SiteConfig
): void => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FORMULIR PENAWARAN CATERING & GROSIR B2B', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(siteConfig.brandName || 'GALANGAN SHOP SUITE', 105, 28, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    let y = 44;

    doc.text(`TANGGAL PENGAJUAN: ${new Date().toLocaleDateString('id-ID')}`, 20, y);
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.text('DATA PEMESAN & INSTANSI / PERUSAHAAN', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;

    doc.text(`Perusahaan / Lembaga : ${b2bForm.company}`, 20, y);
    y += 7;
    doc.text(`Nama PIC (Contact)    : ${b2bForm.pic}`, 20, y);
    y += 7;
    doc.text(`No. WhatsApp PIC      : ${b2bForm.phone}`, 20, y);
    y += 7;

    const addressLines = doc.splitTextToSize(`Alamat Pengiriman     : ${b2bForm.address}`, 165);
    doc.text(addressLines, 20, y);
    y += addressLines.length * 7 + 2;

    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL PERMINTAAN PESANAN', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 7;

    doc.text(`Tanggal Agenda Acara  : ${b2bForm.eventDate}`, 20, y);
    y += 7;
    doc.text(`Jumlah Kebutuhan      : ${b2bForm.quantity} Box / Paket`, 20, y);
    y += 7;

    const notesLines = doc.splitTextToSize(`Catatan Tambahan      : ${b2bForm.notes || '-'}`, 165);
    doc.text(notesLines, 20, y);
    y += notesLines.length * 7 + 10;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.text('* Dokumen ini diterbitkan otomatis oleh GalanganShop Suite dan berlaku untuk verifikasi invoice resmi.', 20, y);

    const safeName = b2bForm.company.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Formulir_B2B_${safeName}.pdf`);
  } catch (e) {
    console.error('Failed to generate B2B PDF:', e);
  }
};
