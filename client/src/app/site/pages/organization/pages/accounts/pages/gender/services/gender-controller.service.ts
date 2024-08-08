import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Gender } from 'src/app/domain/models/gender/gender';
import { GenderRepositoryService } from 'src/app/gateways/repositories/gender/gender-repository.service';
import { BaseController } from 'src/app/site/base/base-controller';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';

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

    public create(...models: Partial<Gender>[]): Promise<Identifiable[]> {
        return this.repo.create(...models);
    }

    public update(update: Partial<Gender>, viewGenderId: Id): Promise<void> {
        return this.repo.update(update, viewGenderId);
    }

    public delete(...ids: Id[]): Promise<void> {
        return this.repo.delete(...ids);
    }
}
