import { Component, OnInit, Input } from '@angular/core';
import { ViewProjectorMessage, ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorMessageControllerService } from '../../services/projector-message-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { ProjectorMessageDialogService } from '../../../../components/projector-message-dialog/services/projector-message-dialog.service';
import { ProjectionDialogService } from 'src/app/site/pages/meetings/modules/meetings-component-collector/projection-dialog/services/projection-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: 'os-message-controls',
    templateUrl: './message-controls.component.html',
    styleUrls: ['./message-controls.component.scss']
})
export class MessageControlsComponent {
    /**
     * Input slot for the projector message model
     */
    @Input()
    public message!: ViewProjectorMessage;

    /**
     * Pre defined projection target (if any)
     */
    @Input()
    public projector!: ViewProjector;

    public constructor(
        private translate: TranslateService,
        private repo: ProjectorMessageControllerService,
        private promptService: PromptService,
        private projectionDialogService: ProjectionDialogService,
        private dialog: ProjectorMessageDialogService
    ) {}

    /**
     * Fires an edit event
     */
    public async onEdit(): Promise<void> {
        const dialogRef = await this.dialog.open({ message: this.message.message });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const update = {
                    message: result.message
                };

                this.repo.update(update, this.message);
            }
        });
    }

    /**
     * Brings the projection dialog
     */
    public onBringDialog(): void {
        this.projectionDialogService.openProjectDialogFor(this.message.getProjectionBuildDescriptor());
    }

    /**
     * On delete button
     */
    public async onDelete(): Promise<void> {
        const title = _(`Are you sure you want to delete this message?`);

        if (await this.promptService.open(title)) {
            await this.repo.delete(this.message);
        }
    }
}
