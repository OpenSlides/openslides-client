import { Injectable } from '@angular/core';

import { HttpService } from './http.service';

export interface RequestInfo {
    action: string;
    data: any;
}

@Injectable({
    providedIn: 'root'
})
export class ActionService {
    private readonly ACTION_URL = '/system/action/handle_request';

    private constructor(private http: HttpService) {}

    public async sendRequest<T>(action: string, data: any): Promise<T> {
        return this._sendRequest({ action, data: [data] });
    }

    public async sendBulkRequest<T>(action: string, data: any[]): Promise<T> {
        return this._sendRequest({ action, data });
    }

    private async _sendRequest<T>(request: RequestInfo): Promise<T> {
        return await this.http.post<T>(this.ACTION_URL, [request]);
    }
}
