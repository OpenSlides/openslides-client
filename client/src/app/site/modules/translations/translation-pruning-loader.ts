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
     * Default language which must not be translated.
     */
    private defaultLanguage = `en`;

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
        if (lang != this.defaultLanguage) {
            return this.http
                .get(`${this.prefix}${lang}${this.suffix}`, { responseType: `text` })
                .pipe(map((content: string) => this.parse(content)));
        } else {
            return of({});
        }
    }

    private parse(content: string): any {
        let translations: { [key: string]: string } = {};

        const po = pofile.parse(content);
        for (const item of po.items) {
            const translation: string = item.msgstr.pop();
            if (item.msgid.length > 0 && translation.length > 0) {
                translations[item.msgid] = translation;
            }
        }

        return translations;
    }
}
