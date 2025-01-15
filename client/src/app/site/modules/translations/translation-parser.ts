import { InterpolateFunction, InterpolationParameters, TranslateDefaultParser } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { CustomTranslationService } from './custom-translation.service';

/**
 * Translation parser that adds custom translations
 */
export class CustomTranslationParser extends TranslateDefaultParser {
    private static ctSubscription: Subscription;
    private static ct: { [key: string]: string } = {};

    public constructor(private ctService: CustomTranslationService) {
        super();

        if (!CustomTranslationParser.ctSubscription) {
            CustomTranslationParser.ctSubscription = this.ctService.customTranslationSubject.subscribe(ct => {
                CustomTranslationParser.ct = ct || {};
            });
        }
    }

    public override interpolate(
        expr: InterpolateFunction | string,
        params?: InterpolationParameters
    ): string | undefined {
        if (typeof expr === `string` && CustomTranslationParser.ct[expr]) {
            return CustomTranslationParser.ct[expr];
        }

        return super.interpolate(expr, params);
    }
}
