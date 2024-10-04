import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Gender } from 'src/app/domain/models/gender/gender';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { ViewGender } from 'src/app/site/pages/organization/pages/accounts/pages/gender/view-models/view-gender';
import { Fieldsets } from 'src/app/site/services/model-request-builder';

import { Action } from '../../actions';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { GenderAction } from './gender.action';

@Injectable({
    providedIn: `root`
})
export class GenderRepositoryService extends BaseRepository<ViewGender, Gender> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollectorService) {
        super(repositoryServiceCollector, Gender);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Genders` : `Gender`);
    public getTitle = (viewModel: ViewGender): string => viewModel.name;
    public override getFieldsets(): Fieldsets<any> {
        const baseFields: (keyof Gender)[] = [];
        const requiredFields: (keyof Gender)[] = baseFields.concat([`name`]);
        return {
            ...super.getFieldsets(),
            required: requiredFields
        };
    }

    public create(...genders: any[]): Action<Identifiable[]> {
        const payload = genders;
        return this.createAction(GenderAction.CREATE, payload);
    }

    public update(update: any, id: Id): Action<void> {
        const payload = {
            id,
            ...update
        };
        return this.createAction(GenderAction.UPDATE, payload);
    }

    public delete(...ids: Id[]): Action<void> {
        const payload = ids.map(id => ({ id }));
        return this.createAction(GenderAction.DELETE, payload);
    }
}
