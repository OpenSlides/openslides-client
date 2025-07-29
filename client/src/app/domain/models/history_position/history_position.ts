import { Id, Ids } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export class HistoryPosition extends BaseModel {
    public static readonly COLLECTION = `history_position`;
    public timestamp!: number;
    public entry_ids!: Ids;
    public original_user_id!: number;
    public user_id?: Id;

    public constructor(input?: Partial<HistoryPosition>) {
        super(HistoryPosition.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof HistoryPosition)[] = [
        `id`,
        `timestamp`
    ];
}

export interface HistoryPosition {}
