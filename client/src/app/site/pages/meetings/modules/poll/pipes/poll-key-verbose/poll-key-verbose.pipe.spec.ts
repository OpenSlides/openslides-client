import { TestBed } from '@angular/core/testing';

import { PollKeyVerbosePipe } from './poll-key-verbose.pipe';

describe(`PollKeyVerbosePipe`, () => {
    let pipe: PollKeyVerbosePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [PollKeyVerbosePipe]
        }).compileComponents();

        pipe = TestBed.inject(PollKeyVerbosePipe);
    });

    it(`test with legitimate PollValues`, () => {
        expect(pipe.transform(`votesvalid`)).toBe(`Valid votes`);
        expect(pipe.transform(`votesinvalid`)).toBe(`Invalid votes`);
        expect(pipe.transform(`votescast`)).toBe(`Total votes cast`);
        expect(pipe.transform(`votesno`)).toBe(`Votes No`);
        expect(pipe.transform(`votesabstain`)).toBe(`Votes abstain`);
        expect(pipe.transform(`yes`)).toBe(`Yes`);
        expect(pipe.transform(`no`)).toBe(`No`);
        expect(pipe.transform(`abstain`)).toBe(`Abstain`);
        expect(pipe.transform(`amount_global_yes`)).toBe(`General approval`);
        expect(pipe.transform(`amount_global_no`)).toBe(`General rejection`);
        expect(pipe.transform(`amount_global_abstain`)).toBe(`General abstain`);
    });

    it(`test with other values`, () => {
        expect(pipe.transform(`born`)).toBe(`born`);
        expect(pipe.transform(`mad`)).toBe(`mad`);
        expect(pipe.transform(`bad`)).toBe(`bad`);
        expect(pipe.transform(`sad`)).toBe(`sad`);
        expect(pipe.transform(`AAAAAAAAAAAAAAAAAAAAAAA`)).toBe(`AAAAAAAAAAAAAAAAAAAAAAA`);
    });
});
