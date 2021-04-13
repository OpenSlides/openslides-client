import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { timer } from 'rxjs';

import { ScrollScaleDirection } from 'app/core/actions/projector-action';
import { ProjectorMessageAction } from 'app/core/actions/projector-message-action';
import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { MeetingRepositoryService } from 'app/core/repositories/event-management/meeting-repository.service';
import { ProjectionRepositoryService } from 'app/core/repositories/projector/projection-repository.service';
import { ProjectorCountdownRepositoryService } from 'app/core/repositories/projector/projector-countdown-repository.service';
import { ProjectorMessageRepositoryService } from 'app/core/repositories/projector/projector-message-repository.service';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { SizeObject } from 'app/shared/components/tile/tile.component';
import { infoDialogSettings, largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewProjectorCountdown } from 'app/site/projector/models/view-projector-countdown';
import { ViewProjectorMessage } from 'app/site/projector/models/view-projector-message';
import { CountdownDialogComponent, CountdownDialogData } from '../countdown-dialog/countdown-dialog.component';
import { CurrentListOfSpeakersSlideService } from '../../services/current-list-of-speakers-slide.service';
import { CurrentSpeakerChyronSlideService } from '../../services/current-speaker-chyron-slide.service';
import { MessageDialogComponent, MessageDialogData } from '../message-dialog/message-dialog.component';
import { ProjectorEditDialogComponent } from '../projector-edit-dialog/projector-edit-dialog.component';
import { ViewProjection } from '../../models/view-projection';
import { ViewProjector } from '../../models/view-projector';

/**
 * The projector detail view.
 */
@Component({
    selector: 'os-projector-detail',
    templateUrl: './projector-detail.component.html',
    styleUrls: ['./projector-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectorDetailComponent extends BaseModelContextComponent implements OnInit {
    /**
     * The projector to show.
     */
    public projector: ViewProjector;

    public scrollScaleDirection = ScrollScaleDirection;

    public countdowns: ViewProjectorCountdown[] = [];

    public messages: ViewProjectorMessage[] = [];

    public projectorCount: number;

    /**
     * Defines the used sizes for different devices for the left column.
     */
    public projectorTileSizeLeft: SizeObject = { medium: 8, large: 10 };

    /**
     * Defines the used sizes for different devices for the right column.
     */
    public projectorTileSizeRight: SizeObject = { medium: 4, large: 6 };

    /**
     * true if the queue might be altered
     */
    public editQueue = false;

    /**
     * @param titleService
     * @param translate
     * @param matSnackBar
     * @param projectorRepo
     * @param route
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private dialog: MatDialog,
        private projectorRepo: ProjectorRepositoryService,
        private projectionRepo: ProjectionRepositoryService,
        private route: ActivatedRoute,
        private countdownRepo: ProjectorCountdownRepositoryService,
        private messageRepo: ProjectorMessageRepositoryService,
        private currentListOfSpeakersSlideService: CurrentListOfSpeakersSlideService,
        private currentSpeakerChyronService: CurrentSpeakerChyronSlideService,
        private durationService: DurationService,
        private cd: ChangeDetectorRef,
        private promptService: PromptService,
        private operator: OperatorService,
        private activeMeetingService: ActiveMeetingService,
        private meetingRepo: MeetingRepositoryService
    ) {
        super(componentServiceCollector);

        this.subscriptions.push(
            this.countdownRepo.getViewModelListObservable().subscribe(countdowns => (this.countdowns = countdowns)),
            this.messageRepo.getViewModelListObservable().subscribe(messages => (this.messages = messages)),
            this.projectorRepo
                .getViewModelListObservable()
                .subscribe(projectors => (this.projectorCount = projectors.length)),
            // TODO: remove.
            // This is just for testing the new autoupdate/projector service mechanism
            this.projectorRepo.getViewModelListObservable().subscribe(p => {
                p.forEach(x => {
                    console.log(
                        x,
                        x.current_projections,
                        x.current_projections.map((y: any) => y.content)
                    );
                });
            })
        );
    }

    /**
     * Gets the projector and subscribes to it.
     */
    public ngOnInit(): void {
        this.route.params.subscribe(params => {
            const projectorId = parseInt(params.id, 10) || 1;

            this.requestModels({
                viewModelCtor: ViewProjector,
                ids: [projectorId],
                follow: [
                    {
                        idField: 'history_projection_ids',
                        follow: [{ idField: 'content_object_id' }]
                    },
                    {
                        idField: 'current_projection_ids',
                        follow: [{ idField: 'content_object_id' }]
                        // additionalFields: ["content"]
                    }
                ]
            });

            this.subscriptions.push(
                this.projectorRepo.getViewModelObservable(projectorId).subscribe(projector => {
                    if (projector) {
                        const title = projector.name;
                        super.setTitle(title);
                        this.projector = projector;
                    }
                })
            );
        });

        this.requestModels(
            {
                viewModelCtor: ViewMeeting,
                ids: [this.activeMeetingId],
                follow: ['projector_countdown_ids', 'projector_message_ids']
            },
            'messages and countdowns'
        );

        this.subscriptions.push(timer(0, 500).subscribe(() => this.cd.detectChanges()));
    }

    public editProjector(): void {
        const dialogRef = this.dialog.open(ProjectorEditDialogComponent, {
            data: this.projector,
            ...largeDialogSettings
        });

        dialogRef.afterClosed().subscribe(event => {
            if (event) {
                this.cd.detectChanges();
            }
        });
    }

    /**
     * Handler to set the selected projector as the meeting reference projector
     */
    public setProjectorAsReference(): void {
        this.meetingRepo.update({ reference_projector_id: this.projector.id }, this.activeMeetingService.meeting);
    }

    /**
     * Handler for the delete Projector button
     * TODO: same with projector list entry
     */
    public async onDeleteProjectorButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this projector?');
        if (await this.promptService.open(title, this.projector.name)) {
            this.projectorRepo.delete(this.projector);
        }
    }

    /**
     * @returns true if the operator can manage
     */
    public canManage(): boolean {
        return this.operator.hasPerms(Permission.projectorCanManage);
    }

    /**
     * Change the scroll
     *
     * @param direction The direction to send.
     * @param step (optional) The amount of steps to make.
     */
    public scroll(direction: ScrollScaleDirection, step: number = 1): void {
        this.projectorRepo.scroll(this.projector, direction, step);
    }

    /**
     * Change the scale
     *
     * @param direction The direction to send.
     * @param step (optional) The amount of steps to make.
     */
    public scale(direction: ScrollScaleDirection, step: number = 1): void {
        this.projectorRepo.scale(this.projector, direction, step);
    }

    public async projectNextSlide(): Promise<void> {
        await this.projectorRepo.next(this.projector);
    }

    public async projectPreviousSlide(): Promise<void> {
        await this.projectorRepo.previous(this.projector);
    }

    public onSortingChange(event: CdkDragDrop<ViewProjection>): void {
        const ids = this.projector.preview_projections.map(projection => projection.id);
        moveItemInArray(ids, event.previousIndex, event.currentIndex);
        this.projectorRepo.sortPreview(this.projector, ids);
    }

    public deleteProjection(projection: ViewProjection): void {
        this.projectionRepo.delete(projection);
    }

    public projectPreviewItem(projection: ViewProjection): void {
        this.projectorRepo.projectPreview(projection);
    }

    public unprojectCurrent(projection: ViewProjection): void {
        throw new Error('TODO: unproject current');
    }

    public isClosProjected(overlay: boolean): boolean {
        return this.currentListOfSpeakersSlideService.isProjectedOn(this.projector, overlay);
    }

    public toggleClos(overlay: boolean): void {
        this.currentListOfSpeakersSlideService.toggleOn(this.projector, overlay);
    }

    public isChyronProjected(): boolean {
        return this.currentSpeakerChyronService.isProjectedOn(this.projector);
    }

    public toggleChyron(): void {
        this.currentSpeakerChyronService.toggleOn(this.projector);
    }

    public createProjectorCountdown(): void {
        const countdownData: CountdownDialogData = {
            title: '',
            description: '',
            duration: '',
            count: this.countdowns.length
        };

        const dialogRef = this.dialog.open(CountdownDialogComponent, {
            data: countdownData,
            ...infoDialogSettings
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const defaultTime = this.durationService.stringToDuration(result.duration, 'm');
                const countdown = {
                    meeting_id: this.activeMeetingId,
                    title: result.title,
                    description: result.description,
                    default_time: defaultTime
                };
                this.countdownRepo.create(countdown);
            }
        });
    }

    public createProjectorMessage(): void {
        const messageData: MessageDialogData = {
            message: ''
        };

        const dialogRef = this.dialog.open(MessageDialogComponent, {
            data: messageData,
            ...largeDialogSettings
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const message: ProjectorMessageAction.CreatePayload = {
                    meeting_id: this.activeMeetingId,
                    message: result.message
                };
                this.messageRepo.create(message);
            }
        });
    }
}
