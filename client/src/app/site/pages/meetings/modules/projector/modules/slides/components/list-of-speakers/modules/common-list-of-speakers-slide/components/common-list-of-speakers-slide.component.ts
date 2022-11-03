import { Component } from '@angular/core';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { isAgendaItemContentObjectRepository } from 'src/app/gateways/repositories/base-agenda-item-content-object-repository';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';

import { BaseSlideComponent } from '../../../../../base/base-slide-component';
import { modifyAgendaItemNumber } from '../../../../../definitions';
import { CommonListOfSpeakersSlideData } from '../common-list-of-speakers-slide-data';

@Component({
    selector: `os-common-list-of-speakers-slide`,
    templateUrl: `./common-list-of-speakers-slide.component.html`,
    styleUrls: [`./common-list-of-speakers-slide.component.scss`]
})
export class CommonListOfSpeakersSlideComponent extends BaseSlideComponent<CommonListOfSpeakersSlideData> {
    public SpeechState = SpeechState;

    public title: string | null = null;

    public get waitingSpeakers(): number | null {
        if (Number.isFinite(this.data.data?.number_of_waiting_speakers)) {
            return this.data.data.number_of_waiting_speakers!;
        } else {
            return null;
        }
    }

    public constructor(private collectionMapperService: CollectionMapperService) {
        super();
    }

    protected override setData(value: SlideData<CommonListOfSpeakersSlideData>): void {
        const hasData = value?.data && Object.keys(value.data).length > 0; // the CLOS slide may be empty `{}`.
        if (hasData) {
            modifyAgendaItemNumber(value.data.title_information);
        }
        super.setData(value);

        if (hasData && this.data.data.title_information) {
            const repo = this.collectionMapperService.getRepository(this.data.data.title_information.collection);
            if (!isAgendaItemContentObjectRepository(repo)) {
                throw new Error(`The content object has no agenda base repository!`);
            }
            this.title = repo.getAgendaSlideTitle(this.data.data.title_information);
        } else {
            this.title = ``;
        }
    }
}
