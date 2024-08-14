import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ProjectionDialogService } from 'src/app/site/pages/meetings/modules/meetings-component-collector/projection-dialog/services/projection-dialog.service';
import { ViewProjection, ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
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
        this.updateIsProjected();
    }

    @Input()
    public menuItem = false;

    @Output()
    public changeEvent: EventEmitter<void> = new EventEmitter();

    private _projector: ViewProjector | null = null;

    public get projector(): ViewProjector | null {
        return this._projector;
    }

    /**
     * Pre-define projection target
     */
    @Input()
    public set projector(projector: ViewProjector | null) {
        this._projector = projector;
        this.updateIsProjected();
    }

    @Input()
    public blendIn = false;

    @Input()
    public disabled = false;

    @Input()
    public ignoreStable = false;

    @Input()
    public allowReferenceProjector = true;

    @Input()
    public useToggleDialog = false;

    /**
     * If this is re-defined, it will replace the usual click functionality.
     */
    @Input()
    public onClickFn: null | (() => void) = () => {
        if (!this.object) {
            return;
        }
        const descriptor = this.projectorService.ensureDescriptor(this.object);
        if (this.useToggleDialog) {
            this.projectionDialogService.openProjectDialogFor({
                descriptor,
                projector: this.projector,
                allowReferenceProjector: true
            });
        } else if (this.projector) {
            if (this.ignoreStable && this._projection) {
                descriptor.stable = this._projection.stable;
            }
            this.projectorService.toggle(descriptor, [this.projector]);
        } else {
            // open the projection dialog
            this.projectionDialogService.openProjectDialogFor({
                descriptor,
                allowReferenceProjector: this.allowReferenceProjector
            });
        }
    };

    private _projection: ViewProjection = null;
    private _isProjected = false;

    public get isProjected(): boolean {
        return this._isProjected;
    }

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
                this.updateIsProjected();
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
        if (this.onClickFn) {
            this.onClickFn();
        }
    }

    /**
     *
     *
     * @returns true, if the object is projected on one projector.
     */
    public updateIsProjected(): void {
        if (!this.object) {
            this._isProjected = false;
        }

        if (this.projector) {
            const projections = this.projectorService.getMatchingProjectionsFromProjector(this.object, this.projector);
            this._isProjected = !!projections.length;
            this._projection = this._isProjected ? projections[0] : null;
        } else {
            this._isProjected = this.projectorService.isProjected(this.object);
            this._projection = null;
        }
    }
}
