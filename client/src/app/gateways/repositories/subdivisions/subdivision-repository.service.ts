import { Injectable } from '@angular/core';

import { Identifiable } from '../../../domain/interfaces';
import { Subdivision } from '../../../domain/models/subdivisions/subdivision';
import { ViewSubdivision } from '../../../site/pages/organization/pages/account/pages/subdivisions/view-models/view-subdivision';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { SubdivisionAction } from './subdivision.action';

@Injectable({
    providedIn: `root`
})
export class SubdivisionRepositoryService extends BaseRepository<ViewSubdivision, Subdivision> {
    public constructor(serviceCollector: RepositoryServiceCollectorService) {
        super(serviceCollector, Subdivision);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Subdivisions` : `Subdivision`);
    public getTitle = (viewModel: ViewSubdivision): string => viewModel.name;

    public async create(...subdivisions: Partial<Subdivision>[]): Promise<Identifiable[]> {
        const payload = subdivisions.map(subdivision => ({
            name: subdivision.name,
            color: subdivison.color,
            allow_additional_time: subdivison.allow_additional_time
        }));
        return this.sendBulkActionToBackend(SubdivisionAction.CREATE, payload);
    }

    public async update(update: Partial<Subdivision>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            name: viewModel.name,
            color: viewModel.color,
            allow_additional_time: viewModel.allow_additional_time
        };
        return this.sendActionToBackend(SubdivisionAction.UPDATE, payload);
    }

    public async delete(...subdivisions: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = subdivisions.map(subdivision => ({ id: subdivision.id }));
        return this.sendBulkActionToBackend(SubdivisionAction.DELETE, payload);
    }
}
