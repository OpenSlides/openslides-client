import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable, switchMap } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { MeetingProjectionType } from 'src/app/gateways/repositories/meeting-repository.service';
import { ScrollScaleDirection } from 'src/app/gateways/repositories/projectors/projector.action';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewProjection } from 'src/app/site/pages/meetings/pages/projectors';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { MeetingCollectionMapperService } from 'src/app/site/pages/meetings/services/meeting-collection-mapper.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { Projectable, ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';
import { DurationService } from 'src/app/site/services/duration.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { GridTileDimension } from 'src/app/ui/modules/grid';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { hasListOfSpeakers, ViewListOfSpeakers } from '../../../../../agenda';
import { CurrentListOfSpeakersSlideService } from '../../../../../agenda/modules/list-of-speakers/services/current-list-of-speakers-slide.service';
import { ProjectorCountdownDialogService } from '../../../../components/projector-countdown-dialog';
import { ProjectorEditDialogService } from '../../../../components/projector-edit-dialog/services/projector-edit-dialog.service';
import { ProjectorMessageDialogService } from '../../../../components/projector-message-dialog';
import { ViewProjector, ViewProjectorCountdown, ViewProjectorMessage } from '../../../../view-models';
import { CurrentSpeakerChyronSlideService } from '../../services/current-speaker-chyron-slide.service';
import { ProjectionControllerService } from '../../services/projection-controller.service';
import { ProjectorCountdownControllerService } from '../../services/projector-countdown-controller.service';
import { ProjectorMessageControllerService } from '../../services/projector-message-controller.service';

/**
 * The projector detail view.
 */
@Component({
    selector: `os-projector-detail`,
    templateUrl: `./projector-detail.component.html`,
    styleUrls: [`./projector-detail.component.scss`]
})
export class ProjectorDetailComponent extends BaseMeetingComponent implements OnInit {
    public readonly COLLECTION = ViewProjector.COLLECTION;

    /**
     * The projector to show.
     */
    public projector!: ViewProjector;

    public projectorObservable: Observable<ViewProjector | null> | null = null;

    public scrollScaleDirection = ScrollScaleDirection;

    public countdowns: ViewProjectorCountdown[] = [];

    public messages: ViewProjectorMessage[] = [];

    public projectorCount = 0;

    /**
     * Defines the used sizes for different devices for the left column.
     */
    public projectorTileSizeLeft: GridTileDimension = { medium: 8, large: 10 };

    /**
     * Defines the used sizes for different devices for the right column.
     */
    public projectorTileSizeRight: GridTileDimension = { medium: 4, large: 6 };

    /**
     * true if the queue might be altered
     */
    public editQueue = false;

    public get hasSlide(): boolean {
        return !!this.projector.nonStableCurrentProjections;
    }

    public get currentProjectionIsLoS(): boolean {
        for (const projection of this.projector.nonStableCurrentProjections) {
            if (hasListOfSpeakers(projection.content_object)) {
                return false;
            } else if (projection.content_object.collection === `list_of_speakers`) {
                return true;
            }
        }
        return false;
    }

    public get hasEnoughWiFiData(): boolean {
        return this._hasEnoughWiFiData;
    }

    public get noWiFiData(): boolean {
        return this._noWiFiData;
    }

    private _hasEnoughWiFiData: boolean;

    private _noWiFiData: boolean;

    private _projectorId: Id | null = null;

    private _projectorIdSubject: BehaviorSubject<number> = new BehaviorSubject(null);

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private repo: ProjectorControllerService,
        private projectionRepo: ProjectionControllerService,
        private countdownRepo: ProjectorCountdownControllerService,
        private messageRepo: ProjectorMessageControllerService,
        private currentListOfSpeakersSlideService: CurrentListOfSpeakersSlideService,
        private currentSpeakerChyronService: CurrentSpeakerChyronSlideService,
        private projectorEditDialog: ProjectorEditDialogService,
        private projectorMessageDialog: ProjectorMessageDialogService,
        private projectorCountdownDialog: ProjectorCountdownDialogService,
        private route: ActivatedRoute,
        private durationService: DurationService,
        private promptService: PromptService,
        private operator: OperatorService,
        private meetingCollectionMapper: MeetingCollectionMapperService
    ) {
        super(componentServiceCollector, translate);

        this.subscriptions.push(
            this.countdownRepo.getViewModelListObservable().subscribe(countdowns => (this.countdowns = countdowns)),
            this.messageRepo.getViewModelListObservable().subscribe(messages => (this.messages = messages)),
            this.repo.getViewModelListObservable().subscribe(projectors => (this.projectorCount = projectors.length)),
            combineLatest([
                this.meetingSettingsService.get(`users_pdf_wlan_encryption`),
                this.meetingSettingsService.get(`users_pdf_wlan_password`),
                this.meetingSettingsService.get(`users_pdf_wlan_ssid`)
            ]).subscribe(data => {
                this._hasEnoughWiFiData = data[0] && !!data[2] && !(data[0] !== `nopass` && !data[1]);
                this._noWiFiData = !data.some(date => !!date);
            })
        );
    }

    /**
     * Gets the projector and subscribes to it.
     */
    public ngOnInit(): void {
        this.projectorObservable = this._projectorIdSubject.pipe(
            switchMap(projectorId => this.repo.getViewModelObservable(projectorId))
        );
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._projectorId = id;
            this._projectorIdSubject.next(id);
            this.setupSubscription();
        }
    }

    public async editProjector(): Promise<void> {
        const dialogRef = await this.projectorEditDialog.open(this.projector);
        dialogRef.afterClosed().subscribe(update => {
            if (this.projector && update) {
                this.repo.update(update, this.projector);
            }
        });
    }

    /**
     * Handler to set the selected projector as the meeting reference projector
     */
    public async setProjectorAsReference(): Promise<void> {
        if (this.projector.is_internal) {
            const title = _(`Warning: This projector will be set to visible`);
            const text = _(
                `This projector is currently internal. Selecting such projectors as reference projectors will automatically set them to visible. Do you really want to do this?`
            );
            if (!(await this.promptService.open(title, text))) {
                return;
            }
        }
        this.repo.setReferenceProjector(this.projector);
    }

    /**
     * Handler for the delete Projector button
     * TODO: same with projector list entry
     */
    public async onDeleteProjectorButton(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this projector?`);
        const content = this.projector.name;
        if (this.projector && (await this.promptService.open(title, content))) {
            this.repo.delete(this.projector);
            this.router.navigate([`../../`], { relativeTo: this.route });
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
    public scroll(direction: ScrollScaleDirection, step = 1): void {
        this.repo.scroll(this.projector, direction, step);
    }

    /**
     * Change the scale
     *
     * @param direction The direction to send.
     * @param step (optional) The amount of steps to make.
     */
    public scale(direction: ScrollScaleDirection, step = 1): void {
        this.repo.scale(this.projector, direction, step);
    }

    public async projectNextSlide(): Promise<void> {
        await this.repo.next(this.projector);
    }

    public async projectPreviousSlide(): Promise<void> {
        await this.repo.previous(this.projector);
    }

    public onSortingChange(event: CdkDragDrop<ViewProjection>): void {
        const ids = this.projector.preview_projections.map(projection => projection.id);
        moveItemInArray(ids, event.previousIndex, event.currentIndex);
        this.repo.sortPreview(this.projector, ids);
    }

    public deleteProjection(projection: ViewProjection): void {
        this.projectionRepo.delete(projection);
    }

    public projectPreview(projection: ViewProjection): void {
        this.repo.projectPreview(projection);
    }

    public getProjectPreviewFunction(projection: ViewProjection): () => void {
        return () => this.projectPreview(projection);
    }

    public unprojectCurrent(projection: ViewProjection): void {
        this.repo.toggle(projection.getProjectionBuildDescriptor(), [this.projector!]);
    }

    public isClosProjected(overlay: boolean): boolean {
        return this.currentListOfSpeakersSlideService.isProjectedOn(this.projector, overlay);
    }

    public toggleClos(overlay: boolean): void {
        this.currentListOfSpeakersSlideService.toggleOn(this.projector, overlay);
    }

    public getCurrentLoSBuildDesc(overlay: boolean): ProjectionBuildDescriptor {
        return this.currentListOfSpeakersSlideService.getProjectionBuildDescriptor(overlay);
    }

    public getCurrentStructureLevel(overlay: boolean): ProjectionBuildDescriptor {
        // TODO: create own thing for project current structure level
        // should project speaker, time from structure level and structure level
        return this.currentListOfSpeakersSlideService.getProjectionBuildDescriptor(overlay);
    }

    public getAllStructureLevel(overlay: boolean): ProjectionBuildDescriptor {
        // TODO: create own thing for project all structure level
        // should project all structure levels and their times
        return this.currentListOfSpeakersSlideService.getProjectionBuildDescriptor(overlay);
    }

    public isStructureLevelCountdownEnabled(): boolean {
        const strucutreLevelTime = this.meetingSettingsService.instant(`list_of_speakers_default_structure_level_time`);
        return true;
        // TODO activate when functional in settings
        // return strucutreLevelTime;
    }

    public wifiDataBuildDesc(): ProjectionBuildDescriptor {
        return {
            content_object_id: `meeting/${this.activeMeetingId}`,
            type: MeetingProjectionType.WiFiAccess,
            projectionDefault: null,
            getDialogTitle: () => this.translate.instant(`Wifi access data`)
        };
    }

    public getCurrentProjectionLoSToggleBuildDesc(): ProjectionBuildDescriptor | Projectable | null {
        try {
            for (const projection of this.projector.nonStableCurrentProjections) {
                if (hasListOfSpeakers(projection.content_object)) {
                    return projection.content_object.list_of_speakers ?? null;
                } else if (projection.content_object.collection === `list_of_speakers`) {
                    return (this.meetingCollectionMapper.getViewModelByFqid(
                        (projection.content_object as ViewListOfSpeakers).content_object_id
                    ) ?? null) as BaseViewModel<any> & Projectable;
                }
            }
        } catch (e) {}
        return null;
    }

    public isChyronProjected(): boolean {
        return this.currentSpeakerChyronService.isProjectedOn(this.projector);
    }

    public getChyronBuildDesc(): ProjectionBuildDescriptor {
        return this.currentSpeakerChyronService.getProjectionBuildDescriptor();
    }

    public toggleChyron(): void {
        this.currentSpeakerChyronService.toggleOn(this.projector);
    }

    public async createProjectorCountdown(): Promise<void> {
        const dialogRef = await this.projectorCountdownDialog.open({ count: this.countdowns.length });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const defaultTime = this.durationService.stringToDuration(result.duration, `m`);
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

    public async createProjectorMessage(): Promise<void> {
        const dialogRef = await this.projectorMessageDialog.open();

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const message = {
                    meeting_id: this.activeMeetingId,
                    message: result.message
                };
                this.messageRepo.create(message);
            }
        });
    }

    private setupSubscription(): void {
        this.subscriptions.push(
            this.repo.getViewModelObservable(this._projectorId!).subscribe(projector => {
                if (projector) {
                    const title = projector.name;
                    super.setTitle(title);
                    this.projector = projector;
                }
            })
        );
    }
}
