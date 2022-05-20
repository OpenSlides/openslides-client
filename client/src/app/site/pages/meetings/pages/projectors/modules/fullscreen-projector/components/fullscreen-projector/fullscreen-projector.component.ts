import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { Dimension } from '../../../../definitions';

@Component({
    selector: `os-fullscreen-projector`,
    templateUrl: `./fullscreen-projector.component.html`,
    styleUrls: [`./fullscreen-projector.component.scss`]
})
export class FullscreenProjectorComponent implements OnInit {
    public readonly COLLECTION = ViewProjector.COLLECTION;

    // TODO: isLoading, canSeeProjector and other issues must be displayed!
    public isLoading = true;
    public canSeeProjector = false;

    @Input()
    public set id(id: number) {
        this.projectorId = id;
        this.loadProjector();
    }

    /**
     * The id of the projector given by the url.
     */
    public projectorId!: number;

    /**
     * The projector from the datastore.
     */
    public projector: ViewProjector | null = null;

    /**
     * Saves the projectorsize. It's used to check, if the size has changed
     * on a projector update.
     */
    private oldProjectorSize: Dimension = { width: 0, height: 0 };

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
    private containerElement!: ElementRef<HTMLElement>;

    /**
     * Constructor. Updates the projector dimensions on a resize.
     */
    public constructor(private operator: OperatorService, private repo: ProjectorControllerService) {}

    /**
     * Get the projector id from the URL. Loads the projector.
     * Subscribes to the operator to get his/her permissions.
     */
    public ngOnInit(): void {
        this.operator.operatorUpdated.subscribe(() => {
            this.canSeeProjector = this.operator.hasPerms(Permission.projectorCanSee);
        });
    }

    /**
     * Loads the projector.
     *
     */
    private loadProjector(): void {
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
    public updateProjectorDimensions(): void {
        if (!this.containerElement || !this.projector || !this.projector.width || !this.projector.height) {
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
}
