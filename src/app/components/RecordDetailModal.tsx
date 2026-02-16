import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ChevronLeft, ChevronRight, Info, Bookmark } from 'lucide-react';
import { WorklistRepository } from '../../lib/repositories/WorklistRepository';

interface RecordDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: any[];
    initialIndex?: number;
    title?: string;
    infoLabel?: string;
    tableName?: string;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
    isOpen,
    onClose,
    items,
    initialIndex = 0,
    title = "Datensatz-Details",
    infoLabel = "Archiv-Daten",
    tableName
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [previousIndex, setPreviousIndex] = useState<number | null>(null);
    const [helpOpen, setHelpOpen] = useState(false);
    const [isInWorklist, setIsInWorklist] = useState(false);

    // Get table name context (default to invoice_items if not provided)
    const activeTable = tableName || 'invoice_items';

    // Sync index when items change or modal opens
    useEffect(() => {
        if (isOpen && items && items.length > 0) {
            // Only update if current index is out of bounds or it's a fresh open
            if (currentIndex < 0 || currentIndex >= items.length) {
                setCurrentIndex(Math.max(0, initialIndex));
            }
            setPreviousIndex(null); // Reset when modal re-opens or data changes significantly
            setHelpOpen(false);
        }
    }, [isOpen, initialIndex, items]);

    // Check if current item is in worklist
    useEffect(() => {
        const checkStatus = async () => {
            const currentItem = items[currentIndex];
            if (currentItem?.id) {
                const status = await WorklistRepository.isInWorklist(activeTable, currentItem.id);
                setIsInWorklist(status);
            }
        };
        if (isOpen) {
            checkStatus();
        }
    }, [isOpen, currentIndex, items, activeTable]);

    const handleToggleWorklist = async () => {
        const currentItem = items[currentIndex];
        if (!currentItem?.id) return;

        // Label: Use Description or fallback to ID
        const label = currentItem.Description || currentItem.VendorName || `Eintrag #${currentItem.id}`;
        // Context: Use Period or Table
        const context = currentItem.Period || activeTable;

        await WorklistRepository.toggle(activeTable, currentItem.id, label, context);
        setIsInWorklist(!isInWorklist);

        // Trigger global sync for counters etc.
        window.dispatchEvent(new Event('db-updated'));
    };

    const handleNavigate = (newIndex: number) => {
        setPreviousIndex(currentIndex);
        setCurrentIndex(newIndex);
    };

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];
    const previousItem = (previousIndex !== null && previousIndex >= 0 && previousIndex < items.length) ? items[previousIndex] : null;

    if (!currentItem) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={items.length > 1
                    ? `${title} (${currentIndex + 1} von ${items.length})`
                    : title
                }
            >
                <div className="space-y-6">
                    {/* Toolbar / Menu Bar */}
                    <div className="-mx-6 -mt-6 mb-6 px-6 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setHelpOpen(true)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500"
                                title="Hilfe anzeigen"
                            >
                                <Info className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleToggleWorklist}
                                className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${isInWorklist
                                    ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'
                                    }`}
                                title={isInWorklist ? "Vom Arbeitsvorrat entfernen" : "Zum Arbeitsvorrat hinzufügen"}
                            >
                                <Bookmark className={`w-4 h-4 ${isInWorklist ? 'fill-current' : ''}`} />
                            </button>
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                                Navigieren
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentIndex === 0}
                                onClick={() => handleNavigate(currentIndex - 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="text-[11px] font-black text-slate-700 dark:text-slate-200 min-w-[60px] text-center bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 shadow-sm">
                                {currentIndex + 1} / {items.length}
                            </div>
                            <button
                                disabled={currentIndex === items.length - 1}
                                onClick={() => handleNavigate(currentIndex + 1)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(currentItem).map(([key, value]) => {
                            // Skip internal tracking fields if they exist and are boolean/utility
                            if (key.startsWith('is') || key === 'compositeKey' || key === 'status') return null;

                            const isChanged = previousItem && String(value) !== String(previousItem[key]);

                            return (
                                <div
                                    key={key}
                                    className={`
                                        border-b border-slate-100 dark:border-slate-700 pb-2 transition-colors duration-500
                                        ${isChanged ? 'bg-amber-50 dark:bg-amber-900/20 -mx-2 px-2 rounded-lg border-amber-200 dark:border-amber-800' : ''}
                                    `}
                                >
                                    <dt className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                                        {key}
                                        {isChanged && (
                                            <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 rounded-full">
                                                DIFF
                                            </span>
                                        )}
                                    </dt>
                                    <dd className={`text-sm font-medium break-all ${isChanged ? 'text-amber-900 dark:text-amber-100' : 'text-slate-900 dark:text-white'}`}>
                                        {value === null || value === undefined || value === '' ? (
                                            <span className="text-slate-300 italic">&lt;leer&gt;</span>
                                        ) : (
                                            String(value)
                                        )}
                                    </dd>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* Nested Help Modal */}
            <Modal
                isOpen={helpOpen}
                onClose={() => setHelpOpen(false)}
                title="Hilfe & Informationen"
            >
                <div className="space-y-4 py-2">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="font-bold uppercase tracking-tight">🔍 {infoLabel}</p>
                            <p>
                                {currentItem.Period
                                    ? `Dieser Datensatz stammt aus der Periode ${currentItem.Period}. `
                                    : 'Dieser Datensatz wird in seinem Originalzustand aus der Datenbank angezeigt.'
                                }
                            </p>
                            {items.length > 1 && (
                                <p>
                                    Du betrachtest gerade eins von <strong>{items.length} Elementen</strong>.
                                    Nutze die Pfeiltasten in der Navigation, um durch die Liste zu blättern.
                                </p>
                            )}
                            <p className="pt-2 border-t border-blue-200 dark:border-blue-800/50 font-medium italic">
                                ✨ <span className="underline decoration-amber-400 underline-offset-2">Wichtig:</span> Wenn du innerhalb eines Modals navigierst, werden Unterschiede zum jeweils *vorherigen* Datensatz mit einem gelben <strong>"DIFF"</strong>-Label markiert.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setHelpOpen(false)}
                        className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs transition-opacity hover:opacity-90"
                    >
                        Verstanden
                    </button>
                </div>
            </Modal>
        </>
    );
};
