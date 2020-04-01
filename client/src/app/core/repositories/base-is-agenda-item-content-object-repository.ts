import {
    AgendaListTitle,
    BaseViewModelWithAgendaItem,
    TitleInformationWithAgendaItem
} from 'app/site/base/base-view-model-with-agenda-item';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseRepository } from './base-repository';
import { RepositoryServiceCollector } from './repository-service-collector';

export function isBaseIsAgendaItemContentObjectRepository(
    obj: any
): obj is BaseIsAgendaItemContentObjectRepository<any, any, any> {
    const repo = obj as BaseIsAgendaItemContentObjectRepository<any, any, any>;
    return !!obj && repo.getAgendaSlideTitle !== undefined && repo.getAgendaListTitle !== undefined;
}

/**
 * Describes a base repository which objects do have an assigned agenda item.
 */
export interface IBaseIsAgendaItemContentObjectRepository<
    V extends BaseViewModelWithAgendaItem & T,
    M extends BaseModel,
    T extends TitleInformationWithAgendaItem
> extends BaseRepository<V, M, T> {
    getAgendaListTitle: (titleInformation: T) => AgendaListTitle;
    getAgendaSlideTitle: (titleInformation: T) => string;
}

/**
 * The base repository for objects with an agenda item.
 */
export abstract class BaseIsAgendaItemContentObjectRepository<
    V extends BaseViewModelWithAgendaItem & T,
    M extends BaseModel,
    T extends TitleInformationWithAgendaItem
> extends BaseRepository<V, M, T> implements IBaseIsAgendaItemContentObjectRepository<V, M, T> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, baseModelCtor: ModelConstructor<M>) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    /**
     * @returns the agenda title for the agenda item list. Should
     * be `<item number> · <title> (<type>)`. E.g. `7 · the is an election (Election)`.
     */
    public getAgendaListTitle(titleInformation: T): AgendaListTitle {
        // Return the agenda title with the model's verbose name appended
        const numberPrefix = titleInformation.agenda_item_number() ? `${titleInformation.agenda_item_number()} · ` : '';
        const title = numberPrefix + this.getTitle(titleInformation) + ' (' + this.getVerboseName() + ')';
        return { title };
    }

    /**
     * @returns the agenda title for the item slides
     */
    public getAgendaSlideTitle(titleInformation: T): string {
        return this.getTitle(titleInformation);
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
