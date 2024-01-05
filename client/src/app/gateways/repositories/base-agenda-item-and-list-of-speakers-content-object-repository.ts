import { inject } from '@angular/core';
import { HasAgendaItemId, HasListOfSpeakersId } from 'src/app/domain/interfaces';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { AgendaListTitle, HasAgendaItem, HasListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

import { AgendaItemRepositoryService } from './agenda/agenda-item-repository.service';
import { AgendaItemContentObjectRepository } from './base-agenda-item-content-object-repository';
import { ListOfSpeakersContentObjectRepository } from './base-list-of-speakers-content-object-repository';
import { BaseMeetingRelatedRepository } from './base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from './repository-meeting-service-collector.service';

export abstract class BaseAgendaItemAndListOfSpeakersContentObjectRepository<
        V extends BaseViewModel & HasListOfSpeakers & HasAgendaItem,
        M extends BaseModel & HasListOfSpeakersId & HasAgendaItemId
    >
    extends BaseMeetingRelatedRepository<V, M>
    implements ListOfSpeakersContentObjectRepository<V, M>, AgendaItemContentObjectRepository<V, M>
{
    protected agendaItemRepo = inject(AgendaItemRepositoryService);

    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        baseModelCtor: ModelConstructor<M>
    ) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    public getAgendaListTitle(viewModel: V): AgendaListTitle {
        // Return the agenda title with the model's verbose name appended
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewModel);
        const title = numberPrefix + this.getTitle(viewModel) + ` (` + this.getVerboseName() + `)`;
        return { title };
    }

    public getAgendaSlideTitle(viewModel: V): string {
        const numberPrefix =
            viewModel.agenda_item && viewModel.agenda_item.item_number ? `${viewModel.agenda_item.item_number} · ` : ``;
        return numberPrefix + this.getTitle(viewModel);
    }

    public getListOfSpeakersTitle = (viewModel: V) => this.getAgendaListTitle(viewModel).title;

    public getListOfSpeakersSlideTitle = (viewModel: V) => this.getAgendaSlideTitle(viewModel);

    protected override createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getAgendaListTitle = () => this.getAgendaListTitle(viewModel);
        viewModel.getAgendaSlideTitle = () => this.getAgendaSlideTitle(viewModel);
        viewModel.getListOfSpeakersTitle = () => this.getListOfSpeakersTitle(viewModel);
        viewModel.getListOfSpeakersSlideTitle = () => this.getListOfSpeakersSlideTitle(viewModel);
        return viewModel;
    }
}
