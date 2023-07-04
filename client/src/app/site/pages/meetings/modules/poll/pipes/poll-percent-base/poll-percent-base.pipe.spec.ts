import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import {
    OptionData,
    PollClassType,
    PollData,
    PollMethod,
    PollPercentBase,
    PollState,
    PollTableData,
    PollType
} from 'src/app/domain/models/poll';

import { PollService } from '../../services/poll.service';
import { PollServiceMapperService } from '../../services/poll-service-mapper.service';
import { PollPercentBasePipe } from './poll-percent-base.pipe';

class MockPollServiceMapperService {
    public getService(pollClassType: PollClassType): MockPollService {
        if (pollClassType !== PollClassType.Assignment && pollClassType !== PollClassType.Topic) {
            return null;
        }
        return new MockPollService(pollClassType);
    }
}

class MockPollService {
    private type: string;

    public constructor(type: PollClassType) {
        this.type = type;
    }

    public getVoteValueInPercent(
        value: number,
        {
            poll,
            row
        }: {
            poll: PollData;
            row?: OptionData | PollTableData;
        }
    ): string {
        return `${this.type ?? `default`}: ${value}, "${JSON.stringify(poll)}", "${JSON.stringify(row)}"`;
    }
}

class MockInjectablePollService extends MockPollService {
    public constructor() {
        super(undefined);
    }
}

const testPollData: { [key: string]: PollData } = {
    assignmentPoll: {
        pollClassType: PollClassType.Assignment,
        pollmethod: PollMethod.YN,
        state: PollState.Created,
        onehundred_percent_base: PollPercentBase.Entitled,
        votesvalid: 1,
        votesinvalid: 2,
        votescast: 3,
        type: PollType.Named,
        entitled_users_at_stop: [],
        options: [
            { getOptionTitle: () => ({ title: `A man` }) },
            { getOptionTitle: () => ({ title: `A woman` }) },
            { getOptionTitle: () => ({ title: `A child` }) }
        ],
        options_as_observable: new Observable<OptionData[]>(),
        global_option: { getOptionTitle: () => ({ title: `Global yes` }) },
        getContentObjectTitle: () => `An assignment`
    },
    topicPoll: {
        pollClassType: PollClassType.Topic,
        pollmethod: PollMethod.Y,
        state: PollState.Finished,
        onehundred_percent_base: PollPercentBase.Y,
        votesvalid: 40,
        votesinvalid: 2,
        votescast: 42,
        type: PollType.Pseudoanonymous,
        entitled_users_at_stop: [],
        options: [
            { getOptionTitle: () => ({ title: `Humans` }) },
            { getOptionTitle: () => ({ title: `Dolphins` }) },
            { getOptionTitle: () => ({ title: `Mice` }) }
        ],
        options_as_observable: new Observable<OptionData[]>(),
        global_option: undefined,
        getContentObjectTitle: () => `On intelligence`
    },
    motionPoll: {
        pollClassType: PollClassType.Motion,
        pollmethod: PollMethod.YNA,
        state: PollState.Published,
        onehundred_percent_base: PollPercentBase.Y,
        votesvalid: 5,
        votesinvalid: 6,
        votescast: 11,
        type: PollType.Analog,
        entitled_users_at_stop: [],
        options: [{ getOptionTitle: () => ({ title: `option` }) }],
        options_as_observable: new Observable<OptionData[]>(),
        global_option: undefined,
        getContentObjectTitle: () => `A motion`
    }
};

describe(`PollPercentBasePipe`, () => {
    let pipe: PollPercentBasePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                PollPercentBasePipe,
                { provide: PollServiceMapperService, useClass: MockPollServiceMapperService },
                { provide: PollService, useClass: MockInjectablePollService }
            ]
        }).compileComponents();

        TestBed.inject(PollService);
        TestBed.inject(PollServiceMapperService);
        pipe = TestBed.inject(PollPercentBasePipe);
    });

    it(`test with assignment poll data`, () => {
        const poll = testPollData[`assignmentPoll`];
        const options = poll.options;
        expect(pipe.transform(0, poll, options[0])).toBe(
            `(assignment: 0, "{"pollClassType":"assignment","pollmethod":"YN","state":"created","onehundred_percent_base":"entitled","votesvalid":1,"votesinvalid":2,"votescast":3,"type":"named","entitled_users_at_stop":[],"options":[{},{},{}],"options_as_observable":{},"global_option":{}}", "{}")`
        );
        expect(pipe.transform(2, poll, options[1])).toBe(
            `(assignment: 2, "{"pollClassType":"assignment","pollmethod":"YN","state":"created","onehundred_percent_base":"entitled","votesvalid":1,"votesinvalid":2,"votescast":3,"type":"named","entitled_users_at_stop":[],"options":[{},{},{}],"options_as_observable":{},"global_option":{}}", "{}")`
        );
        expect(pipe.transform(5, poll, options[6])).toBe(
            `(assignment: 5, "{"pollClassType":"assignment","pollmethod":"YN","state":"created","onehundred_percent_base":"entitled","votesvalid":1,"votesinvalid":2,"votescast":3,"type":"named","entitled_users_at_stop":[],"options":[{},{},{}],"options_as_observable":{},"global_option":{}}", "undefined")`
        );
    });

    it(`test with topic poll data`, () => {
        const poll = testPollData[`topicPoll`];
        const options: PollTableData[] = [
            { votingOption: `Humans`, value: [] },
            { votingOption: `Dolphins`, value: [] },
            { votingOption: `Mice`, value: [] }
        ];
        expect(pipe.transform(0, poll, options[0])).toBe(
            `(topic: 0, "{"pollClassType":"topic","pollmethod":"Y","state":"finished","onehundred_percent_base":"Y","votesvalid":40,"votesinvalid":2,"votescast":42,"type":"pseudoanonymous","entitled_users_at_stop":[],"options":[{},{},{}],"options_as_observable":{}}", "{"votingOption":"Humans","value":[]}")`
        );
        expect(pipe.transform(2, poll, options[1])).toBe(
            `(topic: 2, "{"pollClassType":"topic","pollmethod":"Y","state":"finished","onehundred_percent_base":"Y","votesvalid":40,"votesinvalid":2,"votescast":42,"type":"pseudoanonymous","entitled_users_at_stop":[],"options":[{},{},{}],"options_as_observable":{}}", "{"votingOption":"Dolphins","value":[]}")`
        );
        expect(pipe.transform(5, poll, options[6])).toBe(
            `(topic: 5, "{"pollClassType":"topic","pollmethod":"Y","state":"finished","onehundred_percent_base":"Y","votesvalid":40,"votesinvalid":2,"votescast":42,"type":"pseudoanonymous","entitled_users_at_stop":[],"options":[{},{},{}],"options_as_observable":{}}", "undefined")`
        );
    });

    it(`test with motion poll data`, () => {
        const poll = testPollData[`motionPoll`];
        const options = poll.options;
        expect(pipe.transform(0, poll, options[0])).toBe(
            `(default: 0, "{"pollClassType":"motion","pollmethod":"YNA","state":"published","onehundred_percent_base":"Y","votesvalid":5,"votesinvalid":6,"votescast":11,"type":"analog","entitled_users_at_stop":[],"options":[{}],"options_as_observable":{}}", "{}")`
        );
        expect(pipe.transform(2, poll, options[1])).toBe(
            `(default: 2, "{"pollClassType":"motion","pollmethod":"YNA","state":"published","onehundred_percent_base":"Y","votesvalid":5,"votesinvalid":6,"votescast":11,"type":"analog","entitled_users_at_stop":[],"options":[{}],"options_as_observable":{}}", "undefined")`
        );
        expect(pipe.transform(5, poll, options[6])).toBe(
            `(default: 5, "{"pollClassType":"motion","pollmethod":"YNA","state":"published","onehundred_percent_base":"Y","votesvalid":5,"votesinvalid":6,"votescast":11,"type":"analog","entitled_users_at_stop":[],"options":[{}],"options_as_observable":{}}", "undefined")`
        );
    });
});
