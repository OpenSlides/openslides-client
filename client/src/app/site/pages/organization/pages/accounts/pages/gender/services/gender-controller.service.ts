import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Gender } from '@app/domain/models/gender/gender';
import { GenderRepositoryService } from '@app/gateways/repositories/gender/gender-repository.service';
import { BaseController } from '@app/site/base/base-controller';

import { ViewGender } from '../view-models/view-gender';

@Service()
export class GenderControllerService extends BaseController<ViewGender, Gender> {
    protected repo: GenderRepositoryService = inject(GenderRepositoryService);

    public constructor() {
        super(Gender);
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
