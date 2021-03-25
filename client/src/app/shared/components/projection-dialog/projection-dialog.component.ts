import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ProjectorService } from 'app/core/ui-services/projector.service';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import {
    isSlideChoiceOption,
    isSlideDecisionOption,
    SlideChoiceOption,
    SlideDecisionOption,
    SlideOption,
    SlideOptions
} from 'app/site/base/slide-options';
import { ViewProjector } from 'app/site/projector/models/view-projector';

export type ProjectionDialogReturnType = [
    'project' | 'addToPreview',
    ProjectionBuildDescriptor,
    ViewProjector[],
    object | null
];

@Component({
    selector: 'os-projection-dialog',
    templateUrl: './projection-dialog.component.html',
    styleUrls: ['./projection-dialog.component.scss']
})
export class ProjectionDialogComponent {
    public projectors: ViewProjector[];
    private selectedProjectors: ViewProjector[] = [];
    public optionValues: object = {};
    public options: SlideOptions;

    public constructor(
        public dialogRef: MatDialogRef<ProjectionDialogComponent, ProjectionDialogReturnType>,
        @Inject(MAT_DIALOG_DATA) public descriptor: ProjectionBuildDescriptor,
        private projectorService: ProjectorService,
        private projectorRepo: ProjectorRepositoryService,
        private activeMeetingService: ActiveMeetingService
    ) {
        this.projectors = this.projectorRepo.getViewModelList();
        // TODO: Maybe watch. But this may not be necessary for the short living time of this dialog.

        this.selectedProjectors = this.projectorService.getProjectorsWhichAreProjecting(this.descriptor);

        // Add default projector, if the projectable is not projected on it.
        if (this.descriptor.projectionDefault) {
            const defaultProjector: ViewProjector = this.activeMeetingService.meeting.default_projector(
                this.descriptor.projectionDefault
            );
            if (defaultProjector && !this.selectedProjectors.includes(defaultProjector)) {
                this.selectedProjectors.push(defaultProjector);
            }
        }

        // Set option defaults
        this.descriptor.slideOptions?.forEach(option => {
            this.optionValues[option.key] = option.default;
        });

        this.options = this.descriptor.slideOptions;
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
        this.dialogRef.close(['project', this.descriptor, this.selectedProjectors, this.optionValues]);
    }

    public onAddToPreview(): void {
        this.dialogRef.close(['addToPreview', this.descriptor, this.selectedProjectors, this.optionValues]);
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
