import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslateService } from 'src/app/site/pages/meetings/modules/poll/pipes/poll-parse-number/poll-parse-number.pipe.spec';

import { MotionAction } from '../repositories/motions';
import { ErrorMapService } from './error-map.service';
import { ErrorMap, UrlFragmentToHttpErrorMap } from './error-map-utils';

function getMockActionFromName(name: string): any {
    return [{ action: name }];
}

describe(`ErrorMapService`, () => {
    let service: ErrorMapService;

    const urlFragmentKeys = Array.from(UrlFragmentToHttpErrorMap.keys());
    const authMap = UrlFragmentToHttpErrorMap.get(`auth`) as ErrorMap;
    const voteMap = UrlFragmentToHttpErrorMap.get(`vote`) as ErrorMap;
    const actionMap = UrlFragmentToHttpErrorMap.get(`action`);

    const testData: {
        title: string;
        test: { message: string; url: string; data?: any };
        expect: string | Error;
        testConditionCheck?: boolean; // Boolean value that determines wheter the error map constants still have a form that is conducive to this test
    }[] = [
        {
            title: `test with unregistered url fragments`,
            test: { message: `Message`, url: `no/meaning`, data: {} },
            expect: `Error: Message`,
            testConditionCheck: ![`no`, `meaning`].some(fragment => urlFragmentKeys.includes(fragment))
        },
        {
            title: `test with registered fragments and unknown message`,
            test: {
                message: `This is not an auth service message`,
                url: `random/url/with/auth/meaning`
            },
            expect: `Error: This is not an auth service message`,
            testConditionCheck:
                !!authMap &&
                ![`random`, `url`, `with`].some(fragment => urlFragmentKeys.includes(fragment)) &&
                !Array.from(authMap.keys()).some(key => key.test(`This is not an auth service message`))
        },
        {
            title: `test with registered fragments and registered message`,
            test: {
                message: `Property blue is yellow`,
                url: `random/url/with/auth/meaning`
            },
            expect: `Error: User not found.`
        },
        {
            title: `test with registered fragments and message that only exists in other map`,
            test: {
                message: `Not the first vote`,
                url: `random/url/with/auth/meaning`
            },
            expect: `Error: Not the first vote`,
            testConditionCheck:
                !!voteMap &&
                !Array.from(authMap.keys()).some(key => key.test(`Not the first vote`)) &&
                Array.from(voteMap.keys()).some(key => key.test(`Not the first vote`))
        },
        {
            title: `test with registered fragments and message that returns error`,
            test: {
                message: `Username or password is incorrect.`,
                url: `random/url/with/auth/meaning`
            },
            expect: new Error(`Username or password is incorrect.`)
        },
        {
            title: `test with 'http' fragment in url`,
            test: {
                message: `Username or password is incorrect.`,
                url: `http://test.openslides.com/auth/meaning`
            },
            expect: new Error(`Username or password is incorrect.`)
        },
        {
            title: `test with 'https' fragment in url`,
            test: {
                message: `Username or password is incorrect.`,
                url: `https://test.openslides.com/auth/meaning`
            },
            expect: new Error(`Username or password is incorrect.`)
        },
        {
            title: `test with a fragment that returns an ErrorMap getter function with a message that returns a function`,
            test: {
                message: `I am a forwarding error!`,
                url: `random/action`,
                data: getMockActionFromName(MotionAction.CREATE_FORWARDED)
            },
            expect: new Error(`I am a forwarding error!`),
            testConditionCheck:
                !!actionMap &&
                typeof actionMap === `function` &&
                !!actionMap(getMockActionFromName(MotionAction.CREATE_FORWARDED))
        },
        {
            title: `test with a fragment that returns a function with data that returns nothing`,
            test: {
                message: `I am a create error!`,
                url: `random/action`,
                data: getMockActionFromName(MotionAction.CREATE)
            },
            expect: `Error: I am a create error!`,
            testConditionCheck:
                !!actionMap && typeof actionMap === `function` && !actionMap(getMockActionFromName(MotionAction.CREATE))
        },
        {
            title: `test with an action fragment and no data`,
            test: {
                message: `I am some error!`,
                url: `random/action`
            },
            expect: `Error: I am some error!`
        },
        {
            title: `test with two registered fragments (should pick first)`,
            test: {
                message: `Not the first vote`,
                url: `random/vote/no/auth`
            },
            expect: `Error: You have already voted.`
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ErrorMapService, { provide: TranslateService, useClass: MockTranslateService }]
        });

        service = TestBed.inject(ErrorMapService);
    });

    for (let date of testData) {
        let test = date.test;
        it(date.title, () => {
            expect(
                service.getCleanErrorMessage(test.message, {
                    url: test.url,
                    data: test.data
                })
            ).toEqual(date.expect);
        });
        if (date.testConditionCheck !== undefined) {
            it(`Conditions for '${date.title}' are present`, () => {
                expect(date.testConditionCheck).toBe(true);
            });
        }
    }
});
