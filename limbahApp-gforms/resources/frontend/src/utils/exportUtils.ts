/**
 * Utility functions for exporting data to CSV/Excel and Print/PDF.
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (cell: string | number) => {
    const str = String(cell ?? '').replace(/"/g, '""')
    return `"${str}"`
  }

  const headerLine = headers.map(sanitize).join(',')
  const rowLines = rows.map((row) => row.map(sanitize).join(','))
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeHtml(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function exportToPrintPDF(
  title: string,
  periodLabel: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Harap izinkan popup browser untuk membuka pratinjau cetak.')
    return
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const safeTitle = escapeHtml(title)
  const safePeriod = escapeHtml(periodLabel)
  const safeDate = escapeHtml(currentDate)

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${safeTitle}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 12px; }
        .header { border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .header-title { font-size: 20px; font-weight: 700; color: #0f766e; margin: 0; }
        .header-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
        .meta { text-align: right; font-size: 11px; color: #64748b; }
        .badge-bar { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 14px; margin-bottom: 16px; font-size: 12px; color: #166534; font-weight: 600; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
        th { background: #f1f5f9; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; page-break-inside: avoid; }
        .signature-box { text-align: center; width: 200px; }
        .signature-space { height: 50px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="header-title">MONOWA - EHS WASTE MANAGEMENT</h1>
          <div class="header-sub">${safeTitle}</div>
        </div>
        <div class="meta">
          <div><strong>Periode:</strong> ${safePeriod}</div>
          <div><strong>Tanggal Cetak:</strong> ${safeDate}</div>
        </div>
      </div>

      <div class="badge-bar">
        <span>Kategori: Laporan Resmi Limbah EHS</span>
        <span>Total Data: ${rows.length} Transaksi</span>
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c ?? '-')}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div>Dicetak secara otomatis oleh Sistem Monowa EHS.</div>
        <div class="signature-box">
          <div>Petugas Penanggung Jawab,</div>
          <div class="signature-space"></div>
          <div><strong>( Admin EHS )</strong></div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
