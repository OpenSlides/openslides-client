import { inject, Service } from '@angular/core';

import { HttpService } from '../http.service';
import { Presenter } from './presenter';

const PRESENTER_URL = `/system/presenter/handle_request`;

@Service()
export class PresenterService {
    private readonly http = inject(HttpService);

    public async call<R, D = any>(presenter: Presenter, data?: D): Promise<R> {
        const result = await this.http.post<R[]>(PRESENTER_URL, [{ presenter, data }]);
        if (result?.length !== 1) {
            throw new Error(`The presenter service has returned a wrong format`);
        }
        return result[0];
    }
}
