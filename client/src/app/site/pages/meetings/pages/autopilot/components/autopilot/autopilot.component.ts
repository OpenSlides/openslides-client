import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { HasProjectorTitle } from 'src/app/domain/interfaces';
import { DetailNavigable, isDetailNavigable } from 'src/app/domain/interfaces/detail-navigable';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { MeetingMediafile } from 'src/app/domain/models/meeting-mediafile/meeting-mediafile';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { ViewListOfSpeakers } from '../../../agenda';
import { CurrentListOfSpeakersService } from '../../../agenda/modules/list-of-speakers/services/current-list-of-speakers.service';
import { ListOfSpeakersControllerService } from '../../../agenda/modules/list-of-speakers/services/list-of-speakers-controller.service';
import { HasPolls } from '../../../polls';
import { ViewProjection, ViewProjector } from '../../../projectors';
import { ProjectorControllerService } from '../../../projectors/services/projector-controller.service';
import { AutopilotService } from '../../services/autopilot.service';
import { AutopilotSettingsComponent } from '../autopilot-settings/autopilot-settings.component';

@Component({
    selector: `os-autopilot`,
    templateUrl: `./autopilot.component.html`,
    styleUrls: [`./autopilot.component.scss`],
    standalone: false
})
export class AutopilotComponent extends BaseMeetingComponent implements OnInit {
    public listOfSpeakers: ViewListOfSpeakers | null = null;
    public projector: ViewProjector | null = null;
    public projectedViewModel: (BaseViewModel & HasProjectorTitle & Partial<HasPolls>) | null = null;

    /**
     * filled by child component
     */
    public canReaddLastSpeaker = false;

    public get title(): string {
        if (this._currentProjection) {
            return this._currentProjection.getTitle();
        } else {
            return ``;
        }
    }

    public get showPollCollection(): boolean {
        return (
            this._currentProjection?.type !== `agenda_item_list` && this._currentProjection?.type !== `wifi_access_data`
        );
    }

    public get projectorTitle(): string {
        return this.projector?.getTitle() || ``;
    }

    public get closUrl(): string {
        if (this.listOfSpeakers && this.operator.hasPerms(this.permission.listOfSpeakersCanManage)) {
            return this.listOfSpeakers?.listOfSpeakersUrl;
        } else {
            return ``;
        }
    }

    public get isLosClosed(): boolean {
        return this.listOfSpeakers?.closed || false;
    }

    public get viewModelUrl(): string {
        if (this.projectedViewModel && isDetailNavigable(this.projectedViewModel)) {
            return (this.projectedViewModel as DetailNavigable).getDetailStateUrl();
        } else {
            return ``;
        }
    }

    public get projectorUrl(): string {
        if (this.projector) {
            if (this.operator.hasPerms(this.permission.projectorCanManage)) {
                return `/${this.activeMeetingId}/projectors/detail/${this.projector.sequential_number}`;
            } else {
                return `/${this.activeMeetingId}/projectors/${this.projector.sequential_number}`;
            }
        } else {
            return ``;
        }
    }

    public get projectionTarget(): `_blank` | `_self` {
        if (this.operator.hasPerms(this.permission.projectorCanManage)) {
            return `_self`;
        } else {
            return `_blank`;
        }
    }

    public get lowerProjectionTarget(): `_blank` | `_self` {
        if ([Mediafile.COLLECTION, MeetingMediafile.COLLECTION].includes(this.projectedViewModel?.COLLECTION)) {
            return `_blank`;
        } else {
            return `_self`;
        }
    }

    public get numDisabledElements(): number {
        return Object.values(this.disabledContentElements).filter(v => v).length;
    }

    public structureLevelCountdownEnabled = false;

    public disabledContentElements: Record<string, boolean> = {};

    public showRightCol = new BehaviorSubject<boolean>(false);

    private _currentProjection: ViewProjection | null = null;

    public constructor(
        protected override translate: TranslateService,
        private operator: OperatorService,
        private autopilotService: AutopilotService,
        projectorRepo: ProjectorControllerService,
        closService: CurrentListOfSpeakersService,
        private listOfSpeakersRepo: ListOfSpeakersControllerService,
        breakpoint: BreakpointObserver,
        private dialog: MatDialog
    ) {
        super();

        this.subscriptions.push(
            this.autopilotService.disabledContentElements.subscribe(keys => {
                this.disabledContentElements = keys || {};
            }),
            projectorRepo.getReferenceProjectorObservable().subscribe(refProjector => {
                if (refProjector) {
                    this.projector = refProjector;
                    const currentProjections = refProjector.nonStableCurrentProjections;
                    this._currentProjection =
                        currentProjections.length > 0 && !!currentProjections[0].meeting_id
                            ? currentProjections[0]
                            : null;
                    this.projectedViewModel = this._currentProjection?.content_object || null;
                    if (this.projectedViewModel?.collection === `list_of_speakers`) {
                        this.listOfSpeakers = this.projectedViewModel as ViewListOfSpeakers;
                    }
                }
            }),
            closService.currentListOfSpeakersObservable.subscribe(clos => {
                if (this.projectedViewModel?.collection !== `list_of_speakers`) {
                    this.listOfSpeakers = clos;
                }
            }),
            this.meetingSettingsService
                .get(`list_of_speakers_default_structure_level_time`)
                .subscribe(time => (this.structureLevelCountdownEnabled = time > 0)),
            breakpoint.observe([`(min-width: 1050px)`]).subscribe((state: BreakpointState) => {
                this.showRightCol.next(state.matches);
            })
        );
    }

    public ngOnInit(): void {
        super.setTitle(`Autopilot`);
    }

    public async toggleListOfSpeakersOpen(): Promise<void> {
        await this.listOfSpeakersRepo.setClosed(!this.isLosClosed, this.listOfSpeakers!);
    }

    public async readdLastSpeaker(): Promise<void> {
        await this.listOfSpeakersRepo.readdLastSpeaker(this.listOfSpeakers!).catch(this.raiseError);
    }

    public get hasCurrentProjection(): boolean {
        return !!this._currentProjection;
    }

    public customizeAutopilot(): void {
        this.dialog.open(AutopilotSettingsComponent);
    }
}
