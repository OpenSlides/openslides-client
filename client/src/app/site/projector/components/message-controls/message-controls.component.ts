import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ProjectorMessageRepositoryService } from 'app/core/repositories/projector/projector-message-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ProjectionDialogService } from 'app/core/ui-services/projection-dialog.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { Projector } from 'app/shared/models/projector/projector';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseComponent } from 'app/site/base/components/base.component';
import { MessageDialogData } from '../message-dialog/message-dialog.component';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { ViewProjector } from '../../models/view-projector';
import { ViewProjectorMessage } from '../../models/view-projector-message';

/**
 * Small controls component for messages.
 * Used in the projector detail view, can could be embedded anywhere else
 */
@Component({
    selector: 'os-message-controls',
    templateUrl: './message-controls.component.html',
    styleUrls: ['./message-controls.component.scss']
})
export class MessageControlsComponent extends BaseComponent implements OnInit {
    /**
     * Input slot for the projector message model
     */
    @Input()
    public message: ViewProjectorMessage;

    /**
     * Pre defined projection target (if any)
     */
    @Input()
    public projector: ViewProjector;

    /**
     * Constructor
     *
     * @param titleService set the title, required by parent
     * @param matSnackBar show errors
     * @param translate translate properties
     * @param repo the projector message repo
     * @param promptService delete prompt
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private repo: ProjectorMessageRepositoryService,
        private promptService: PromptService,
        private projectionDialogService: ProjectionDialogService,
        private dialog: MatDialog
    ) {
        super(componentServiceCollector);
    }

    /**
     * Init
     */
    public ngOnInit(): void {}

    /**
     * Fires an edit event
     */
    public onEdit(): void {
        const messageData: MessageDialogData = {
            message: this.message.message
        };

        const dialogRef = this.dialog.open(MessageDialogComponent, {
            data: messageData,
            ...largeDialogSettings
        });

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
        const content =
            this.translate.instant('Delete message') + ` ${this.translate.instant(this.message.getTitle())}?`;
        if (await this.promptService.open('Are you sure?', content)) {
            this.repo.delete(this.message);
        }
    }
}
