import { Order } from '../types.ts';

function cleanAscii(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/₹/g, 'INR ')
    .replace(/[—–]/g, '-')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateOrderReceiptPdf(order: Order): Promise<void> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const forest = rgb(22 / 255, 101 / 255, 52 / 255);
  const darkInk = rgb(20 / 255, 23 / 255, 26 / 255);
  const muted = rgb(95 / 255, 107 / 255, 122 / 255);
  const softPaper = rgb(250 / 255, 249 / 255, 246 / 255);
  const softGreen = rgb(240 / 255, 253 / 255, 244 / 255);
  const borderGray = rgb(226 / 255, 232 / 255, 240 / 255);
  const amberBg = rgb(255 / 255, 251 / 255, 235 / 255);
  const amberInk = rgb(146 / 255, 64 / 255, 14 / 255);

  const isPaid = order.payment_status === 'paid';
  const margin = 44;
  let y = height - 48;

  // Top Header Band
  page.drawRectangle({
    x: 0,
    y: height - 110,
    width,
    height: 110,
    color: softPaper,
  });
  page.drawLine({
    start: { x: 0, y: height - 110 },
    end: { x: width, y: height - 110 },
    thickness: 1.5,
    color: forest,
  });

  page.drawText('BUY4ACHANGE', {
    x: margin,
    y,
    size: 20,
    font: fontBold,
    color: forest,
  });
  page.drawText('Universal Guard Trust & UGT India Initiative', {
    x: margin,
    y: y - 18,
    size: 10,
    font: fontRegular,
    color: muted,
  });
  page.drawText('ugtindia.space  |  ugtglobal.space', {
    x: margin,
    y: y - 33,
    size: 9,
    font: fontMono,
    color: forest,
  });

  // Right Document Title
  const docTitle = isPaid ? 'OFFICIAL RECEIPT & IMPACT CERTIFICATE' : 'ORDER ACKNOWLEDGEMENT (PENDING VERIFICATION)';
  page.drawText(docTitle, {
    x: margin,
    y: height - 138,
    size: 12,
    font: fontBold,
    color: isPaid ? forest : amberInk,
  });

  // Status Pill on Top Right
  page.drawRectangle({
    x: width - margin - 145,
    y: y - 8,
    width: 145,
    height: 24,
    color: isPaid ? softGreen : amberBg,
    borderColor: isPaid ? forest : amberInk,
    borderWidth: 1,
  });
  page.drawText(isPaid ? 'STATUS: VERIFIED PAID' : 'PENDING UTR VERIFICATION', {
    x: width - margin - 137,
    y: y,
    size: 8.5,
    font: fontBold,
    color: isPaid ? forest : amberInk,
  });

  // Metadata Box
  y = height - 154;
  page.drawRectangle({
    x: margin,
    y: y - 78,
    width: width - margin * 2,
    height: 78,
    color: softPaper,
    borderColor: borderGray,
    borderWidth: 1,
  });

  const leftColX = margin + 14;
  const rightColX = width / 2 + 10;

  page.drawText(`Order Number: ${cleanAscii(order.order_number)}`, {
    x: leftColX,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: darkInk,
  });
  page.drawText(`Order Date: ${cleanAscii(new Date(order.created_at).toLocaleString('en-IN'))}`, {
    x: leftColX,
    y: y - 38,
    size: 9.5,
    font: fontRegular,
    color: muted,
  });
  page.drawText(`Payment Ref: ${cleanAscii(order.payment_id || 'N/A')}`, {
    x: leftColX,
    y: y - 56,
    size: 9,
    font: fontMono,
    color: darkInk,
  });

  page.drawText(`Buyer: ${cleanAscii(order.customer_name)}`, {
    x: rightColX,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: darkInk,
  });
  page.drawText(`Email: ${cleanAscii(order.customer_email)}`, {
    x: rightColX,
    y: y - 38,
    size: 9.5,
    font: fontRegular,
    color: muted,
  });
  page.drawText(`Phone: ${cleanAscii(order.customer_phone)}`, {
    x: rightColX,
    y: y - 56,
    size: 9.5,
    font: fontRegular,
    color: muted,
  });

  // Delivery / Dispatch Row
  y = y - 96;
  if (order.shipping_address && order.shipping_address !== 'Digital Delivery') {
    page.drawText('Delivery Address:', {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: darkInk,
    });
    const fullAddr = cleanAscii(
      `${order.shipping_address}, ${order.city}, ${order.state}${order.pincode ? ' - ' + order.pincode : ''}`
    );
    page.drawText(fullAddr.slice(0, 88), {
      x: margin + 96,
      y,
      size: 9.5,
      font: fontRegular,
      color: muted,
    });
    y -= 18;
  }

  if (order.tracking_number) {
    page.drawText('Courier / Tracking AWB:', {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: forest,
    });
    page.drawText(
      cleanAscii(`${order.courier_name ? order.courier_name + ' - ' : ''}${order.tracking_number}`),
      {
        x: margin + 125,
        y,
        size: 9.5,
        font: fontMono,
        color: darkInk,
      }
    );
    y -= 20;
  }

  // Order Items Table
  y -= 10;
  page.drawRectangle({
    x: margin,
    y: y - 22,
    width: width - margin * 2,
    height: 22,
    color: forest,
  });
  page.drawText('ITEM DESCRIPTION', { x: margin + 10, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('QTY', { x: width - margin - 150, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('UNIT PRICE', { x: width - margin - 115, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('TOTAL', { x: width - margin - 52, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });

  y -= 24;
  const items = order.items && order.items.length > 0
    ? order.items
    : [
        {
          product_name: 'Buy4AChange Conscious Order',
          quantity: 1,
          price: order.subtotal || order.total_amount,
          total: order.subtotal || order.total_amount,
        },
      ];

  for (const item of items) {
    y -= 20;
    page.drawText(cleanAscii(item.product_name).slice(0, 52), {
      x: margin + 10,
      y,
      size: 9.5,
      font: fontRegular,
      color: darkInk,
    });
    page.drawText(String(item.quantity || 1), {
      x: width - margin - 145,
      y,
      size: 9.5,
      font: fontMono,
      color: darkInk,
    });
    page.drawText(`INR ${Number(item.price || 0).toFixed(0)}`, {
      x: width - margin - 115,
      y,
      size: 9.5,
      font: fontMono,
      color: darkInk,
    });
    page.drawText(`INR ${Number(item.total || (item.price || 0) * (item.quantity || 1)).toFixed(0)}`, {
      x: width - margin - 58,
      y,
      size: 9.5,
      font: fontMono,
      color: darkInk,
    });
    page.drawLine({
      start: { x: margin, y: y - 6 },
      end: { x: width - margin, y: y - 6 },
      thickness: 0.5,
      color: borderGray,
    });
  }

  // Totals Block
  y -= 28;
  const totalsX = width - margin - 180;
  page.drawText('Subtotal:', { x: totalsX, y, size: 9.5, font: fontRegular, color: muted });
  page.drawText(`INR ${Number(order.subtotal || order.total_amount).toLocaleString('en-IN')}`, {
    x: width - margin - 75,
    y,
    size: 9.5,
    font: fontMono,
    color: darkInk,
  });

  y -= 16;
  page.drawText('Shipping:', { x: totalsX, y, size: 9.5, font: fontRegular, color: muted });
  page.drawText(order.shipping_fee ? `INR ${order.shipping_fee}` : 'FREE', {
    x: width - margin - 75,
    y,
    size: 9.5,
    font: fontMono,
    color: forest,
  });

  y -= 20;
  page.drawLine({
    start: { x: totalsX, y: y + 12 },
    end: { x: width - margin, y: y + 12 },
    thickness: 1,
    color: darkInk,
  });
  page.drawText('TOTAL AMOUNT:', { x: totalsX, y, size: 10.5, font: fontBold, color: darkInk });
  page.drawText(`INR ${Number(order.total_amount).toLocaleString('en-IN')}`, {
    x: width - margin - 75,
    y,
    size: 10.5,
    font: fontBold,
    color: forest,
  });

  // Living India Mission Impact Certificate Box
  y -= 42;
  const certHeight = 120;
  page.drawRectangle({
    x: margin,
    y: y - certHeight,
    width: width - margin * 2,
    height: certHeight,
    color: isPaid ? softGreen : amberBg,
    borderColor: isPaid ? forest : amberInk,
    borderWidth: 1.5,
  });

  page.drawText('UNIVERSAL GUARD TRUST - LIVING INDIA IMPACT CERTIFICATE', {
    x: margin + 16,
    y: y - 22,
    size: 10.5,
    font: fontBold,
    color: isPaid ? forest : amberInk,
  });
  page.drawText(
    isPaid
      ? `This certifies that Order #${cleanAscii(order.order_number)} by ${cleanAscii(order.customer_name)} has contributed:`
      : `Upon bank verification of UTR ref ${cleanAscii(order.payment_id)}, this order allocates:`,
    {
      x: margin + 16,
      y: y - 42,
      size: 9.5,
      font: fontRegular,
      color: darkInk,
    }
  );
  page.drawText(
    `INR ${Number(order.cause_donation_amount || 0).toLocaleString('en-IN')}  ->  ${cleanAscii(
      order.cause_title || 'Living India National Mission'
    )}`,
    {
      x: margin + 16,
      y: y - 66,
      size: 13,
      font: fontBold,
      color: forest,
    }
  );
  page.drawText(cleanAscii(order.cause_impact_delivered || 'Direct mission allocation across India').slice(0, 86), {
    x: margin + 16,
    y: y - 88,
    size: 9.5,
    font: fontRegular,
    color: muted,
  });
  page.drawText(
    'Verify live status anytime at Buy4AChange -> Track Order & Public Impact Ledger.',
    {
      x: margin + 16,
      y: y - 106,
      size: 8.5,
      font: fontMono,
      color: forest,
    }
  );

  // Footer
  page.drawLine({
    start: { x: margin, y: 60 },
    end: { x: width - margin, y: 60 },
    thickness: 0.75,
    color: borderGray,
  });
  page.drawText(
    'Generated by Buy4AChange (Open-Source pdf-lib Engine) | Universal Guard Trust | ugtindia.space | ugtglobal.space',
    {
      x: margin,
      y: 42,
      size: 8,
      font: fontRegular,
      color: muted,
    }
  );

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Buy4AChange-${order.order_number}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
