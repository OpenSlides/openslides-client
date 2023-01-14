import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models/projection-build-descriptor';
import {
    isSlideChoiceOption,
    isSlideDecisionOption,
    SlideChoiceOption,
    SlideDecisionOption,
    SlideOption,
    SlideOptions
} from 'src/app/site/pages/meetings/view-models/slide-options';

import { ProjectionDialogReturnType } from '../../definitions';

@Component({
    selector: `os-projection-dialog`,
    templateUrl: `./projection-dialog.component.html`,
    styleUrls: [`./projection-dialog.component.scss`]
})
export class ProjectionDialogComponent {
    public projectors: ViewProjector[] = [];
    private selectedProjectors: ViewProjector[] = [];
    public optionValues: any = {};
    public options!: SlideOptions;

    public constructor(
        public dialogRef: MatDialogRef<ProjectionDialogComponent, ProjectionDialogReturnType>,
        @Inject(MAT_DIALOG_DATA) public descriptor: ProjectionBuildDescriptor,
        private projectorService: ProjectorControllerService,
        private activeMeetingService: ActiveMeetingService
    ) {
        this.projectors = projectorService.getViewModelList();
        // TODO: Maybe watch. But this may not be necessary for the short living time of this dialog.

        this.selectedProjectors = this.projectorService.getProjectorsWhichAreProjecting(this.descriptor);

        // Add default projector, if the projectable is not projected on it.
        if (this.descriptor?.projectionDefault) {
            const defaultProjector: ViewProjector | null = this.activeMeetingService.meeting!.default_projector(
                this.descriptor.projectionDefault
            );
            if (defaultProjector && !this.selectedProjectors.includes(defaultProjector)) {
                this.selectedProjectors.push(defaultProjector);
            }
        }

        // Set option defaults
        this.descriptor?.slideOptions?.forEach(option => {
            this.optionValues[option.key] = option.default;
        });

        if (this.descriptor) {
            this.options = this.descriptor.slideOptions!;
        }
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
