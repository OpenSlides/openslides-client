import { Injectable } from '@angular/core';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface CheckDatabasePresenterResult {
    ok: boolean;
    errors: string;
}

@Injectable({
    providedIn: `root`
})
export class CheckDatabasePresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(): Promise<CheckDatabasePresenterResult> {
        return await this.presenter.call<CheckDatabasePresenterResult>(Presenter.CHECK_DATABASE, {});
    }
}
