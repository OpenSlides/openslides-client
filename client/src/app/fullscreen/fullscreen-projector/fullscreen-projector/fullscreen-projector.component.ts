import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/core-services/auth.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { Id } from 'app/core/definitions/key-types';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { Size } from 'app/site/projector/size';
import { Subject } from 'rxjs';

import { ComponentServiceCollector } from '../../../core/ui-services/component-service-collector';
import { PROJECTOR_CONTENT_FOLLOW } from '../../../shared/components/projector/projector.component';
import { BaseModelContextComponent } from '../../../site/base/components/base-model-context.component';

/**
 * The fullscreen projector. Bootstraps OpenSlides, gets the requested projector,
 * holds the projector component and fits it to the screen.
 *
 * DO NOT use this component in the site!
 */
@Component({
    selector: `os-fullscreen-projector`,
    templateUrl: `./fullscreen-projector.component.html`,
    styleUrls: [`./fullscreen-projector.component.scss`]
})
export class FullscreenProjectorComponent extends BaseModelContextComponent implements OnInit {
    // TODO: isLoading, canSeeProjector and other issues must be displayed!
    public isLoading = true;
    public canSeeProjector = false;

    /**
     * The id of the projector given by the url.
     */
    public projectorId: number;

    /**
     * The projector from the datastore.
     */
    public projector: ViewProjector | null;

    /**
     * Saves the projectorsize. It's used to check, if the size has changed
     * on a projector update.
     */
    private oldProjectorSize: Size = { width: 0, height: 0 };

    /**
     * This subject fires, if the container changes it's size.
     */
    public resizeSubject = new Subject<void>();

    /**
     * Used to give the projector the right size.
     */
    public projectorStyle = {
        width: `100px` // Some default. Will be overwritten soon.
    };

    /**
     * The container to get the window size.
     */
    @ViewChild(`container`, { static: true })
    private containerElement: ElementRef;

    /**
     * Constructor. Updates the projector dimensions on a resize.
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        auth: AuthService, // Needed tro trigger loading of OpenSlides. Starts the Bootup process.
        private route: ActivatedRoute,
        private operator: OperatorService,
        private repo: ProjectorRepositoryService
    ) {
        super(componentServiceCollector, translate);
        this.resizeSubject.subscribe(() => {
            this.updateProjectorDimensions();
        });
    }

    /**
     * Get the projector id from the URL. Loads the projector.
     * Subscribes to the operator to get his/her permissions.
     */
    public ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.loadProjector(parseInt(params.id, 10) || 1);
            this.isLoading = false;
        });

        this.operator.operatorUpdatedEvent.subscribe(() => {
            this.canSeeProjector = this.operator.hasPerms(Permission.projectorCanSee);
        });
    }

    /**
     * Loads the projector.
     *
     * @param projectorId: The projector id for the projector to load.
     */
    private loadProjector(projectorId: number): void {
        this.projectorId = projectorId;
        this.requestProjector(projectorId);
        // TODO: what happens on delete?

        // Watches the projector. Update the container size, if the projector size changes.
        this.repo.getViewModelObservable(this.projectorId).subscribe(projector => {
            this.projector = projector;
            if (
                projector &&
                (projector.width !== this.oldProjectorSize.width || projector.height !== this.oldProjectorSize.height)
            ) {
                this.oldProjectorSize.width = projector.height;
                this.oldProjectorSize.height = projector.height;
                this.updateProjectorDimensions();
            }
        });
    }

    /**
     * Fits the projector into the container.
     */
    private updateProjectorDimensions(): void {
        if (!this.containerElement || !this.projector) {
            return;
        }
        const projectorAspectRatio = this.projector.width / this.projector.height;
        const windowAspectRatio =
            this.containerElement.nativeElement.offsetWidth / this.containerElement.nativeElement.offsetHeight;

        if (projectorAspectRatio >= windowAspectRatio) {
            // full width
            this.projectorStyle.width = `${this.containerElement.nativeElement.offsetWidth}px`;
        } else {
            // full height
            const width = Math.floor(this.containerElement.nativeElement.offsetHeight * projectorAspectRatio);
            this.projectorStyle.width = `${width}px`;
        }
    }

    private requestProjector(projectorId: Id): void {
        this.subscribe({
            viewModelCtor: ViewProjector,
            ids: [projectorId],
            follow: [
                PROJECTOR_CONTENT_FOLLOW,
                // This is a workaround (See OpenSlides/openslides-autoupdate-service#376)
                { idField: `meeting_id`, fieldset: `preview` }
            ]
        });
    }
}
