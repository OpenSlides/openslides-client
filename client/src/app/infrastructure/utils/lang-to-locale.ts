import { Locale } from 'date-fns';

/**
 * Helper function to convert a language indicator (en, de)
 * to a locale indicator (de-DE, en-US)
 *
 * Necessary to correctly format timestamps
 */
export function langToLocale(lang: string): string {
    switch (lang) {
        case `1337`:
        case `en`: {
            return `en-GB`;
        }
        case `de`: {
            return `de-DE`;
        }
        case `cz`: {
            return `cs-CZ`;
        }
        default: {
            // has YYYY-MM-DD HH:mm:SS
            return `lt-LT`;
        }
    }
}

export async function langToTimeLocale(lang: string): Promise<Locale> {
    switch (lang) {
        case `es`:
            return (await import(`date-fns/locale/es`)).es;
        case `de`:
            return (await import(`date-fns/locale/de`)).de;
        case `cs`:
            return (await import(`date-fns/locale/cs`)).cs;
        case `it`:
            return (await import(`date-fns/locale/it`)).it;
        case `ru`:
            return (await import(`date-fns/locale/ru`)).ru;
        default:
            return (await import(`date-fns/locale/en-US`)).enUS;
    }
}
