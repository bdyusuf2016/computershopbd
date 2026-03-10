import React from 'react';
import { Filter, Printer } from 'lucide-react';

type TableActionBarProps = {
  onFilter?: () => void;
  onPrint?: () => void;
  printTargetId?: string;
  filterActive?: boolean;
  className?: string;
};

const printElementById = (targetId: string) => {
  const target = document.getElementById(targetId);
  if (!target) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    window.print();
    return;
  }

  const styleMarkup = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print</title>
        ${styleMarkup}
        <style>
          body { margin: 16px; }
        </style>
      </head>
      <body>
        <div>${target.outerHTML}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

export default function TableActionBar({
  onFilter,
  onPrint,
  printTargetId,
  filterActive = false,
  className = '',
}: TableActionBarProps) {
  return (
    <div className={`flex items-center justify-end gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 ${className}`}>
      <button
        type="button"
        onClick={onFilter}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
          filterActive
            ? 'bg-emerald-500 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <Filter size={16} />
        Filter
      </button>
      <button
        type="button"
        onClick={onPrint || (() => (printTargetId ? printElementById(printTargetId) : window.print()))}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <Printer size={16} />
        Print
      </button>
    </div>
  );
}
