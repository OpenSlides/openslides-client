import { Fqid, Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export class HistoryEntry extends BaseModel {
    public static readonly COLLECTION = `history_entry`;
    public entries!: string[];
    public position_id!: Id;
    public original_model_id!: string;
    public model_id?: Fqid;
    public meeting_id?: Id;

    public constructor(input?: Partial<HistoryEntry>) {
        super(HistoryEntry.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof HistoryEntry)[] = [
        `id`,
        `entries`,
        `original_model_id`,
        `model_id`,
        `position_id`,
        `meeting_id`
    ];
}

export interface HistoryEntry {}
