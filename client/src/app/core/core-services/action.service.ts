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

export type RequestData = any;

export interface RequestInfo<T> {
    action: ActionType;
    // data: (keyof T)[];
    data: RequestData;
}

@Injectable({
    providedIn: 'root'
})
export class ActionService {
    private readonly BACKEND_URL = '/system/action/handle_request';

    private constructor(private http: HttpService) {}

    public async sendRequest<T>(action: ActionType, data: RequestData[]): Promise<T> {
        const request: RequestInfo<T>[] = [
            {
                action,
                data
            }
        ];
        return await this.http.post<T>(this.BACKEND_URL, request);
    }

    public async create(collection: string, data: RequestData): Promise<any> {
        return await this.sendRequest(`${collection}.create` as ActionType, [data]);
    }

    public async update(collection: string, data: RequestData): Promise<any> {
        return await this.sendRequest(`${collection}.update` as ActionType, [data]);
    }

    public async delete(collection: string, id: string | number): Promise<any> {
        return await this.sendRequest(`${collection}.delete` as ActionType, [{ id }]);
    }

    public async testRequest(): Promise<void> {
        const r = await this.create('topic', { meeting_id: 1, title: 'Test' });
        console.log(r);
    }
}
