import { AgendaItemRepositoryService, AgendaListTitle } from './agenda/agenda-item-repository.service';
import { HasAgendaItemId } from 'app/shared/models/base/has-agenda-item-id';
import { HasAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseRepository } from './base-repository';
import { RepositoryServiceCollector } from './repository-service-collector';

export function isBaseIsAgendaItemContentObjectRepository(
    obj: any
): obj is BaseIsAgendaItemContentObjectRepository<any, any> {
    const repo = obj as BaseIsAgendaItemContentObjectRepository<any, any>;
    return !!obj && repo.getAgendaSlideTitle !== undefined && repo.getAgendaListTitle !== undefined;
}

/**
 * Describes a base repository which objects do have an assigned agenda item.
 */
export interface IBaseIsAgendaItemContentObjectRepository<
    V extends BaseViewModel & HasAgendaItem,
    M extends BaseModel & HasAgendaItemId
> extends BaseRepository<V, M> {
    getAgendaListTitle: (viewModel: V) => AgendaListTitle;
    getAgendaSlideTitle: (viewModel: V) => string;
}

/**
 * The base repository for objects with an agenda item.
 */
export abstract class BaseIsAgendaItemContentObjectRepository<
    V extends BaseViewModel & HasAgendaItem,
    M extends BaseModel & HasAgendaItemId
> extends BaseRepository<V, M> implements IBaseIsAgendaItemContentObjectRepository<V, M> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        baseModelCtor: ModelConstructor<M>,
        protected agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    /**
     * @returns the agenda title for the agenda item list. Should
     * be `<item number> · <title> (<type>)`. E.g. `7 · the is an election (Election)`.
     */
    public getAgendaListTitle(viewModel: V): AgendaListTitle {
        // Return the agenda title with the model's verbose name appended
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewModel);
        const title = numberPrefix + this.getTitle(viewModel) + ' (' + this.getVerboseName() + ')';
        return { title };
    }

    /**
     * @returns the agenda title for the item slides
     */
    public getAgendaSlideTitle(viewModel: V): string {
        return this.getTitle(viewModel);
    }

    /**
     * Adds the agenda titles to the viewmodel.
     */
    protected createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getAgendaListTitle = () => this.getAgendaListTitle(viewModel);
        viewModel.getAgendaSlideTitle = () => this.getAgendaSlideTitle(viewModel);
        return viewModel;
    }
}
