import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
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
    projector?: ViewProjector;
}

@Component({
    selector: `os-projection-dialog`,
    templateUrl: `./projection-dialog.component.html`,
    styleUrls: [`./projection-dialog.component.scss`]
})
export class ProjectionDialogComponent implements OnInit, OnDestroy {
    public projectors: ViewProjector[] = [];
    private selectedProjectors: Id[] = null;
    public optionValues: any = {};
    public options!: SlideOptions;
    public descriptor: ProjectionBuildDescriptor;
    public allowReferenceProjector = true;
    public projectorSelectable = false;
    private currentProjectionOptions: { [key: string]: any } = {};
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
        this.allowReferenceProjector = isProjectionBuildDescriptor(data) || data.allowReferenceProjector;
        this.projectorSelectable = isProjectionBuildDescriptor(data) || !data.projector;
        if (!this.projectorSelectable && !isProjectionBuildDescriptor(data)) {
            this.selectedProjectors = [data.projector.id];
        }

        const projector = !isProjectionBuildDescriptor(data) && data.projector;
        if (projector) {
            const projections = this.projectorService.getMatchingProjectionsFromProjector(this.descriptor, projector);

            if (projections.length === 1) {
                this.currentProjectionOptions = projections[0].options || {};
            }
        }
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
            if (this.selectedProjectors === null && this.projectorSelectable) {
                this.selectedProjectors = this.projectorService
                    .getProjectorsWhichAreProjecting(this.descriptor)
                    .map(p => p.id);
            }

            // Add default projector, if the projectable is not projected on it.
            if (this.descriptor?.projectionDefault && this.projectorSelectable) {
                const defaultProjectors: ViewProjector[] = this.activeMeetingService.meeting!.default_projectors(
                    this.descriptor.projectionDefault
                );

                for (const defaultProjector of defaultProjectors) {
                    if (
                        !this.selectedProjectors.includes(defaultProjector.id) &&
                        (this.allowReferenceProjector || !defaultProjector.isReferenceProjector)
                    ) {
                        this.selectedProjectors.push(defaultProjector.id);
                    }
                }
            }

            // Set option defaults
            this.descriptor?.slideOptions?.forEach(option => {
                this.optionValues[option.key] = this.currentProjectionOptions[option.key] || option.default;
            });

            if (this.descriptor) {
                this.options = this.descriptor.slideOptions!;
            }

            this._subscriptions.push(
                this.projectorService.getViewModelListObservable().subscribe(projectors => {
                    this.projectors = projectors.filter(p => this.allowReferenceProjector || !p.isReferenceProjector);
                })
            );
        });
    }

    public toggleProjector(projector: ViewProjector): void {
        const index = this.selectedProjectors.indexOf(projector.id);
        if (index < 0) {
            this.selectedProjectors.push(projector.id);
        } else {
            this.selectedProjectors.splice(index, 1);
        }
    }

    public isProjectorSelected(projector: ViewProjector): boolean {
        return this.selectedProjectors.includes(projector.id);
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
            projectors: this.selectedProjectors.map(id => this.projectors.find(p => p.id === id)).filter(p => p),
            options: this.optionValues,
            keepActiveProjections: !this.projectorSelectable
        });
    }

    public onAddToPreview(): void {
        this.dialogRef.close({
            action: `addToPreview`,
            resultDescriptor: this.descriptor,
            projectors: this.selectedProjectors.map(id => this.projectors.find(p => p.id === id)).filter(p => p),
            options: this.optionValues
        });
    }

    public onHide(): void {
        this.dialogRef.close({
            action: `hide`,
            resultDescriptor: this.descriptor,
            projectors: this.selectedProjectors.map(id => this.projectors.find(p => p.id === id)).filter(p => p),
            options: this.optionValues
        });
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
