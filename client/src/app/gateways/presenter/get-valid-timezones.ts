import { Injectable } from '@angular/core';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

type ValidTimeZones = Record<string, string>;

@Injectable({
    providedIn: `root`
})
export class GetValidTimezonesPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(): Promise<ValidTimeZones> {
        const response = await this.presenter.call<ValidTimeZones>(Presenter.GET_VALID_TIMEZONES, {});
        return response;
    }
}
