import { parse, format, isValid } from 'date-fns';

export interface Transformer {
    id: string;
    label: string;
    description: string;
    apply: (value: any) => any;
}

export const transformers: Record<string, Transformer[]> = {
    'Period': [
        {
            id: 'MMM.YYYY',
            label: 'MMM.YYYY (e.g. 001.2025)',
            description: 'Converts 001.2025 to 2025-01',
            apply: (value: any) => {
                if (typeof value !== 'string') return value;
                const match = value.match(/^(\d{3})\.(\d{4})$/);
                if (match) {
                    const month = parseInt(match[1], 10);
                    const year = match[2];
                    return `${year}-${month.toString().padStart(2, '0')}`;
                }
                return value;
            }
        },
        {
            id: 'YYYY-MM',
            label: 'YYYY-MM (ISO)',
            description: 'Standard ISO format',
            apply: (value: any) => value // Identity
        },
        {
            id: 'MM.YYYY',
            label: 'MM.YYYY / MM-YYYY (e.g. 01.2025)',
            description: 'Converts 01.2025 or 01-2025 to 2025-01',
            apply: (value: any) => {
                if (typeof value !== 'string') return value;
                const match = String(value).trim().match(/^(\d{1,2})[.-](\d{4})$/);
                if (match) {
                    const month = parseInt(match[1], 10);
                    const year = match[2];
                    return `${year}-${month.toString().padStart(2, '0')}`;
                }
                return value;
            }
        }
    ],
    'PostingDate': [
        {
            id: 'DD.MM.YYYY',
            label: 'DD.MM.YYYY',
            description: 'German date format',
            apply: (value: any) => {
                if (typeof value !== 'string') return value;
                // Basic check to avoid re-parsing ISO
                if (value.match(/^\d{4}-\d{2}-\d{2}$/)) return value;

                const parsed = parse(value, 'dd.MM.yyyy', new Date());
                if (isValid(parsed)) {
                    return format(parsed, 'yyyy-MM-dd');
                }
                return value;
            }
        },
        {
            id: 'MM/DD/YYYY',
            label: 'MM/DD/YYYY',
            description: 'US date format',
            apply: (value: any) => {
                if (typeof value !== 'string') return value;
                const parsed = parse(value, 'MM/dd/yyyy', new Date());
                if (isValid(parsed)) {
                    return format(parsed, 'yyyy-MM-dd');
                }
                return value;
            }
        },
        {
            id: 'ExcelSerial',
            label: 'Excel Serial Number',
            description: 'Number like 45321',
            apply: (value: any) => {
                // If value is number or numeric string
                const num = Number(value);
                if (!isNaN(num) && num > 20000) { // arbitrary lower bound check
                    // Excel base date: Dec 30 1899
                    const date = new Date((num - 25569) * 86400 * 1000);
                    return format(date, 'yyyy-MM-dd');
                }
                return value;
            }
        }
    ]
};

export const applyTransform = (value: any, transformId: string, fieldType: string) => {
    const list = transformers[fieldType];
    if (!list) return value;
    const transformer = list.find(t => t.id === transformId);
    return transformer ? transformer.apply(value) : value;
};
