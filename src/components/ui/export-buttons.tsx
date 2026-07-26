'use client'

import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type ExportButtonsProps = {
  data: Record<string, string | number | null>[]
  filename: string
}

export function ExportButtons({ data, filename }: ExportButtonsProps) {
  
  const exportExcel = () => {
    if (!data.length) return
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const exportCSV = () => {
    if (!data.length) return
    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPDF = () => {
    if (!data.length) return
    const doc = new jsPDF()
    const headers = Object.keys(data[0])
    const head = [headers]
    const body = data.map(row => headers.map(header => String(row[header] || '')))
    
    // Add title
    doc.setFontSize(14)
    doc.text(`Export: ${filename}`, 14, 15)
    
    autoTable(doc, {
      head: head,
      body: body,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] } // primary dark color
    })
    
    doc.save(`${filename}.pdf`)
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={exportCSV}
        className="inline-flex items-center gap-2 rounded-xl bg-muted/50 hover:bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors border border-border/50 shadow-sm"
      >
        <Download size={14} />
        CSV
      </button>
      <button 
        onClick={exportExcel}
        className="inline-flex items-center gap-2 rounded-xl bg-muted/50 hover:bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors border border-border/50 shadow-sm"
      >
        <Download size={14} />
        Excel
      </button>
      <button 
        onClick={exportPDF}
        className="inline-flex items-center gap-2 rounded-xl bg-muted/50 hover:bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors border border-border/50 shadow-sm"
      >
        <Download size={14} />
        PDF
      </button>
    </div>
  )
}
