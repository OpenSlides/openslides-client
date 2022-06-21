import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

/**
 * A type of map that maps regular expressions (of error messages) to either a cleaner string-message, a function calculating such a string message, or an Error-object containing such a string message.
 */
class ErrorMap extends Map<RegExp, string | Error | ((input: string) => string)> {}

const AuthServiceErrorMap: ErrorMap = new ErrorMap([
    [/Username or password is incorrect./, new Error(_(`Username or password is incorrect.`))],
    [/Multiple users found for same username!/, _(`Multiple users found for same username!`)],
    [/Multiple users with same credentials!/, _(`Multiple users with same credentials!`)],
    [/The account is deactivated./, _(`The account is deactivated.`)],
    [/Property [\S] is [\S]/, _(`User not found.`)]
]);

/**
 * Holds http-request path segments and corresponding ErrorMaps.
 * TODO: Expand for other services
 */
const UrlFragmentToHttpErrorMap: Map<string, ErrorMap> = new Map([[`auth`, AuthServiceErrorMap]]);

const DefaultErrorMap: ErrorMap = new ErrorMap([]);

@Injectable({
    providedIn: `root`
})
export class ErrorMapService {
    public constructor(private translate: TranslateService) {}

    /**
     * Takes an error message and tries to match it to a cleaner version in the corresponding ErrorMap.
     * @param errorMessage the error message that should be mapped and translated.
     * @param url a url (from the HttpErrorResponse), whose fragments indicate which map should be used
     * @returns A translated and (if possible) mapped "Error: <errorMsg>", or, if the ErrorMap contains an Error-object, said Error-object.
     */
    public getCleanErrorMessage(errorMessage: string, url?: string): string | Error {
        let errorMsg = errorMessage;
        let errorMap = url ? this.getHttpErrorMap(url) : DefaultErrorMap;
        const fittingExpressions = errorMap ? Array.from(errorMap.keys()).filter(exp => exp.test(errorMessage)) : [];
        if (fittingExpressions.length) {
            if (fittingExpressions.length > 1) {
                console.warn(`ErrorMapService has found multiple matches for "${errorMessage}"`);
            }
            let mappedValue = errorMap.get(fittingExpressions[0]);
            if (typeof mappedValue === `object`) {
                return mappedValue;
            }
            errorMsg = this.translate.instant(
                typeof mappedValue === `string` ? mappedValue : mappedValue(errorMessage)
            );
        }
        return `${this.translate.instant(`Error`)}: ${errorMsg}`;
    }

    private getHttpErrorMap(url: string): ErrorMap | null {
        let urlFragments = url.split(`/`);
        if (/http/.test(urlFragments[0])) {
            urlFragments = urlFragments.slice(3);
        }
        for (let i = 0; i < urlFragments.length; i++) {
            if (UrlFragmentToHttpErrorMap.get(urlFragments[i])) {
                return UrlFragmentToHttpErrorMap.get(urlFragments[i]);
            }
        }
        console.warn(`No available error map for ${url}`);
        return null;
    }
}
