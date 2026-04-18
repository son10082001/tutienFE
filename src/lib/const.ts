import { ROUTE } from '@/types';

export const downloadPdfByUrl = async (pdfUrl: string, filename: string) => {
  try {
    const blob = await fetch(pdfUrl).then((res) => res.blob());
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.pdf') ? filename : filename + '.pdf';
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};

export const NAV_BAR_ITEMS = [
  {
    label: 'Cửa hàng',
    url: ROUTE.MARKET_PLACE,
  },
];
