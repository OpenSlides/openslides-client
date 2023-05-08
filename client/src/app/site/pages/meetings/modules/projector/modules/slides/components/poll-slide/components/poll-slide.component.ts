import { Component } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { of } from 'rxjs';
import { OptionData, OptionTitle, PollData } from 'src/app/domain/models/poll/generic-poll';
import { PollClassType, PollState } from 'src/app/domain/models/poll/poll-constants';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { UnknownUserLabel } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll/services/assignment-poll.service';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { modifyAgendaItemNumber } from '../../../definitions';
import { PollSlideData, PollSlideDataFields, SlidePollOption, SlidePollOptionFields } from '../poll-slide-data';

export enum PollContentObjectType {
    Standalone = `standalone`,
    Motion = `motion`,
    Assignment = `assignment`,
    Topic = `topic`
}

@Component({
    selector: `os-poll-slide`,
    templateUrl: `./poll-slide.component.html`,
    styleUrls: [`./poll-slide.component.scss`]
})
export class PollSlideComponent extends BaseSlideComponent<PollSlideData> {
    public PollState = PollState;
    public PollContentObjectType = PollContentObjectType;

    public pollContentObjectType: PollContentObjectType | null = null;

    public title!: string;
    public subtitle: string | null = null;

    public polldata!: PollData;

    public constructor(public pollService: PollService, private collectionMapperService: CollectionMapperService) {
        super();
    }

    protected override setData(value: SlideData<PollSlideData>): void {
        super.setData(value);

        // Convert every decimal(string) to a float
        PollSlideDataFields.forEach((field: keyof PollSlideData) => {
            if (value.data[field] !== undefined) {
                (value.data[field] as any) = parseFloat(value.data[field] as any);
            }
        });
        if (value.data.global_option) {
            SlidePollOptionFields.forEach((field: keyof SlidePollOption) => {
                if (value.data.global_option[field] !== undefined) {
                    (value.data.global_option[field] as any) = parseFloat(value.data.global_option[field] as any);
                }
            });
        }
        value.data.options.forEach(option => {
            SlidePollOptionFields.forEach((field: keyof SlidePollOption) => {
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
            this.title = repo!.getTitle(value.data.title_information as any);
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
                return repo!.getTitle(data.title_information as any);
            } else {
                return null;
            }
        };
        const options = data.options.map((option, i) => this.createOptionData(option, i + 1));
        const poll: PollData = {
            getContentObjectTitle,
            pollmethod: data.pollmethod,
            pollClassType: <PollClassType>collectionFromFqid(data.content_object_id),
            state: data.state,
            onehundred_percent_base: data.onehundred_percent_base,
            votesvalid: data.votesvalid,
            votesinvalid: data.votesinvalid,
            votescast: data.votescast,
            type: data.type,
            entitled_users_at_stop: data.entitled_users_at_stop,
            options,
            options_as_observable: of(options),
            global_option: data.global_option
                ? this.createOptionData(data.global_option)
                : ({ getOptionTitle: () => ({ title: `` }) } as OptionData)
        };
        return poll;
    }

    private createOptionData(data: SlidePollOption, weight: number = 1): OptionData {
        const getOptionTitle: () => OptionTitle = () => {
            if (data.text) {
                return { title: data.text };
            } else if (data.content_object) {
                modifyAgendaItemNumber(data.content_object!);
                const repo = this.collectionMapperService.getRepository(data.content_object!.collection);
                return { title: repo!.getTitle(data.content_object as any) };
            } else {
                return this.pollContentObjectType === PollContentObjectType.Assignment
                    ? { title: UnknownUserLabel, subtitle: `` }
                    : { title: _(`No data`) };
            }
        };
        return {
            getOptionTitle,
            yes: data.yes,
            no: data.no,
            abstain: data.abstain,
            weight,
            ...(data.content_object ? { entries_amount: data.content_object[`entries_amount`] } : {})
        };
    }
}
