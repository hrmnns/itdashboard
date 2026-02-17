import { runQuery, notifyDbChange, toggleWorklist } from '../db';
import type { WorklistEntry, WorklistStatus } from '../../types';

export const WorklistRepository = {
    async getAll(): Promise<WorklistEntry[]> {
        return await runQuery(`
            SELECT * FROM worklist 
            ORDER BY added_at DESC
        `) as unknown as WorklistEntry[];
    },

    async getCount(): Promise<number> {
        const result = await runQuery("SELECT COUNT(*) as count FROM worklist WHERE status = 'open'");
        return (result[0]?.count as number) || 0;
    },

    /**
     * Toggles an item in the worklist (Add if not exists, remove if exists)
     */
    async toggle(sourceTable: string, sourceId: number, label?: string, context?: string): Promise<void> {
        await toggleWorklist(sourceTable, sourceId, label, context);
    },

    async isInWorklist(sourceTable: string, sourceId: number): Promise<boolean> {
        const result = await runQuery(
            'SELECT id FROM worklist WHERE source_table = ? AND source_id = ?',
            [sourceTable, sourceId]
        );
        return result.length > 0;
    },

    async updateStatus(sourceTable: string, sourceId: number, status: WorklistStatus): Promise<void> {
        await runQuery(
            'UPDATE worklist SET status = ? WHERE source_table = ? AND source_id = ?',
            [status, sourceTable, sourceId]
        );
        notifyDbChange();
    },

    async getStatusCounts(): Promise<Record<WorklistStatus, number>> {
        const rows = await runQuery(`
            SELECT status, COUNT(*) as count 
            FROM worklist 
            GROUP BY status
        `);

        const counts: Record<WorklistStatus, number> = {
            open: 0,
            ok: 0,
            error: 0,
            clarification: 0
        };

        rows.forEach((row: any) => {
            if (row.status in counts) {
                counts[row.status as WorklistStatus] = row.count;
            }
        });

        return counts;
    }
};
