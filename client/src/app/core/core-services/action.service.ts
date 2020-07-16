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
    MOTION_UPDATE = 'motion.update',
    MOTION_DELETE = 'motion.delete',
    MOTION_SORT = 'motion.sort',
    MOTION_UPDATE_METADATA = 'motion.update_metadata',
    COMMITEE_CREATE = 'commitee.create',
    MEETING_CREATE = 'meeting.create',
    MEETING_UPDATE = 'meeting.update',
    MEETING_DELETE = 'meeting.delete'
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
