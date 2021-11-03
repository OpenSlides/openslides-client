import { Injectable } from '@angular/core';

import { HttpService } from './http.service';

const PRESENTER_URL = `/system/presenter/handle_request`;

export enum Presenter {
    SERVERTIME = `server_time`,
    GET_USERS = `get_users`,
    GET_USER_RELATED_MODELS = `get_user_related_models`,
    GET_FORWARDING_MEETINGS = `get_forwarding_meetings`
}

@Injectable({
    providedIn: `root`
})
export class PresenterService {
    public constructor(private readonly http: HttpService) {}

    public async call<R, D = any>(presenter: Presenter, data?: D): Promise<R> {
        const result = await this.http.post<R[]>(PRESENTER_URL, [{ presenter, data }]);
        if (result?.length !== 1) {
            throw new Error(`The presenter service has returned a wrong format`);
        }
        return result[0];
    }
}
