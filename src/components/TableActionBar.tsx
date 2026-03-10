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

  const styleMarkup = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'print-frame');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const printDocument = iframe.contentWindow?.document;
  const printWindow = iframe.contentWindow;

  if (!printDocument || !printWindow) {
    iframe.remove();
    window.print();
    return;
  }

  printDocument.open();
  printDocument.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print</title>
        ${styleMarkup}
        <style>
          body {
            margin: 16px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        <div>${target.outerHTML}</div>
      </body>
    </html>
  `);
  printDocument.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 300);
  };

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
    cleanup();
  };

  const images = Array.from(printDocument.images);
  if (images.length === 0) {
    window.setTimeout(triggerPrint, 150);
    return;
  }

  let loadedImages = 0;
  const markLoaded = () => {
    loadedImages += 1;
    if (loadedImages === images.length) {
      window.setTimeout(triggerPrint, 150);
    }
  };

  images.forEach((image) => {
    if (image.complete) {
      markLoaded();
      return;
    }

    image.addEventListener('load', markLoaded, { once: true });
    image.addEventListener('error', markLoaded, { once: true });
  });
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
