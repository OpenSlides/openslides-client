import { Component } from '@angular/core';

import { modifyAgendaItemNumber } from '../agenda_item_number';
import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { isBaseIsAgendaItemContentObjectRepository } from 'app/core/repositories/base-is-agenda-item-content-object-repository';
import { SlideData } from 'app/core/ui-services/projector.service';
import { SpeechState } from 'app/shared/models/agenda/speaker';
import { BaseSlideComponent } from 'app/slides/base-slide-component';
import { CommonListOfSpeakersSlideData } from './common-list-of-speakers-slide-data';

@Component({
    selector: 'os-common-list-of-speakers-slide',
    templateUrl: './common-list-of-speakers-slide.component.html',
    styleUrls: ['./common-list-of-speakers-slide.component.scss']
})
export class CommonListOfSpeakersSlideComponent extends BaseSlideComponent<CommonListOfSpeakersSlideData> {
    public SpeechState = SpeechState;

    public title: string | null = null;

    public get waitingSpeakers(): number | null {
        if (Number.isFinite(this.data.data?.number_of_waiting_speakers)) {
            return this.data.data.number_of_waiting_speakers;
        } else {
            return null;
        }
    }

    public constructor(private collectionMapperService: CollectionMapperService) {
        super();
    }

    protected setData(value: SlideData<CommonListOfSpeakersSlideData>): void {
        const hasData = value?.data && Object.keys(value.data).length > 0; // the CLOS slide may be empty `{}`.
        if (hasData) {
            modifyAgendaItemNumber(value.data.title_information);
        }
        super.setData(value);

        if (hasData) {
            const repo = this.collectionMapperService.getRepository(this.data.data.title_information.collection);
            if (!isBaseIsAgendaItemContentObjectRepository(repo)) {
                throw new Error('The content object has no agenda base repository!');
            }
            this.title = repo.getAgendaSlideTitle(this.data.data.title_information);
        } else {
            this.title = '';
        }
    }
}
