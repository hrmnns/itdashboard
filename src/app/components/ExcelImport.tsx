import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { bulkInsertKPIs, bulkInsertEvents, bulkInsertInvoiceItems, clearDatabase } from '../../lib/db';
import invoiceItemsSchema from '../../schemas/invoice-items-schema.json';
import { ColumnMapper } from './ColumnMapper';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const ajv = new Ajv2020({ allErrors: true, useDefaults: true });
addFormats(ajv);
const validateInvoiceItems = ajv.compile(invoiceItemsSchema);

interface ExcelImportProps {
    onImportComplete?: () => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImportComplete }) => {
    const [isImporting, setIsImporting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    // Mapping State
    const [mapperOpen, setMapperOpen] = useState(false);
    // pendingRawData and pendingSheetName removed as they were unused
    const [pendingFileColumns, setPendingFileColumns] = useState<string[]>([]);
    const [workbookCache, setWorkbookCache] = useState<XLSX.WorkBook | null>(null);

    // Persisted Mappings: Key = SourceColumns.sort().join('|') -> Value = MappingObject
    const [savedMappings, setSavedMappings] = useLocalStorage<Record<string, Record<string, string>>>('excel_mappings', {});

    const requiredFields = invoiceItemsSchema.items.required || [];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setStatus('idle');
        setMessage('Processing file...');
        setErrors([]);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    setWorkbookCache(workbook);

                    await processWorkbook(workbook);
                } catch (err: any) {
                    console.error(err);
                    setStatus('error');
                    setMessage(`Import failed: ${err.message}`);
                    setIsImporting(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(`File reading failed: ${err.message}`);
            setIsImporting(false);
        }
    };

    const processWorkbook = async (workbook: XLSX.WorkBook, manualMapping?: Record<string, string>) => {
        let kpis: any[] = [];
        let events: any[] = [];
        let invoiceItems: any[] = [];

        // 1. Identify Sheets
        workbook.SheetNames.forEach(sheetName => {
            const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (rawData.length === 0) return;

            const lowerName = sheetName.toLowerCase();

            // Heuristics
            if (lowerName.includes('kpi')) {
                kpis = convertDates(rawData);
            } else if (lowerName.includes('event') || lowerName.includes('operation')) {
                events = convertDates(rawData);
            } else if (lowerName.includes('invoice') || lowerName.includes('cost') || lowerName.includes('spend') || invoiceItems.length === 0) {
                // This is our candidate for Invoice Items
                // Only process one candidate for now to avoid confusion
                if (invoiceItems.length === 0) {
                    invoiceItems = rawData; // Keep raw for now
                }
            }
        });

        // 2. Check Mapping for Invoice Items
        if (invoiceItems.length > 0) {
            const firstRow = invoiceItems[0];
            const columns = Object.keys(firstRow);
            const missingRequired = requiredFields.filter(field => !columns.includes(field));

            // Logic:
            // A. If manualMapping provided -> apply it
            // B. If no missing required fields -> proceed as standard
            // C. If missing fields -> check saved mappings -> apply if found
            // D. Else -> trigger Mapper UI

            let finalData = invoiceItems;

            if (manualMapping) {
                finalData = applyMapping(invoiceItems, manualMapping);
            } else if (missingRequired.length > 0) {
                // Check saved mapping
                const mappingKey = [...columns].sort().join('|');
                const savedMap = savedMappings[mappingKey];

                if (savedMap) {
                    console.log('Applying saved mapping', savedMap);
                    finalData = applyMapping(invoiceItems, savedMap);
                } else {
                    // Trigger UI
                    setPendingFileColumns(columns);
                    setMapperOpen(true);
                    return; // Stop here, wait for user
                }
            }

            // Convert dates on finalized data
            invoiceItems = convertDates(finalData);
        }

        // 3. Validation & Insert
        await performImport(invoiceItems, kpis, events);
    };

    const convertDates = (data: any[]) => {
        return data.map(row => {
            const newRow = { ...row };
            for (const key in newRow) {
                if (newRow[key] instanceof Date) {
                    newRow[key] = newRow[key].toISOString().split('T')[0];
                }
            }
            return newRow;
        });
    };

    const applyMapping = (data: any[], mapping: Record<string, string>) => {
        return data.map(row => {
            const newRow: any = {};
            // 1. Copy over fields that already match standard keys (optional overlap)
            Object.keys(row).forEach(key => {
                if (!Object.values(mapping).includes(key)) {
                    // heuristic: keep property if it matches a schema key that wasn't mapped?
                    // Safe bet: just copy everything, but mapped keys take precedence if conflict?
                    // Actually, we usually construct ONLY the target schema.
                    // But we might want to keep extra props.
                    newRow[key] = row[key];
                }
            });

            // 2. Apply mapping
            Object.entries(mapping).forEach(([target, source]) => {
                if (row[source] !== undefined) {
                    newRow[target] = row[source];
                }
            });
            return newRow;
        });
    };

    const performImport = async (invoiceItems: any[], kpis: any[], events: any[]) => {
        // Validation for Invoice Items
        if (invoiceItems.length > 0) {
            const isValid = validateInvoiceItems(invoiceItems);
            if (!isValid) {
                setStatus('error');
                setMessage('Validation failed for Invoice Items.');
                setErrors(validateInvoiceItems.errors?.map(err =>
                    `${err.instancePath} ${err.message}${err.params ? ' (' + JSON.stringify(err.params) + ')' : ''}`
                ) || []);
                setIsImporting(false);
                return;
            }
        }

        try {
            await clearDatabase();

            if (invoiceItems.length > 0) await bulkInsertInvoiceItems(invoiceItems);
            if (kpis.length > 0) await bulkInsertKPIs(kpis);
            if (events.length > 0) await bulkInsertEvents(events);

            setStatus('success');
            setMessage(`Successfully imported ${invoiceItems.length} invoice items, ${kpis.length} KPIs and ${events.length} events.`);
            window.dispatchEvent(new Event('db-updated'));
            if (onImportComplete) onImportComplete();
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(`Import failed: ${err.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    const handleMappingConfirm = async (mapping: Record<string, string>) => {
        setMapperOpen(false);
        setIsImporting(true);
        setMessage('Applying mapping...');

        // Save mapping
        const mappingKey = [...pendingFileColumns].sort().join('|');
        setSavedMappings(prev => ({ ...prev, [mappingKey]: mapping }));

        // Resume process
        if (workbookCache) {
            // We need to re-run processWorkbook but FORCE the mapping for the pending sheet
            // Actually, processWorkbook logic is "if manualMapping... apply it".
            // But processWorkbook iterates all sheets. 
            // Simplification: We know we paused at 'pendingSheetName'.
            // We can just call applyMapping here and then performImport.
            // But we need the KPIs and Events from the workbook again.
            // Easier to just call processWorkbook with the manual mapping.
            await processWorkbook(workbookCache, mapping);
        }
    };

    return (
        <div className="space-y-4">
            {mapperOpen && (
                <ColumnMapper
                    sourceColumns={pendingFileColumns}
                    onConfirm={handleMappingConfirm}
                    onCancel={() => {
                        setMapperOpen(false);
                        setIsImporting(false);
                        setStatus('idle');
                    }}
                />
            )}

            <div className="relative">
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="excel-upload"
                />
                <label
                    htmlFor="excel-upload"
                    className={`
                        flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl transition-all
                        ${isImporting ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}
                    `}
                >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {isImporting ? 'Importing...' : 'Click or drag Excel/CSV file here'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Sheets should contain columns: metric, value, category, date
                        </p>
                    </div>
                </label>
            </div>

            {status !== 'idle' && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${status === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                    {status === 'success' ? <Check className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                    <div className="text-sm font-medium">{message}</div>
                </div>
            )}

            {status === 'error' && errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold mb-2">
                        <AlertCircle className="w-4 h-4 ml-0.5" />
                        <span>Detailed Validation Errors ({errors.length})</span>
                    </div>
                    <ul className="space-y-1 max-h-40 overflow-auto">
                        {errors.slice(0, 10).map((err, i) => (
                            <li key={i} className="text-xs text-red-600 dark:text-red-400 font-mono">
                                • {err}
                            </li>
                        ))}
                        {errors.length > 10 && (
                            <li className="text-xs text-red-500 italic">
                                ... and {errors.length - 10} more errors
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
