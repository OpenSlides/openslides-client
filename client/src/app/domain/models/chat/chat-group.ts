import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class ChatGroup extends BaseModel<ChatGroup> implements HasMeetingId {
    public static readonly COLLECTION = `chat_group`;

    public readonly name!: string;
    public readonly meeting_id!: Id;
    public readonly weight!: number;

    public readonly chat_message_ids!: Id[]; // (chat_message/chat_group_id)[]
    public readonly read_group_ids!: Id[]; // (group/read_chat_group_id)[]
    public readonly write_group_ids!: Id[]; // (group/write_chat_group_id)[]

    public constructor(input?: Partial<ChatGroup>) {
        super(ChatGroup.COLLECTION, input);
    }
}

export interface ChatGroup {}
