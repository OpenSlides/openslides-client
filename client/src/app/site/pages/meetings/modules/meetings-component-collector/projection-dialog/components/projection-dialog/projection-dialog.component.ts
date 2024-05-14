import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import {
    getProjectorListMinimalSubscriptionConfig,
    PROJECTOR_LIST_MINIMAL_SUBSCRIPTION
} from 'src/app/site/pages/meetings/pages/projectors/projectors.subscription';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import {
    isProjectionBuildDescriptor,
    ProjectionBuildDescriptor
} from 'src/app/site/pages/meetings/view-models/projection-build-descriptor';
import {
    isSlideChoiceOption,
    isSlideDecisionOption,
    SlideChoiceOption,
    SlideDecisionOption,
    SlideOption,
    SlideOptions
} from 'src/app/site/pages/meetings/view-models/slide-options';
import { ModelRequestService } from 'src/app/site/services/model-request.service';

import { ProjectionDialogReturnType } from '../../definitions';

export interface ProjectionDialogConfig {
    descriptor: ProjectionBuildDescriptor;
    allowReferenceProjector: boolean;
}

@Component({
    selector: `os-projection-dialog`,
    templateUrl: `./projection-dialog.component.html`,
    styleUrls: [`./projection-dialog.component.scss`]
})
export class ProjectionDialogComponent implements OnInit, OnDestroy {
    public projectors: ViewProjector[] = [];
    private selectedProjectors: ViewProjector[] = null;
    public optionValues: any = {};
    public options!: SlideOptions;
    public descriptor: ProjectionBuildDescriptor;
    public allowReferenceProjector = true;
    private _projectorSubscription: string;
    private _subscriptions: Subscription[] = [];

    public constructor(
        public dialogRef: MatDialogRef<ProjectionDialogComponent, ProjectionDialogReturnType>,
        @Inject(MAT_DIALOG_DATA) public data: ProjectionDialogConfig | ProjectionBuildDescriptor,
        private projectorService: ProjectorControllerService,
        private activeMeetingService: ActiveMeetingService,
        private modelRequestService: ModelRequestService
    ) {
        this.descriptor = isProjectionBuildDescriptor(data) ? data : data.descriptor;
        this.allowReferenceProjector = !isProjectionBuildDescriptor(data) && data.allowReferenceProjector;
    }

    public ngOnDestroy(): void {
        this.modelRequestService.closeSubscription(this._projectorSubscription);
        this._subscriptions.forEach(s => s.unsubscribe());
    }

    public ngOnInit(): void {
        this._projectorSubscription = PROJECTOR_LIST_MINIMAL_SUBSCRIPTION + `_${Date.now()}`;
        this.modelRequestService.subscribeTo({
            ...getProjectorListMinimalSubscriptionConfig(this.activeMeetingService.meetingId),
            subscriptionName: this._projectorSubscription
        });
        this.modelRequestService.waitSubscriptionReady(this._projectorSubscription).then(() => {
            const projectors = this.projectorService.getViewModelList();
            this.projectors = projectors.filter(p => this.allowReferenceProjector || !p.isReferenceProjector);

            // TODO: Maybe watch. But this may not be necessary for the short living time of this dialog.
            if (this.selectedProjectors === null) {
                this.selectedProjectors = this.projectorService.getProjectorsWhichAreProjecting(this.descriptor);
            }

            // Add default projector, if the projectable is not projected on it.
            if (this.descriptor?.projectionDefault) {
                const defaultProjectors: ViewProjector[] = this.activeMeetingService.meeting!.default_projectors(
                    this.descriptor.projectionDefault
                );

                for (const defaultProjector of defaultProjectors) {
                    if (
                        !this.selectedProjectors.includes(defaultProjector) &&
                        (this.allowReferenceProjector || !defaultProjector.isReferenceProjector)
                    ) {
                        this.selectedProjectors.push(defaultProjector);
                    }
                }
            }

            // Set option defaults
            this.descriptor?.slideOptions?.forEach(option => {
                this.optionValues[option.key] = option.default;
            });

            if (this.descriptor) {
                this.options = this.descriptor.slideOptions!;
            }
        });
    }

    public toggleProjector(projector: ViewProjector): void {
        const index = this.selectedProjectors.indexOf(projector);
        if (index < 0) {
            this.selectedProjectors.push(projector);
        } else {
            this.selectedProjectors.splice(index, 1);
        }
    }

    public isProjectorSelected(projector: ViewProjector): boolean {
        return this.selectedProjectors.includes(projector);
    }

    public isProjectedOn(projector: ViewProjector): boolean {
        return this.projectorService.isProjectedOn(this.descriptor, projector);
    }

    public isDecisionOption(option: SlideOption): option is SlideDecisionOption {
        return isSlideDecisionOption(option);
    }

    public isChoiceOption(option: SlideOption): option is SlideChoiceOption {
        return isSlideChoiceOption(option);
    }

    public onProject(): void {
        this.dialogRef.close({
            action: `project`,
            resultDescriptor: this.descriptor,
            projectors: this.selectedProjectors,
            options: this.optionValues
        });
    }

    public onAddToPreview(): void {
        this.dialogRef.close({
            action: `addToPreview`,
            resultDescriptor: this.descriptor,
            projectors: this.selectedProjectors,
            options: this.optionValues
        });
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
