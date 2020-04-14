import { AgendaItemRepositoryService, AgendaListTitle } from './agenda/agenda-item-repository.service';
import { BaseModel, ModelConstructor } from 'app/shared/models/base/base-model';
import { HasAgendaItemId } from 'app/shared/models/base/has-agenda-item-id';
import { HasListOfSpeakersId } from 'app/shared/models/base/has-list-of-speakers-id';
import { HasAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { HasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseViewModel } from 'app/site/base/base-view-model';
import {
    IBaseIsAgendaItemContentObjectRepository,
    isBaseIsAgendaItemContentObjectRepository
} from './base-is-agenda-item-content-object-repository';
import {
    IBaseIsListOfSpeakersContentObjectRepository,
    isBaseIsListOfSpeakersContentObjectRepository
} from './base-is-list-of-speakers-content-object-repository';
import { BaseRepository } from './base-repository';
import { RepositoryServiceCollector } from './repository-service-collector';

export function isBaseIsAgendaItemAndListOfSpeakersContentObjectRepository(
    obj: any
): obj is BaseIsAgendaItemAndListOfSpeakersContentObjectRepository<any, any> {
    return (
        !!obj && isBaseIsAgendaItemContentObjectRepository(obj) && isBaseIsListOfSpeakersContentObjectRepository(obj)
    );
}

/**
 * The base repository for objects with an agenda item and a list of speakers. This is some kind of
 * multi-inheritance by implementing both inherit classes again...
 */
export abstract class BaseIsAgendaItemAndListOfSpeakersContentObjectRepository<
        V extends BaseViewModel & HasAgendaItem & HasListOfSpeakers,
        M extends BaseModel & HasAgendaItemId & HasListOfSpeakersId
    >
    extends BaseRepository<V, M>
    implements IBaseIsAgendaItemContentObjectRepository<V, M>, IBaseIsListOfSpeakersContentObjectRepository<V, M> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        baseModelCtor: ModelConstructor<M>,
        protected agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, baseModelCtor);
    }
    public getAgendaListTitle(viewModel: V): AgendaListTitle {
        // Return the agenda title with the model's verbose name appended
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewModel);
        const title = numberPrefix + this.getTitle(viewModel) + ' (' + this.getVerboseName() + ')';
        return { title };
    }

    public getAgendaSlideTitle(viewModel: V): string {
        const numberPrefix =
            viewModel.agenda_item && viewModel.agenda_item.item_number ? `${viewModel.agenda_item.item_number} · ` : '';
        return numberPrefix + this.getTitle(viewModel);
    }

    public getListOfSpeakersTitle = (viewModel: V) => {
        return this.getAgendaListTitle(viewModel).title;
    };

    public getListOfSpeakersSlideTitle = (viewModel: V) => {
        return this.getAgendaSlideTitle(viewModel);
    };

    protected createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getAgendaListTitle = () => this.getAgendaListTitle(viewModel);
        viewModel.getAgendaSlideTitle = () => this.getAgendaSlideTitle(viewModel);
        viewModel.getListOfSpeakersTitle = () => this.getListOfSpeakersTitle(viewModel);
        viewModel.getListOfSpeakersSlideTitle = () => this.getListOfSpeakersSlideTitle(viewModel);
        return viewModel;
    }
}
