import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as cs from 'date-fns/locale/cs';
import * as de from 'date-fns/locale/de';
import * as enUS from 'date-fns/locale/en-US/index';
import * as es from 'date-fns/locale/es';
import * as ita from 'date-fns/locale/it';
import * as ru from 'date-fns/locale/ru';
import { langToTimeLocale } from 'src/app/infrastructure/utils';

import { LocalizedDateRangePipe } from './localized-date-range.pipe';

function getLocale(lang: string) {
    switch (lang) {
        case `es`:
            return es.default;
        case `de`:
            return de.default;
        case `cs`:
            return cs.default;
        case `it`:
            return ita.default;
        case `ru`:
            return ru.default;
        default:
            return enUS.default;
    }
}

const testData: {
    [testCase: string]: {
        title: string;
        range: { start: Date; end: Date };
        expect: { [lang: string]: { [dateFormat: string]: string } };
    };
} = {
    sameYear: {
        title: `test with same year`,
        range: { start: new Date(`January 18, 1995 03:24:00`), end: new Date(`December 17, 1995 03:24:00`) },
        expect: {
            en: {
                PPp: `Jan 18, 1995, 3:24 AM - Dec 17, 1995, 3:24 AM`,
                PP: `Jan 18 - Dec 17, 1995`
            },
            de: {
                PPp: `18. Jan. 1995 03:24 - 17. Dez. 1995 03:24`,
                PP: `18. Jan. - 17. Dez. 1995`
            },
            es: {
                PPp: `18 ene 1995, 03:24 - 17 dic 1995, 03:24`,
                PP: `18 ene - 17 dic 1995`
            },
            it: {
                PPp: `18 gen 1995 03:24 - 17 dic 1995 03:24`,
                PP: `18 gen - 17 dic 1995`
            },
            cs: {
                PPp: `18. 1. 1995, 3:24 - 17. 12. 1995, 3:24`,
                PP: `18. 1. - 17. 12. 1995`
            },
            ru: {
                PPp: `18 янв. 1995 г., 3:24 - 17 дек. 1995 г., 3:24`,
                PP: `18 янв. 1995 г. - 17 дек. 1995 г.`
            }
        }
    },
    sameMonth: {
        title: `test with same month of year`,
        range: { start: new Date(`December 17, 1995 03:24:00`), end: new Date(`December 18, 1995 03:24:00`) },
        expect: {
            en: {
                PPp: `Dec 17, 1995, 3:24 AM - Dec 18, 1995, 3:24 AM`,
                PP: `Dec 17 - 18, 1995`
            },
            de: {
                PPp: `17. Dez. 1995 03:24 - 18. Dez. 1995 03:24`,
                PP: `17. - 18. Dez. 1995`
            },
            es: {
                PPp: `17 dic 1995, 03:24 - 18 dic 1995, 03:24`,
                PP: `17 - 18 dic 1995`
            },
            it: {
                PPp: `17 dic 1995 03:24 - 18 dic 1995 03:24`,
                PP: `17 - 18 dic 1995`
            },
            cs: {
                PPp: `17. 12. 1995, 3:24 - 18. 12. 1995, 3:24`,
                PP: `17. - 18. 12. 1995`
            },
            ru: {
                PPp: `17 дек. 1995 г., 3:24 - 18 дек. 1995 г., 3:24`,
                PP: `17 дек. 1995 г. - 18 дек. 1995 г.`
            }
        }
    },
    sameDay: {
        title: `test with same day of year`,
        range: { start: new Date(`December 17, 1995 03:24:00`), end: new Date(`December 17, 1995 05:24:00`) },
        expect: {
            en: {
                PPp: `Dec 17, 1995, 3:24 AM - 5:24 AM`,
                PP: `Dec 17, 1995`
            },
            de: {
                PPp: `17. Dez. 1995 03:24 - 05:24`,
                PP: `17. Dez. 1995`
            },
            es: {
                PPp: `17 dic 1995, 03:24 - 05:24`,
                PP: `17 dic 1995`
            },
            it: {
                PPp: `17 dic 1995 03:24 - 05:24`,
                PP: `17 dic 1995`
            },
            cs: {
                PPp: `17. 12. 1995, 3:24 - 5:24`,
                PP: `17. 12. 1995`
            },
            ru: {
                PPp: `17 дек. 1995 г., 3:24 - 17 дек. 1995 г., 5:24`,
                PP: `17 дек. 1995 г.`
            }
        }
    },
    differentMonth: {
        title: `test with same day and year, different month`,
        range: { start: new Date(`January 17, 1995 03:24:00`), end: new Date(`December 17, 1995 03:24:00`) },
        expect: {
            en: {
                PPp: `Jan 17, 1995, 3:24 AM - Dec 17, 1995, 3:24 AM`,
                PP: `Jan 17 - Dec 17, 1995`
            },
            de: {
                PPp: `17. Jan. 1995 03:24 - 17. Dez. 1995 03:24`,
                PP: `17. Jan. - 17. Dez. 1995`
            },
            es: {
                PPp: `17 ene 1995, 03:24 - 17 dic 1995, 03:24`,
                PP: `17 ene - 17 dic 1995`
            },
            it: {
                PPp: `17 gen 1995 03:24 - 17 dic 1995 03:24`,
                PP: `17 gen - 17 dic 1995`
            },
            cs: {
                PPp: `17. 1. 1995, 3:24 - 17. 12. 1995, 3:24`,
                PP: `17. 1. - 17. 12. 1995`
            },
            ru: {
                PPp: `17 янв. 1995 г., 3:24 - 17 дек. 1995 г., 3:24`,
                PP: `17 янв. 1995 г. - 17 дек. 1995 г.`
            }
        }
    }
};

describe(`LocalizedDateRangePipe`, () => {
    let pipe: LocalizedDateRangePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [LocalizedDateRangePipe, { provide: ChangeDetectorRef, useValue: { markForCheck: () => {} } }]
        }).compileComponents();

        pipe = TestBed.inject(LocalizedDateRangePipe);
    });

    it(`test with timestamp 0`, async () => {
        pipe.config.setLocale(await langToTimeLocale(`en`));
        expect(pipe.transform({ start: 0 })).toBe(`Jan 1, 1970, 12:00 AM`);
        expect(pipe.transform({ end: 0 }, `PP`)).toBe(`Jan 1, 1970`);
    });

    for (const data of Object.values(testData)) {
        for (const lang of Object.keys(data.expect)) {
            for (const dateFormat of Object.keys(data.expect[lang])) {
                it(`${data.title} for locale '${lang}' in format '${dateFormat}'`, () => {
                    pipe.config.setLocale(getLocale(lang));
                    expect(pipe.transform(data.range, dateFormat)).toBe(data.expect[lang][dateFormat]);
                });
            }
        }
    }

    it(`test with invalid parameters`, async () => {
        pipe.config.setLocale(await langToTimeLocale(`en`));
        expect(pipe.transform({ start: Number.NaN })).toBe(``);
        expect(pipe.transform(undefined)).toBe(``);
        expect(pipe.transform(null)).toBe(``);
        expect(pipe.transform({ start: Number.NEGATIVE_INFINITY, end: Number.POSITIVE_INFINITY })).toBe(``);
    });
});
