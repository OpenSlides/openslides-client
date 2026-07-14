import { Injectable } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Gender } from '@app/domain/models/gender/gender';
import { GenderRepositoryService } from '@app/gateways/repositories/gender/gender-repository.service';
import { BaseController } from '@app/site/base/base-controller';
import { ControllerServiceCollectorService } from '@app/site/services/controller-service-collector.service';

import { ViewGender } from '../view-models/view-gender';

@Injectable({
    providedIn: `root`
})
export class GenderControllerService extends BaseController<ViewGender, Gender> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: GenderRepositoryService
    ) {
        super(controllerServiceCollector, Gender, repo);
    }

    public create(...models: Partial<Gender>[]): void {
        this.repo.create(...models).resolve();
    }

    public update(update: Partial<Gender>, viewGenderId: Id): void {
        this.repo.update(update, viewGenderId).resolve();
    }

    public delete(...ids: Id[]): Promise<void | void[]> {
        return this.repo.delete(...ids).resolve();
    }
}
