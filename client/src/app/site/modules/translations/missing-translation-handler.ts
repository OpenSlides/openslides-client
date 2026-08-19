import { inject, Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateParser } from '@ngx-translate/core';

@Injectable()
export class CustomMissingTranslationHandler implements MissingTranslationHandler {
    protected parser = inject(TranslateParser);

    public handle(params: MissingTranslationHandlerParams): string {
        return this.parser.interpolate(params.key, params.interpolateParams);
    }
}
