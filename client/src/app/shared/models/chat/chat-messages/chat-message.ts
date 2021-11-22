import { Id, UnsafeHtml } from 'app/core/definitions/key-types';
import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';

import { BaseModel } from '../../base/base-model';
export class ChatMessage extends BaseModel<ChatMessage> implements HasMeetingId {
    public static readonly COLLECTION = `chat_message`;

    public id: Id;
    public readonly meeting_id: Id;

    public readonly created: number; // in seconds
    public readonly content: UnsafeHtml;

    public readonly user_id: Id; // (user/chat_message_ids)
    public readonly chat_group_id: Id; // (chat_group/chat_message_ids)

    public constructor(input?: Partial<ChatMessage>) {
        super(ChatMessage.COLLECTION, input);
    }
}
