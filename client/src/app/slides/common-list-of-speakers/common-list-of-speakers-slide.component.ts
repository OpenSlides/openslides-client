import { Component } from '@angular/core';

import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { isBaseIsAgendaItemContentObjectRepository } from 'app/core/repositories/base-is-agenda-item-content-object-repository';
import { SlideData } from 'app/core/ui-services/projector.service';
import { BaseSlideComponent } from 'app/slides/base-slide-component';
import { CommonListOfSpeakersSlideData } from './common-list-of-speakers-slide-data';

@Component({
    selector: 'os-common-list-of-speakers-slide',
    templateUrl: './common-list-of-speakers-slide.component.html',
    styleUrls: ['./common-list-of-speakers-slide.component.scss']
})
export class CommonListOfSpeakersSlideComponent extends BaseSlideComponent<CommonListOfSpeakersSlideData> {
    public constructor(private collectionMapperService: CollectionMapperService) {
        super();
    }

    protected setData(value: SlideData<CommonListOfSpeakersSlideData>): void {
        // This is a hack to circumvent the relating handling for the title functions.
        // E.g. for topics, the title function would use `topic.agenda_item.item_number`, which
        // should refer to the provided `agenda_item_number` in the payload.
        console.log('TODO');
        /*value.data.items.forEach(
            item => (item.title_information.agenda_item = { item_number: item.title_information.agenda_item_number })
        );*/
        super.setData(value);
    }

    public getTitle(): string {
        if (!this.data.data.content_object_collection || !this.data.data.title_information) {
            return '';
        }

        const repo = this.collectionMapperService.getRepository(this.data.data.content_object_collection);

        if (isBaseIsAgendaItemContentObjectRepository(repo)) {
            return repo.getAgendaSlideTitle(this.data.data.title_information);
        } else {
            throw new Error('The content object has no agenda base repository!');
        }
    }

    /**
     * @retuns the amount of waiting speakers
     */
    public getSpeakersCount(): number {
        if (this.data && this.data.data.waiting) {
            return this.data.data.waiting.length;
        }
        return 0;
    }
}
