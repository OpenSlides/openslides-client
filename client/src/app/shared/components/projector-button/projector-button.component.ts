import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Permission } from 'app/core/core-services/permission';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ProjectionDialogService } from 'app/core/ui-services/projection-dialog.service';
import { ProjectorService } from 'app/core/ui-services/projector.service';
import { isProjectable, Projectable } from 'app/site/base/projectable';
import { isProjectionBuildDescriptor, ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewProjector } from 'app/site/projector/models/view-projector';

/**
 * The projector button to project something on the projector.
 *
 * Use the input [object] to specify the object to project.
 *
 * For usage in menus set `menuItem=true`.
 */
@Component({
    selector: 'os-projector-button',
    templateUrl: './projector-button.component.html',
    styleUrls: ['./projector-button.component.scss']
})
export class ProjectorButtonComponent implements OnInit, OnDestroy {
    public readonly permission = Permission;
    /**
     * The object to project.
     */
    private _object: ProjectionBuildDescriptor | Projectable | null;

    public get object(): ProjectionBuildDescriptor | Projectable {
        return this._object;
    }

    @Input()
    public set object(obj: ProjectionBuildDescriptor | Projectable) {
        if (isProjectable(obj) || isProjectionBuildDescriptor(obj)) {
            this._object = obj;
        } else {
            this._object = null;
        }
    }

    @Input()
    public text: string | null;

    @Input()
    public menuItem = false;

    @Output()
    public changeEvent: EventEmitter<void> = new EventEmitter();

    /**
     * Pre-define projection target
     */
    @Input()
    public projector: ViewProjector | null;

    private projectorRepoSub: Subscription;

    /**
     * The constructor
     */
    public constructor(
        private projectorRepo: ProjectorRepositoryService,
        private projectionDialogService: ProjectionDialogService,
        private projectorService: ProjectorService
    ) {}

    /**
     * Initialization function
     */
    public ngOnInit(): void {
        this.projectorRepoSub = this.projectorRepo
            .getGeneralViewModelObservable()
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this.changeEvent.next();
            });
    }

    public ngOnDestroy(): void {
        if (this.projectorRepoSub) {
            this.projectorRepoSub.unsubscribe();
            this.projectorRepoSub = null;
        }
    }

    /**
     * Click on the projector button
     *
     * @param event  the click event
     */
    public async onClick(event?: Event): Promise<void> {
        if (event) {
            event.stopPropagation();
        }
        if (!this.object) {
            return;
        }
        const descriptor = this.projectorService.ensureDescriptor(this.object);
        if (this.projector) {
            this.projectorRepo.toggle(descriptor, [this.projector]);
        } else {
            // open the projection dialog
            this.projectionDialogService.openProjectDialogFor(descriptor);
        }
    }

    /**
     *
     *
     * @returns true, if the object is projected on one projector.
     */
    public isProjected(): boolean {
        if (!this.object) {
            return false;
        }

        return this.projector
            ? this.projectorService.isProjectedOn(this.object, this.projector)
            : this.projectorService.isProjected(this.object);
    }
}
