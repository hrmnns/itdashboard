import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Search, ChevronRight, Calendar, Calculator, Type, Cpu, Database } from 'lucide-react';
import { SQL_SNIPPETS } from '../lib/constants/SqlSnippets';

interface SqlAssistantProps {
    onSelectSnippet: (sql: string) => void;
    tableName?: string;
    columns?: { name: string; type: string }[];
}

export const SqlAssistant: React.FC<SqlAssistantProps> = ({ onSelectSnippet, tableName, columns }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = [
        { id: 'schema', label: t('sql_assistant.cat_schema', 'Schema'), icon: <Database className="w-3.5 h-3.5" /> },
        { id: 'date', label: t('sql_assistant.cat_date', 'Dates'), icon: <Calendar className="w-3.5 h-3.5" /> },
        { id: 'aggregation', label: t('sql_assistant.cat_aggregation', 'Aggregations'), icon: <Calculator className="w-3.5 h-3.5" /> },
        { id: 'formatting', label: t('sql_assistant.cat_formatting', 'Formatting'), icon: <Type className="w-3.5 h-3.5" /> },
        { id: 'advanced', label: t('sql_assistant.cat_advanced', 'Advanced'), icon: <Cpu className="w-3.5 h-3.5" /> },
    ];

    const schemaSnippets = tableName ? [
        {
            id: 'schema-select-all',
            label: `Select All from ${tableName}`,
            description: `Basic select all from the current table`,
            sql: `SELECT * FROM ${tableName} LIMIT 10`,
            category: 'schema'
        },
        {
            id: 'schema-count',
            label: `Count Rows in ${tableName}`,
            description: `Simple row count`,
            sql: `SELECT COUNT(*) as total FROM ${tableName}`,
            category: 'schema'
        },
        ...(columns && columns.length > 0 ? [
            {
                id: 'schema-select-cols',
                label: `Select Columns`,
                description: `Select specific columns from ${tableName}`,
                sql: `SELECT ${columns.slice(0, 3).map(c => c.name).join(', ')} FROM ${tableName} LIMIT 10`,
                category: 'schema'
            },
            {
                id: 'schema-group',
                label: `Group by First Column`,
                description: `Aggregation group by ${columns[0].name}`,
                sql: `SELECT ${columns[0].name}, COUNT(*) as count FROM ${tableName} GROUP BY ${columns[0].name} ORDER BY count DESC`,
                category: 'schema'
            }
        ] : [])
    ] : [];

    const allSnippets = [...schemaSnippets, ...SQL_SNIPPETS];

    const filteredSnippets = allSnippets.filter(s => {
        const matchesSearch = s.label.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase());
        const matchesCat = !selectedCategory || s.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="relative">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && tableName) setSelectedCategory('schema');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
                <Sparkles className={`w-3.5 h-3.5 ${isOpen ? 'animate-pulse' : ''}`} />
                {t('sql_assistant.title', 'Assistant')}
                {tableName && <span className="ml-1 px-1 bg-blue-500/20 text-[8px] rounded uppercase">{tableName}</span>}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    autoFocus
                                    placeholder={t('sql_assistant.search', 'Search patterns...')}
                                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase transition-colors ${!selectedCategory ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t('common.all', 'All')}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase transition-colors flex items-center justify-center gap-1 ${selectedCategory === cat.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title={cat.label}
                                >
                                    {cat.icon}
                                </button>
                            ))}
                        </div>

                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {filteredSnippets.map(snippet => (
                                <button
                                    key={snippet.id}
                                    onClick={() => {
                                        onSelectSnippet(snippet.sql);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{snippet.label}</span>
                                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{snippet.description}</p>
                                    <code className="block mt-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded text-[9px] font-mono text-slate-400 dark:text-slate-500 truncate">
                                        {snippet.sql}
                                    </code>
                                </button>
                            ))}
                            {filteredSnippets.length === 0 && (
                                <div className="p-8 text-center text-slate-400">
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">{t('sql_assistant.no_results', 'No matches')}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-top border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                            <span className="text-[9px] font-medium text-slate-400 italic">
                                {t('sql_assistant.hint', 'Click to insert into editor')}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
