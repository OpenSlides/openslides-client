import { Injectable } from '@angular/core';

import { Identifiable } from '../../../domain/interfaces';
import { Subdivision } from '../../../domain/models/subdivisions/subdivision';
import { ViewSubdivision } from '../../../site/pages/organization/pages/accounts/pages/subdivisions/view-models/view-subdivision';
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
            color: subdivision.color,
            allow_additional_time: subdivision.allow_additional_time
        }));
        return this.sendBulkActionToBackend(SubdivisionAction.CREATE, payload);
    }

    public async update(update: Partial<Subdivision>, viewModel: Identifiable): Promise<void> {
        const payload = {
            id: viewModel.id,
            name: update.name,
            color: update.color,
            allow_additional_time: update.allow_additional_time
        };
        return this.sendActionToBackend(SubdivisionAction.UPDATE, payload);
    }

    public async delete(...subdivisions: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = subdivisions.map(subdivision => ({ id: subdivision.id }));
        return this.sendBulkActionToBackend(SubdivisionAction.DELETE, payload);
    }
}
