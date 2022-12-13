import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { DefaultErrorMap, ErrorMap, UrlFragmentToHttpErrorMap } from './error-map-utils';

/**
 * Options that enable the ErrorMapService to find the wanted ErrorMap (specifically in the case of http errors).
 * `url` is a url (from the HttpErrorResponse), whose fragments indicate which map should be used.
 * `data` is the original body of the request.
 */
interface GetHttpErrorMapOptions {
    url: string;
    data?: any;
}

@Injectable({
    providedIn: `root`
})
export class ErrorMapService {
    public constructor(private translate: TranslateService) {}

    /**
     * Takes an error message and tries to match it to a cleaner version in the corresponding ErrorMap.
     * @param errorMessage the error message that should be mapped and translated.
     * @returns A translated and (if possible) mapped "Error: <errorMsg>", or, if the ErrorMap contains an Error-object, said Error-object.
     */
    public getCleanErrorMessage(errorMessage: string, options: GetHttpErrorMapOptions): string | Error {
        let errorMsg = errorMessage;
        let errorMap = options ? this.getHttpErrorMap(options) : DefaultErrorMap;
        const fittingExpressions = errorMap ? Array.from(errorMap.keys()).filter(exp => exp.test(errorMessage)) : [];
        if (fittingExpressions.length) {
            if (fittingExpressions.length > 1) {
                console.warn(`ErrorMapService has found multiple matches for "${errorMessage}"`);
            }
            let mappedValue = errorMap.get(fittingExpressions[0]);
            if (typeof mappedValue === `function`) {
                mappedValue = mappedValue(errorMessage);
            }
            if (typeof mappedValue === `object`) {
                return mappedValue;
            }
            errorMsg = this.translate.instant(mappedValue);
        } else {
            console.warn(`ErrorMapService has found no matches for "${errorMessage}"`);
        }
        return `${this.translate.instant(`Error`)}: ${errorMsg}`;
    }

    private getHttpErrorMap(options: GetHttpErrorMapOptions): ErrorMap | null {
        let urlFragments = options.url.split(/[\/?]+/);
        if (/http/.test(urlFragments[0])) {
            urlFragments = urlFragments.slice(3);
        }
        for (let i = 0; i < urlFragments.length; i++) {
            if (UrlFragmentToHttpErrorMap.get(urlFragments[i])) {
                let map = UrlFragmentToHttpErrorMap.get(urlFragments[i]);
                if (typeof map === `function`) {
                    map = map(options?.data);
                }
                if (map) {
                    return map;
                }
            }
        }
        console.warn(`No available error map for ${options.url}`);
        return null;
    }
}
