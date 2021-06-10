import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { OperatorService } from 'app/core/core-services/operator.service';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ProjectorService } from 'app/core/ui-services/projector.service';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseComponent } from 'app/site/base/components/base.component';
import { DetailNavigable, isDetailNavigable } from 'app/site/base/detail-navigable';
import { HasProjectorTitle } from 'app/site/base/projectable';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { CurrentListOfSpeakersService } from 'app/site/projector/services/current-list-of-speakers.service';

@Component({
    selector: 'os-cinema',
    templateUrl: './cinema.component.html',
    styleUrls: ['./cinema.component.scss']
})
export class CinemaComponent extends BaseComponent implements OnInit {
    public listOfSpeakers: ViewListOfSpeakers;
    public projector: ViewProjector;
    private currentProjection: ViewProjection | null = null;
    public projectedViewModel: (BaseViewModel & HasProjectorTitle) | null = null;

    /**
     * filled by child component
     */
    public canReaddLastSpeaker: boolean;

    public get title(): string {
        if (this.projectedViewModel) {
            return this.projectedViewModel.getListTitle();
        } else if (this.currentProjection) {
            return this.currentProjection.getTitle();
        } else {
            return '';
        }
    }

    public get projectorTitle(): string {
        return this.projector?.getTitle() || '';
    }

    public get closUrl(): string {
        if (this.listOfSpeakers && this.operator.hasPerms(this.permission.listOfSpeakersCanManage)) {
            return this.listOfSpeakers?.listOfSpeakersUrl;
        } else {
            return '';
        }
    }

    public get isLosClosed(): boolean {
        return this.listOfSpeakers?.closed;
    }

    public get viewModelUrl(): string {
        if (this.projectedViewModel && isDetailNavigable(this.projectedViewModel)) {
            return (this.projectedViewModel as DetailNavigable).getDetailStateURL();
        } else {
            return '';
        }
    }

    public get projectorUrl(): string {
        if (this.projector) {
            if (this.operator.hasPerms(this.permission.projectorCanManage)) {
                return `/${this.activeMeetingId}/projectors/detail/${this.projector.id}`;
            } else {
                return `/projector/${this.projector.id}`;
            }
        } else {
            return '';
        }
    }

    public get projectionTarget(): '_blank' | '_self' {
        if (this.operator.hasPerms(this.permission.projectorCanManage)) {
            return '_self';
        } else {
            return '_blank';
        }
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private operator: OperatorService,
        projectorRepo: ProjectorRepositoryService,
        closService: CurrentListOfSpeakersService,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService
    ) {
        super(componentServiceCollector);

        this.subscriptions.push(
            projectorRepo.getReferenceProjectorObservable().subscribe(refProjector => {
                this.projector = refProjector;
                const currentProjections = refProjector?.nonStableCurrentProjections;
                this.currentProjection = currentProjections?.length > 0 ? currentProjections[0] : null;
                this.projectedViewModel = this.currentProjection?.content_object || null;
            }),
            closService.currentListOfSpeakersObservable.subscribe(clos => {
                this.listOfSpeakers = clos;
            })
        );
    }

    public ngOnInit(): void {
        super.setTitle('Autopilot');
    }

    public async toggleListOfSpeakersOpen(): Promise<void> {
        if (this.isLosClosed) {
            await this.listOfSpeakersRepo.reopenListOfSpeakers(this.listOfSpeakers);
        } else {
            await this.listOfSpeakersRepo.closeListOfSpeakers(this.listOfSpeakers);
        }
    }

    public async readdLastSpeaker(): Promise<void> {
        await this.listOfSpeakersRepo.readdLastSpeaker(this.listOfSpeakers).catch(this.raiseError);
    }
}
