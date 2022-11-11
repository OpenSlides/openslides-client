import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HasProjectorTitle } from 'src/app/domain/interfaces';
import { DetailNavigable, isDetailNavigable } from 'src/app/domain/interfaces/detail-navigable';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from '../../../../services/meeting-component-service-collector.service';
import { ViewListOfSpeakers } from '../../../agenda';
import { CurrentListOfSpeakersService } from '../../../agenda/modules/list-of-speakers/services/current-list-of-speakers.service';
import { ListOfSpeakersControllerService } from '../../../agenda/modules/list-of-speakers/services/list-of-speakers-controller.service';
import { HasPolls } from '../../../polls';
import { ViewProjection, ViewProjector } from '../../../projectors';
import { ProjectorControllerService } from '../../../projectors/services/projector-controller.service';

@Component({
    selector: `os-autopilot`,
    templateUrl: `./autopilot.component.html`,
    styleUrls: [`./autopilot.component.scss`]
})
export class AutopilotComponent extends BaseMeetingComponent implements OnInit {
    public listOfSpeakers: ViewListOfSpeakers | null = null;
    public projector: ViewProjector | null = null;
    public projectedViewModel: (BaseViewModel & HasProjectorTitle & Partial<HasPolls>) | null = null;

    /**
     * filled by child component
     */
    public canReaddLastSpeaker: boolean = false;

    public get title(): string {
        if (this._currentProjection) {
            return this._currentProjection.getTitle();
        } else {
            return ``;
        }
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

    public get projectionTarget(): '_blank' | '_self' {
        if (this.operator.hasPerms(this.permission.projectorCanManage)) {
            return `_self`;
        } else {
            return `_blank`;
        }
    }

    public get lowerProjectionTarget(): '_blank' | '_self' {
        if (this.projectedViewModel?.COLLECTION === Mediafile.COLLECTION) {
            return `_blank`;
        } else {
            return `_self`;
        }
    }

    private _currentProjection: ViewProjection | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private operator: OperatorService,
        projectorRepo: ProjectorControllerService,
        closService: CurrentListOfSpeakersService,
        private listOfSpeakersRepo: ListOfSpeakersControllerService
    ) {
        super(componentServiceCollector, translate);

        this.subscriptions.push(
            projectorRepo.getReferenceProjectorObservable().subscribe(refProjector => {
                if (refProjector) {
                    this.projector = refProjector;
                    const currentProjections = refProjector.nonStableCurrentProjections;
                    this._currentProjection = currentProjections.length > 0 ? currentProjections[0] : null;
                    this.projectedViewModel = this._currentProjection?.content_object || null;
                }
            }),
            closService.currentListOfSpeakersObservable.subscribe(clos => {
                this.listOfSpeakers = clos;
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
}
