export class MockTranslateService {
    currentLang = `en`;

    public instant(text: string): string {
        return text;
    }
}

/*
xdescribe(`PollParseNumberPipe`, () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [PollParseNumberPipe, { provide: TranslateService, useClass: MockTranslateService }]
        }).compileComponents();

        TestBed.inject(TranslateService);
    });
});
*/
