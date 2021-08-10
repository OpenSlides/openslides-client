import { Component } from '@angular/core';

import { modifyAgendaItemNumber } from '../agenda_item_number';
import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { collectionFromFqid } from 'app/core/core-services/key-transforms';
import { SlideData } from 'app/core/ui-services/projector.service';
import { OptionData, OptionTitle, PollData } from 'app/shared/models/poll/generic-poll';
import { PollState } from 'app/shared/models/poll/poll-constants';
import { PollService } from 'app/site/polls/services/poll.service';
import { BaseSlideComponent } from '../base-slide-component';
import { PollSlideData, SlideOption } from './poll-slide-data';
import { of } from 'rxjs';

export enum PollContentObjectType {
    Standalone = 'standalone',
    Motion = 'motion',
    Assignment = 'assignment'
}

@Component({
    selector: 'os-poll-slide',
    templateUrl: './poll-slide.component.html',
    styleUrls: ['./poll-slide.component.scss']
})
export class PollSlideComponent extends BaseSlideComponent<PollSlideData> {
    public PollState = PollState;
    public PollContentObjectType = PollContentObjectType;

    public pollContentObjectType: PollContentObjectType = null;

    public title: string;
    public subtitle: string;

    public polldata: PollData;

    public constructor(public pollService: PollService, private collectionMapperService: CollectionMapperService) {
        super();
    }

    protected setData(value: SlideData<PollSlideData>): void {
        super.setData(value);

        // Convert every decimal(string) to a float
        ['votesvalid', 'votesinvalid', 'votescast'].forEach((field: keyof PollSlideData) => {
            if (value.data[field] !== undefined) {
                (value.data[field] as any) = parseFloat(value.data[field] as any);
            }
        });
        if (value.data.global_option) {
            ['yes', 'no', 'abstain'].forEach((field: keyof SlideOption) => {
                if (value.data.global_option[field] !== undefined) {
                    (value.data.global_option[field] as any) = parseFloat(value.data.global_option[field] as any);
                }
            });
        }
        value.data.options.forEach(option => {
            ['yes', 'no', 'abstain'].forEach((field: keyof SlideOption) => {
                if (option[field] !== undefined) {
                    (option[field] as any) = parseFloat(option[field] as any);
                }
            });
        });

        if (value.data.state === PollState.Published) {
            this.polldata = this.createPollData(value.data);
        }

        if (value.data.content_object_id) {
            this.pollContentObjectType = collectionFromFqid(value.data.content_object_id) as PollContentObjectType;
        } else {
            this.pollContentObjectType = PollContentObjectType.Standalone;
        }

        if (value.data.title_information) {
            modifyAgendaItemNumber(value.data.title_information);
            const repo = this.collectionMapperService.getRepository(value.data.title_information.collection);
            this.title = repo.getTitle(value.data.title_information as any);
            this.subtitle = value.data.title;
        } else {
            this.title = value.data.title;
            this.subtitle = null;
        }
    }

    private createPollData(data: PollSlideData): PollData {
        const getContentObjectTitle = () => {
            if (data.title_information) {
                modifyAgendaItemNumber(data.title_information);
                const repo = this.collectionMapperService.getRepository(data.title_information.collection);
                return repo.getTitle(data.title_information as any);
            } else {
                return null;
            }
        };
        const options = data.options.map((option, i) => this.createOptionData(option, i + 1));
        const poll: PollData = {
            getContentObjectTitle,
            pollmethod: data.pollmethod,
            state: data.state,
            onehundred_percent_base: data.onehundred_percent_base,
            votesvalid: data.votesvalid,
            votesinvalid: data.votesinvalid,
            votescast: data.votescast,
            type: data.type,
            entitled_users_at_stop: data.entitled_users_at_stop,
            options: options,
            options_as_observable: of(options),
            global_option: data.global_option
                ? this.createOptionData(data.global_option)
                : ({ getOptionTitle: () => ({ title: '' }) } as OptionData)
        };
        return poll;
    }

    private createOptionData(data: SlideOption, weight: number = 1): OptionData {
        console.log(data);
        const getOptionTitle: () => OptionTitle = () => {
            if (data.text) {
                return { title: data.text };
            } else {
                modifyAgendaItemNumber(data.content_object);
                const repo = this.collectionMapperService.getRepository(data.content_object.collection);
                return { title: repo.getTitle(data.content_object as any) };
            }
        };
        return {
            getOptionTitle,
            yes: data.yes,
            no: data.no,
            abstain: data.abstain,
            weight
        };
    }
}
