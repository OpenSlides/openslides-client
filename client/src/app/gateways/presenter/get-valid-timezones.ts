import { inject, Service } from '@angular/core';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

type ValidTimeZones = Record<string, string>;

@Service()
export class GetValidTimezonesPresenterService {
    private presenter = inject(PresenterService);

    public async call(): Promise<ValidTimeZones> {
        const response = await this.presenter.call<ValidTimeZones>(Presenter.GET_VALID_TIMEZONES, {});
        return response;
    }
}
