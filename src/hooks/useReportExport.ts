import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';

interface ExportItem {
    // ... items interface ...
    elementId: string;
    title: string;
    subtitle?: string;
    orientation?: 'portrait' | 'landscape';
}

interface UseReportExportResult {
    isExporting: boolean;
    exportProgress: number;
    exportToPdf: (elementId: string, filename: string, orientation?: 'portrait' | 'landscape') => Promise<void>;
    exportPackageToPdf: (filename: string, items: ExportItem[], coverData?: { title: string; subtitle?: string; author?: string }) => Promise<void>;
    exportToImage: (elementId: string, filename: string) => Promise<void>;
}

export const useReportExport = (): UseReportExportResult => {
    const { t } = useTranslation();
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const captureElement = async (elementId: string, cloneWidth?: number): Promise<{ imgData: string; width: number; height: number } | null> => {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '500vw'; // Very far away
        clone.style.width = cloneWidth ? `${cloneWidth}px` : `${element.scrollWidth || 1200}px`;
        clone.style.height = 'auto';
        clone.style.minHeight = `${element.scrollHeight || 800}px`;
        clone.style.overflow = 'visible';
        clone.style.zIndex = '-100';
        clone.style.padding = '40px';
        clone.style.backgroundColor = '#ffffff';

        // Fix scrollables
        const scrollables = clone.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto');
        scrollables.forEach(el => {
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.height = 'auto';
        });

        document.body.appendChild(clone);

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 800));

        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: clone.offsetWidth,
            height: clone.offsetHeight
        });

        document.body.removeChild(clone);

        return {
            imgData: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height
        };
    };

    const exportToPdf = async (elementId: string, filename: string, orientation: 'portrait' | 'landscape' = 'landscape') => {
        setIsExporting(true);
        setExportProgress(0);
        try {
            const captured = await captureElement(elementId);
            if (!captured) return;

            const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pdfWidth / (captured.width / 2), pdfHeight / (captured.height / 2));
            const finalWidth = (captured.width / 2) * ratio;
            const finalHeight = (captured.height / 2) * ratio;

            pdf.addImage(captured.imgData, 'PNG', (pdfWidth - finalWidth) / 2, (pdfHeight - finalHeight) / 2, finalWidth, finalHeight);
            pdf.save(`${filename}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const exportPackageToPdf = async (filename: string, items: ExportItem[], coverData?: { title: string; subtitle?: string; author?: string }) => {
        setIsExporting(true);
        setExportProgress(0);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        try {
            // 1. Cover Page
            if (coverData) {
                pdf.setFillColor(30, 41, 59); // Slate-800
                pdf.rect(0, 0, 210, 297, 'F');

                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(32);
                pdf.text(coverData.title, 20, 100);

                if (coverData.subtitle) {
                    pdf.setFontSize(16);
                    pdf.setTextColor(148, 163, 184); // Slate-400
                    pdf.text(coverData.subtitle, 20, 115);
                }

                pdf.setFontSize(12);
                pdf.setTextColor(100, 116, 139); // Slate-500
                pdf.text(`${t('reports.generated_on')}: ${new Date().toLocaleDateString()}`, 20, 260);
                if (coverData.author) pdf.text(`${t('reports.author_prefix')}: ${coverData.author}`, 20, 267);

                pdf.addPage();
            }

            // 2. Capture items
            for (let i = 0; i < items.length; i++) {
                setExportProgress(Math.round(((i + 1) / items.length) * 100));
                const item = items[i];
                const captured = await captureElement(item.elementId, item.orientation === 'landscape' ? 1400 : 1000);

                if (captured) {
                    const orientation = item.orientation || 'portrait';
                    if (i > 0 || coverData) pdf.addPage(undefined, orientation);

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    // Add Title Header
                    pdf.setFontSize(10);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text(item.title, 10, 10);
                    pdf.line(10, 12, pdfWidth - 10, 12);

                    const ratio = Math.min((pdfWidth - 20) / (captured.width / 2), (pdfHeight - 30) / (captured.height / 2));
                    const finalWidth = (captured.width / 2) * ratio;
                    const finalHeight = (captured.height / 2) * ratio;

                    pdf.addImage(captured.imgData, 'PNG', (pdfWidth - finalWidth) / 2, 20, finalWidth, finalHeight);
                }
            }

            pdf.save(`${filename}.pdf`);
        } catch (error) {
            console.error('Batch Export failed:', error);
            alert('Export fehlgeschlagen.');
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    };

    const exportToImage = async (elementId: string, filename: string) => {
        setIsExporting(true);
        try {
            const element = document.getElementById(elementId);
            if (!element) return;
            await new Promise(resolve => setTimeout(resolve, 500));
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return { isExporting, exportProgress, exportToPdf, exportPackageToPdf, exportToImage };
};
