import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ProjectionDialogService } from 'src/app/site/pages/meetings/modules/meetings-component-collector/projection-dialog/services/projection-dialog.service';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import {
    isProjectable,
    isProjectionBuildDescriptor,
    Projectable,
    ProjectionBuildDescriptor
} from 'src/app/site/pages/meetings/view-models';

@Component({
    selector: `os-projector-button`,
    templateUrl: `./projector-button.component.html`,
    styleUrls: [`./projector-button.component.scss`]
})
export class ProjectorButtonComponent implements OnInit, OnDestroy {
    public readonly permission = Permission;
    /**
     * The object to project.
     */
    private _object: ProjectionBuildDescriptor | Projectable | null = null;

    public get object(): ProjectionBuildDescriptor | Projectable {
        return this._object!;
    }

    @Input()
    public set object(obj: ProjectionBuildDescriptor | Projectable | null) {
        if (isProjectable(obj) || isProjectionBuildDescriptor(obj)) {
            this._object = obj;
        } else {
            this._object = null;
        }
    }

    @Input()
    public menuItem = false;

    @Output()
    public changeEvent: EventEmitter<void> = new EventEmitter();

    /**
     * Pre-define projection target
     */
    @Input()
    public projector: ViewProjector | null = null;

    @Input()
    public blendIn = false;

    private projectorRepoSub: Subscription | null = null;

    /**
     * The constructor
     */
    public constructor(
        private projectionDialogService: ProjectionDialogService,
        private projectorService: ProjectorControllerService
    ) {}

    /**
     * Initialization function
     */
    public ngOnInit(): void {
        this.projectorRepoSub = this.projectorService
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
            this.projectorService.toggle(descriptor, [this.projector]);
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
