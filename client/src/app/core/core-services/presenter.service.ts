import { Injectable } from '@angular/core';

import { HttpService } from './http.service';

const PRESENTER_URL = `/system/presenter/handle_request`;

export enum Presenter {
    SERVERTIME = `server_time`,
    GET_USERS = `get_users`,
    GET_ACTIVE_USER_AMOUNT = `get_active_users_amount`,
    GET_USER_RELATED_MODELS = `get_user_related_models`,
    GET_FORWARDING_MEETINGS = `get_forwarding_meetings`,
    SEARCH_USERS_BY_NAME_OR_EMAIL = `search_users_by_name_or_email`
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
