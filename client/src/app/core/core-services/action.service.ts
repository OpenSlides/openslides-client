import { Injectable } from '@angular/core';

import { HttpService } from './http.service';

/**
 * Currently supported actions
 */
export enum ActionType {
    TOPIC_CREATE = 'topic.create',
    TOPIC_DELETE = 'topic.delete',
    TOPIC_UPDATE = 'topic.update',
    AGENDA_ITEM_CREATE = 'agenda_item.create',
    AGENDA_ITEM_UPDATE = 'agenda_item.update',
    AGENDA_ITEM_DELETE = 'agenda_item.delete',
    AGENDA_ITEM_NUMBERING = 'agenda_item.numbering',
    AGENDA_ITEM_SORT = 'agenda_item.sort',
    MOTION_UPDATE = 'motion.update',
    MOTION_DELETE = 'motion.delete',
    MOTION_SORT = 'motion.sort',
    MOTION_UPDATE_METADATA = 'motion.update_metadata',
    MOTION_BLOCK_CREATE = 'motion_block.create',
    MOTION_BLOCK_UPDATE = 'motion_block.update',
    MOTION_BLOCK_DELETE = 'motion_block.delete',
    MOTION_CHANGE_RECOMMENDATION_CREATE = 'motion_change_recommendation.create',
    MOTION_CHANGE_RECOMMENDATION_UPDATE = 'motion_change_recommendation.update',
    MOTION_CHANGE_RECOMMENDATION_DELETE = 'motion_change_recommendation.delete',
    MOTION_COMMENT_CREATE = 'motion_comment.create',
    MOTION_COMMENT_UPDATE = 'motion_comment.update',
    MOTION_COMMENT_DELETE = 'motion_comment.delete',
    MOTION_COMMENT_SECTION_CREATE = 'motion_comment_section.create',
    MOTION_COMMENT_SECTION_UPDATE = 'motion_comment_section.update',
    MOTION_COMMENT_SECTION_DELETE = 'motion_comment_section.delete',
    MOTION_COMMENT_SECTION_SORT = 'motion_comment_section.sort',
    MOTION_STATE_CREATE = 'motion_state.create',
    MOTION_STATE_UPDATE = 'motion_state.update',
    MOTION_STATE_DELETE = 'motion_state.delete',
    MOTION_WORKFLOW_CREATE = 'motion_workflow.create',
    MOTION_WORKFLOW_UPDATE = 'motion_workflow.update',
    MOTION_WORKFLOW_DELETE = 'motion_workflow.delete',
    COMMITEE_CREATE = 'commitee.create',
    MEETING_CREATE = 'meeting.create',
    MEETING_UPDATE = 'meeting.update',
    MEETING_DELETE = 'meeting.delete',
    SPEAKER_CREATE = 'speaker.create',
    SPEAKER_UPDATE = 'speaker.update',
    SPEAKER_DELETE = 'speaker.delete'
}

export interface RequestInfo {
    action: ActionType;
    data: any;
}

@Injectable({
    providedIn: 'root'
})
export class ActionService {
    private readonly ACTION_URL = '/system/action/handle_request';

    private constructor(private http: HttpService) {}

    public async sendRequest<T>(action: ActionType, data: any): Promise<T> {
        return this._sendRequest({ action, data: [data] });
    }

    public async sendBulkRequest<T>(action: ActionType, data: any[]): Promise<T> {
        return this._sendRequest({ action, data });
    }

    private async _sendRequest<T>(request: RequestInfo): Promise<T> {
        return await this.http.post<T>(this.ACTION_URL, [request]);
    }
}
