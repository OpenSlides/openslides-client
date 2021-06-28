import { Component, Input } from '@angular/core';

import { ItemListSlideData, SlideItem } from './agenda-item-list-slide-data';
import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { isBaseIsAgendaItemContentObjectRepository } from 'app/core/repositories/base-is-agenda-item-content-object-repository';
import { SlideData } from 'app/core/ui-services/projector.service';
import { BaseSlideComponent } from 'app/slides/base-slide-component';

@Component({
    selector: 'os-agenda-item-list-slide',
    templateUrl: './agenda-item-list-slide.component.html',
    styleUrls: ['./agenda-item-list-slide.component.scss']
})
export class ItemListSlideComponent extends BaseSlideComponent<ItemListSlideData> {
    @Input()
    public set data(value: SlideData<ItemListSlideData>) {
        // This is a hack to circumvent the relating handling for the title functions.
        // E.g. for topics, the title function would use `topic.agenda_item.item_number`, which
        // should refer to the provided `agenda_item_number` in the payload.
        value.data.items.forEach(
            item => (item.title_information.agenda_item = { item_number: item.title_information.agenda_item_number })
        );
        this._data = value;
    }

    public get data(): SlideData<ItemListSlideData> {
        return this._data;
    }

    public constructor(private collectionMapperService: CollectionMapperService) {
        super();
    }

    public getTitle(item: SlideItem): string {
        const repo = this.collectionMapperService.getRepository(item.title_information.collection);
        if (isBaseIsAgendaItemContentObjectRepository(repo)) {
            return repo.getListTitle(item.title_information);
        } else {
            throw new Error('The content object has no agenda based repository!');
        }
    }

    public getItemStyle(item: SlideItem): object {
        return {
            'margin-left': 20 * item.depth + 'px'
        };
    }
}
