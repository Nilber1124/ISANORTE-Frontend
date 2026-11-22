export interface ReceiptLine {
  name: string;
  quantity: number;
  unitPrice: number | null;
  subtotal: number | null;
}

/** Datos mínimos para imprimir el comprobante de un pedido (tienda online o panel de administración). */
export interface ReceiptData {
  code: string;
  date: string | null;
  customer?: string | null;
  deliveryLabel: string;
  paymentLabel: string;
  lines: readonly ReceiptLine[];
  shippingCost: number;
  total: number | null;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const money = (value: number | null): string => (value === null ? 'Por confirmar' : `S/ ${value.toFixed(2)}`);

/**
 * Abre una ventana con el comprobante y lanza la impresión del navegador. Es un documento interno,
 * no una boleta ni factura electrónica: eso depende del proveedor autorizado por SUNAT.
 */
export function printReceipt(data: ReceiptData): void {
  if (typeof window === 'undefined') return;
  const popup = window.open('', '_blank', 'width=720,height=900');
  if (!popup) return;

  const rows = data.lines
    .map(
      (line) =>
        `<tr><td>${escapeHtml(line.name)}</td><td class="n">${line.quantity}</td>` +
        `<td class="n">${money(line.unitPrice)}</td><td class="n">${money(line.subtotal)}</td></tr>`,
    )
    .join('');
  const date = data.date ? new Date(data.date).toLocaleString('es-PE') : '';

  popup.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Comprobante ${escapeHtml(data.code)}</title>
<style>
  body{font-family:system-ui,sans-serif;margin:32px;color:#111}
  h1{font-size:20px;margin:0}
  .muted{color:#555;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:20px;font-size:14px}
  th,td{padding:8px 6px;border-bottom:1px solid #ddd;text-align:left}
  .n{text-align:right}
  .tot td{border:0;font-weight:600}
  .aviso{margin-top:28px;padding:10px;border:1px dashed #999;font-size:12px;color:#555}
</style></head><body>
<h1>ISADECOR · Comprobante de pedido</h1>
<p class="muted">Pedido <strong>${escapeHtml(data.code)}</strong>${date ? ` · ${escapeHtml(date)}` : ''}</p>
${data.customer ? `<p class="muted">Cliente: ${escapeHtml(data.customer)}</p>` : ''}
<p class="muted">Entrega: ${escapeHtml(data.deliveryLabel)} · Pago: ${escapeHtml(data.paymentLabel)}</p>
<table><thead><tr><th>Producto</th><th class="n">Cant.</th><th class="n">P. unit.</th><th class="n">Subtotal</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot>
<tr class="tot"><td colspan="3" class="n">Envío</td><td class="n">${money(data.shippingCost)}</td></tr>
<tr class="tot"><td colspan="3" class="n">Total</td><td class="n">${money(data.total)}</td></tr>
</tfoot></table>
<p class="aviso">Documento informativo. No es una boleta ni una factura electrónica.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
  popup.document.close();
}
