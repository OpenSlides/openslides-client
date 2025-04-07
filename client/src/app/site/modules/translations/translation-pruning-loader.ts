import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import pofile from 'pofile';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Translation loader that replaces empty strings with nothing.
 */
export class PruningTranslationLoader implements TranslateLoader {
    /**
     * Path to the language files. Can be adjusted as needed
     */
    private prefix = `/assets/i18n/`;

    /**
     * Suffix of the translation files.
     */
    private suffix = `.po`;

    /**
     * Constructor to load the HttpClient
     *
     * @param http httpClient to load the translation files.
     */
    public constructor(private http: HttpClient) {}

    /**
     * Loads a language file, stores the content, give it to the process function.
     * @param lang language string (en, fr, de, ...)
     */
    public getTranslation(lang: string): Observable<any> {
        if (lang === `en`) {
            return of({});
        }

        let poUrl = `${this.prefix}${lang}${this.suffix}`;
        if (lang === `1337`) {
            poUrl = `${this.prefix}de${this.suffix}`;
        }

        return this.http
            .get(poUrl, { responseType: `text` })
            .pipe(map((content: string) => this.parse(content, lang === `1337`)));
    }

    private parse(content: string, t1337: boolean): any {
        const translations: Record<string, string> = {};

        const po = pofile.parse(content);
        for (const item of po.items) {
            const translation: string = t1337 ? this.t1337(item.msgid) : item.msgstr.pop();
            if (item.msgid.length > 0 && translation.length > 0) {
                translations[item.msgid] = translation;
            }
        }

        return translations;
    }

    private dict1337: Record<string, string> = {
        a: `4`,
        b: `8`,
        c: `(`,
        e: `3`,
        f: `PH`,
        g: `6`,
        h: `#`,
        i: `!`,
        k: `|<`,
        l: `1`,
        o: `°`,
        q: `0`,
        s: `5`,
        t: `7`,
        v: `\\/`,
        w: `VV`,
        y: `\`/`,
        z: `2`
    };

    private t1337(str: string): string {
        return str
            .toLowerCase()
            .split(``)
            .reduce((prev, curr) => prev + (this.dict1337[curr] ?? curr.toUpperCase()), ``);
    }
}
