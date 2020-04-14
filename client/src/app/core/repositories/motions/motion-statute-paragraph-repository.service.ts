import { Injectable } from '@angular/core';

import { MotionStatuteParagraph } from 'app/shared/models/motions/motion-statute-paragraph';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for statute paragraphs
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link DataSendService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionStatuteParagraphRepositoryService extends BaseRepository<
    ViewMotionStatuteParagraph,
    MotionStatuteParagraph
> {
    /**
     * Creates a StatuteParagraphRepository
     * Converts existing and incoming statute paragraphs to ViewStatuteParagraphs
     * Handles CRUD using an observer to the DataStore
     *
     * @param DS The DataStore
     * @param mapperService Maps collection strings to classes
     * @param dataSend sending changed objects
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionStatuteParagraph);
    }

    public getTitle = (viewMotionStatuteParagraph: ViewMotionStatuteParagraph) => {
        return viewMotionStatuteParagraph.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Statute paragraphs' : 'Statute paragraph');
    };
}
