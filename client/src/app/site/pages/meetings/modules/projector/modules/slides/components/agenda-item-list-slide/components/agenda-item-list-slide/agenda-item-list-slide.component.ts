import { Component } from '@angular/core';
import { isAgendaItemContentObjectRepository } from 'src/app/gateways/repositories/base-agenda-item-content-object-repository';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';

import { BaseSlideComponent } from '../../../../base/base-slide-component';
import { modifyAgendaItemNumber } from '../../../../definitions/agenda_item_number';
import { AgendaItemListSlideData, SlideItem } from '../../agenda-item-list-slide-data';

@Component({
    selector: `os-agenda-item-list-slide`,
    templateUrl: `./agenda-item-list-slide.component.html`,
    styleUrls: [`./agenda-item-list-slide.component.scss`]
})
export class AgendaItemListSlideComponent extends BaseSlideComponent<AgendaItemListSlideData> {
    public constructor(private collectionMapperService: CollectionMapperService) {
        super();
    }

    protected override setData(value: SlideData<AgendaItemListSlideData>): void {
        value.data.items.forEach(item => modifyAgendaItemNumber(item.title_information));
        super.setData(value);
    }

    public getTitle(item: SlideItem): string {
        const repo = this.collectionMapperService.getRepository(item.title_information[`collection`]);
        if (isAgendaItemContentObjectRepository(repo)) {
            return repo!.getAgendaListTitle(item.title_information).title;
        } else {
            throw new Error(`The content object has no agenda based repository!`);
        }
    }

    public getItemStyle(item: SlideItem): object {
        return {
            'margin-left': 20 * item.depth + `px`
        };
    }
}
