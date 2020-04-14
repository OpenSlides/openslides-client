import { Injectable } from '@angular/core';

import { Tag } from 'app/shared/models/core/tag';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for Tags
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link DataSendService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class TagRepositoryService extends BaseRepository<ViewTag, Tag> {
    /**
     * Creates a TagRepository
     * Converts existing and incoming Tags to ViewTags
     * Handles CRUD using an observer to the DataStore
     *
     * @param DS DataStore
     * @param mapperService Maps collection strings to classes
     * @param dataSend sending changed objects
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Tag);
        this.initSorting();
    }

    public getTitle = (viewTag: ViewTag) => {
        return viewTag.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Tags' : 'Tag');
    };

    /**
     * Sets the default sorting (e.g. in dropdowns and for new users) to 'name'
     */
    private initSorting(): void {
        this.setSortFunction((a: ViewTag, b: ViewTag) => {
            return this.languageCollator.compare(a.name, b.name);
        });
    }
}
