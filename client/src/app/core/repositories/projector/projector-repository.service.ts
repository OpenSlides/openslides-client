import { Injectable } from '@angular/core';
import { ProjectorAction, ScrollScaleDirection } from 'app/core/actions/projector-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Projector } from 'app/shared/models/projector/projector';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Manages all projector instances.
 */
@Injectable({
    providedIn: `root`
})
export class ProjectorRepositoryService extends BaseRepositoryWithActiveMeeting<ViewProjector, Projector> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Projector);
    }

    public getTitle = (viewProjector: ViewProjector) => viewProjector.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Projectors` : `Projector`);

    public getFieldsets(): Fieldsets<Projector> {
        return {
            [DEFAULT_FIELDSET]: [
                `name`,
                `scale`,
                `scroll`,
                `width`,
                `aspect_ratio_numerator`,
                `aspect_ratio_denominator`,
                `color`,
                `background_color`,
                `header_background_color`,
                `header_font_color`,
                `header_h1_color`,
                `chyron_background_color`,
                `chyron_font_color`,
                `show_header_footer`,
                `show_title`,
                `show_logo`,
                `show_clock`,
                `used_as_reference_projector_meeting_id`
            ]
        };
    }

    public async create(partialProjector: Partial<Projector> & { name: string }): Promise<Identifiable> {
        const payload: ProjectorAction.CreatePayload = {
            meeting_id: this.activeMeetingId,
            name: partialProjector.name,
            ...this.getPartialPayload(partialProjector)
        };
        return await this.sendActionToBackend(ProjectorAction.CREATE, payload);
    }

    public async update(update: Partial<Projector>, viewModel: ViewProjector): Promise<void> {
        const payload: ProjectorAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name,
            ...this.getPartialPayload(update)
        };
        return await this.sendActionToBackend(ProjectorAction.UPDATE, payload);
    }

    private getPartialPayload(projector: Partial<Projector>): ProjectorAction.PartialPayload {
        return {
            width: projector.width,
            aspect_ratio_numerator: projector.aspect_ratio_numerator,
            aspect_ratio_denominator: projector.aspect_ratio_denominator,
            color: projector.color,
            background_color: projector.background_color,
            header_background_color: projector.header_background_color,
            header_font_color: projector.header_font_color,
            header_h1_color: projector.header_h1_color,
            chyron_background_color: projector.chyron_background_color,
            chyron_font_color: projector.chyron_font_color,
            show_header_footer: projector.show_header_footer,
            show_title: projector.show_title,
            show_logo: projector.show_logo,
            show_clock: projector.show_clock
        };
    }

    public delete(projector: ViewProjector): Promise<any> {
        return this.sendActionToBackend(ProjectorAction.DELETE, { id: projector.id });
    }

    /**
     * Scroll the given projector.
     *
     * @param projector The projector to scroll
     * @param direction The direction.
     * @param step (default 1) The amount of scroll-steps
     */
    public async scroll(projector: ViewProjector, direction: ScrollScaleDirection, step: number = 1): Promise<void> {
        return await this.controlView(projector, direction, `scroll`, step);
    }

    /**
     * Scale the given projector.
     *
     * @param projector The projector to scale
     * @param direction The direction.
     * @param step (default 1) The amount of scale-steps
     */
    public async scale(projector: ViewProjector, direction: ScrollScaleDirection, step: number = 1): Promise<void> {
        return await this.controlView(projector, direction, `scale`, step);
    }

    /**
     * Controls the view of a projector.
     *
     * @param projector The projector to control.
     * @param direction The direction
     * @param field The field. Can be scale or scroll.
     * @param step The amount of steps to make.
     */
    private async controlView(
        projector: ViewProjector,
        direction: ScrollScaleDirection,
        field: 'scale' | 'scroll',
        step: number
    ): Promise<void> {
        const payload: ProjectorAction.ControlViewPayload = {
            id: projector.id,
            field,
            direction,
            step
        };
        return await this.sendActionToBackend(ProjectorAction.CONTROL_VIEW, payload);
    }

    private createProjectPayload(
        descriptor: ProjectionBuildDescriptor,
        projectors: ViewProjector[],
        options?: object
    ): ProjectorAction.ProjectPayload {
        const payload: ProjectorAction.ProjectPayload = {
            ids: projectors.map(projector => projector.id),
            content_object_id: descriptor.content_object_id,
            meeting_id: this.activeMeetingId
        };
        if (options) {
            payload.options = options;
        }
        if (descriptor.stable) {
            payload.stable = descriptor.stable;
        }
        if (descriptor.type) {
            payload.type = descriptor.type;
        }
        return payload;
    }

    public async project(
        descriptor: ProjectionBuildDescriptor,
        projectors: ViewProjector[],
        options?: object
    ): Promise<void> {
        const payload = this.createProjectPayload(descriptor, projectors, options);
        return await this.sendActionToBackend(ProjectorAction.PROJECT, payload);
    }

    public async toggle(
        descriptor: ProjectionBuildDescriptor,
        projectors: ViewProjector[],
        options?: object
    ): Promise<void> {
        const payload = this.createProjectPayload(descriptor, projectors, options);
        return await this.sendActionToBackend(ProjectorAction.TOGGLE, payload);
    }

    public async next(viewProjector: ViewProjector): Promise<void> {
        return await this.sendActionToBackend(ProjectorAction.NEXT, { id: viewProjector.id });
    }

    public async previous(viewProjector: ViewProjector): Promise<void> {
        return await this.sendActionToBackend(ProjectorAction.PREVIOUS, { id: viewProjector.id });
    }

    public async addToPreview(
        descriptor: ProjectionBuildDescriptor,
        projectors: ViewProjector[],
        options?: object
    ): Promise<void> {
        const payload = this.createProjectPayload(descriptor, projectors, options);
        return await this.sendActionToBackend(ProjectorAction.ADD_TO_PREVIEW, payload);
    }

    public async projectPreview(projection: ViewProjection): Promise<void> {
        const payload: ProjectorAction.ProjectPreviewPayload = {
            id: projection.id
        };
        return await this.sendActionToBackend(ProjectorAction.PROJECT_PREVIEW, payload);
    }

    public async sortPreview(projector: ViewProjector, projection_ids: Id[]): Promise<void> {
        const payload: ProjectorAction.SortPreviewPayload = {
            id: projector.id,
            projection_ids
        };
        return await this.sendActionToBackend(ProjectorAction.SORT_PREVIEW, payload);
    }

    public getReferenceProjectorObservable(): Observable<ViewProjector> {
        return this.getViewModelListObservable().pipe(
            map(projectors => projectors.find(projector => projector.isReferenceProjector))
        );
    }
}
