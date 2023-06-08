import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Projector } from 'src/app/domain/models/projector/projector';
import { MeetingRepositoryService } from 'src/app/gateways/repositories/meeting-repository.service';
import { ScrollScaleDirection } from 'src/app/gateways/repositories/projectors/projector.action';
import { ProjectorRepositoryService } from 'src/app/gateways/repositories/projectors/projector-repository.service';

import { BaseMeetingControllerService } from '../../../base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '../../../services/meeting-controller-service-collector.service';
import { isProjectable, Projectable, ProjectionBuildDescriptor } from '../../../view-models';
import { ViewProjection, ViewProjector } from '../view-models';

@Injectable({
    providedIn: `root`
})
export class ProjectorControllerService extends BaseMeetingControllerService<ViewProjector, Projector> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: ProjectorRepositoryService,
        private meetingRepo: MeetingRepositoryService
    ) {
        super(controllerServiceCollector, Projector, repo);
    }

    public create(payload: any): Promise<Identifiable> {
        return this.repo.create(payload);
    }

    public update(payload: any, projector: Identifiable): Promise<void> | Promise<[void, void]> {
        if (payload.projectiondefault_ids) {
            const defaultsPromise = this.updateProjectordefaults(payload.projectiondefault_ids);
            delete payload[`projectiondefault_ids`];
            const updatePromise = this.repo.update(payload, projector);
            return Promise.all([updatePromise, defaultsPromise]);
        } else {
            return this.repo.update(payload, projector);
        }
    }

    public delete(projector: Identifiable): Promise<void> {
        return this.repo.delete(projector);
    }

    public async setReferenceProjector(projector: Identifiable): Promise<void> {
        await this.update({ is_internal: false }, projector);
        return this.meetingRepo.update({ reference_projector_id: projector.id }, this.activeMeetingService.meeting!);
    }

    public scale(projector: Identifiable, direction: ScrollScaleDirection, step: number): Promise<void> {
        return this.repo.scale(projector, direction, step);
    }

    public next(projector: Identifiable): Promise<void> {
        return this.repo.next(projector);
    }

    public previous(projector: Identifiable): Promise<void> {
        return this.repo.previous(projector);
    }

    public sortPreview(projector: Identifiable, projectionIds: Ids): Promise<void> {
        return this.repo.sortPreview(projector, projectionIds);
    }

    public projectPreview(projection: Identifiable): Promise<void> {
        return this.repo.projectPreview(projection);
    }

    public scroll(projector: Identifiable, direction: ScrollScaleDirection, step: number): Promise<void> {
        return this.repo.scroll(projector, direction, step);
    }

    public project(
        descriptor: ProjectionBuildDescriptor,
        projectors: ViewProjector[],
        options: any = null
    ): Promise<void> {
        return this.repo.project(descriptor, projectors, options);
    }

    public addToPreview(
        descriptor: ProjectionBuildDescriptor,
        projectors: ViewProjector[],
        options: any = null
    ): Promise<void> {
        return this.repo.addToPreview(descriptor, projectors, options);
    }

    public toggle(
        descriptor: ProjectionBuildDescriptor,
        projectors: ViewProjector[],
        options: any = null
    ): Promise<void> {
        return this.repo.toggle(descriptor, projectors, options);
    }

    public getGeneralViewModelObservable(): Observable<ViewProjector> {
        return this.repo.getGeneralViewModelObservable();
    }

    public getReferenceProjectorObservable(): Observable<ViewProjector | undefined> {
        return this.repo.getReferenceProjectorObservable();
    }

    public getReferenceProjector(): ViewProjector | undefined {
        return this.repo.getReferenceProjector();
    }

    public ensureDescriptor(obj: ProjectionBuildDescriptor | Projectable): ProjectionBuildDescriptor {
        return (
            isProjectable(obj) ? obj.getProjectionBuildDescriptor(this.meetingSettingsService) : obj
        ) as ProjectionBuildDescriptor;
    }

    /**
     * Checks if a given descriptor is projected.
     *
     * @returns true, if the descriptor is projected on one projector.
     */
    public isProjected(obj: ProjectionBuildDescriptor | Projectable): boolean {
        const descriptor = this.ensureDescriptor(obj);
        const projectors = this.activeMeetingService.meeting?.projectors || [];
        return projectors.some(projector => this.isProjectedOn(descriptor, projector));
    }

    /**
     * Checks, if the object is projected on the given projector.
     *
     * @returns true, if the object is projected on the projector.
     */
    public isProjectedOn(obj: ProjectionBuildDescriptor | Projectable | null, projector: ViewProjector): boolean {
        if (!obj) {
            return false;
        }
        const descriptor = this.ensureDescriptor(obj);
        return projector.current_projections.some(projection => projection.isEqualToDescriptor(descriptor));
    }

    public getMatchingProjectionsFromProjector(
        obj: ProjectionBuildDescriptor | Projectable,
        projector: ViewProjector
    ): ViewProjection[] {
        const descriptor = this.ensureDescriptor(obj);
        return projector.current_projections.filter(projection => projection.isEqualToDescriptor(descriptor));
    }

    public getProjectorsWhichAreProjecting(obj: ProjectionBuildDescriptor | Projectable): ViewProjector[] {
        const descriptor = this.ensureDescriptor(obj);
        return (
            this.activeMeetingService.meeting?.projectors.filter(projector => {
                if (projector) {
                    return this.isProjectedOn(descriptor, projector);
                }
                return null;
            }) || []
        );
    }

    private async updateProjectordefaults(defaultKeys: { [key: string]: number[] }): Promise<void> {
        if (Object.keys(defaultKeys).length) {
            return this.meetingRepo.update({ id: this.activeMeetingId, default_projector_$_ids: defaultKeys });
        }
        return;
    }
}
