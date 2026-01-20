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
    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        baseModelCtor: ModelConstructor<M>,
        protected agendaItemRepo: AgendaItemRepositoryService
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

    public getListOfSpeakersTitle = (viewModel: V): string => this.getAgendaListTitle(viewModel).title;

    public getListOfSpeakersSlideTitle = (viewModel: V): string => this.getAgendaSlideTitle(viewModel);

    protected override createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getAgendaListTitle = (): AgendaListTitle => this.getAgendaListTitle(viewModel);
        viewModel.getAgendaSlideTitle = (): string => this.getAgendaSlideTitle(viewModel);
        viewModel.getListOfSpeakersTitle = (): string => this.getListOfSpeakersTitle(viewModel);
        viewModel.getListOfSpeakersSlideTitle = (): string => this.getListOfSpeakersSlideTitle(viewModel);
        return viewModel;
    }
}
