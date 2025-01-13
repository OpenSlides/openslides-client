import { InterpolateFunction, InterpolationParameters, TranslateDefaultParser } from '@ngx-translate/core';

import { CustomTranslationService } from './custom-translation.service';

/**
 * Translation parser that adds custom translations
 */
export class CustomTranslationParser extends TranslateDefaultParser {
    public constructor(private ctService: CustomTranslationService) {
        super();
    }

    public override interpolate(
        expr: InterpolateFunction | string,
        params?: InterpolationParameters
    ): string | undefined {
        if (typeof expr === `string` && this.ctService.customTranslationSubject.value) {
            const ct = this.ctService.customTranslationSubject.value[expr];
            if (ct) {
                return ct;
            }
        }

        return super.interpolate(expr, params);
    }
}
