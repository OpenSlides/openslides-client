import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import pofile from 'pofile';
import { combineLatest, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { CustomTranslationService } from './custom-translation.service';

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
     * Default language which must not be translated.
     */
    private defaultLanguage = `en`;

    /**
     * Constructor to load the HttpClient
     *
     * @param http httpClient to load the translation files.
     */
    public constructor(
        private ctService: CustomTranslationService,
        private http: HttpClient
    ) {}

    /**
     * Loads a language file, stores the content, give it to the process function.
     * @param lang language string (en, fr, de, ...)
     */
    public getTranslation(lang: string): Observable<any> {
        if (lang != this.defaultLanguage) {
            return combineLatest([
                this.http
                    .get(`${this.prefix}${lang !== `1337` ? lang : `de`}${this.suffix}`, { responseType: `text` })
                    .pipe(map((content: string) => this.parse(content, lang === `1337`))),
                this.ctService.customTranslationSubject
            ]).pipe(
                map(([t, ct]) => {
                    if (ct) {
                        for (const k of Object.keys(t)) {
                            t[k] = ct[t[k]] || t[k];
                        }
                    }

                    return t;
                }),
                first()
            );
        }

        return this.ctService.customTranslationSubject.pipe(
            map(ct => ct || {}),
            first()
        );
    }

    private parse(content: string, t1337: boolean): any {
        const translations: { [key: string]: string } = {};

        const po = pofile.parse(content);
        for (const item of po.items) {
            const translation: string = t1337 ? this.t1337(item.msgid) : item.msgstr.pop();
            if (item.msgid.length > 0 && translation.length > 0) {
                translations[item.msgid] = translation;
            }
        }

        return translations;
    }

    private dict1337: { [char: string]: string } = {
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
