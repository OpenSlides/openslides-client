import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
    TranslateDirective,
    TranslateLoader,
    TranslateModule,
    TranslateParser,
    TranslatePipe
} from '@ngx-translate/core';

import { CustomTranslationService } from './custom-translation.service';
import { CustomTranslationParser } from './translation-parser';
import { PruningTranslationLoader } from './translation-pruning-loader';

@NgModule({
    imports: [TranslateModule],
    exports: [TranslatePipe, TranslateDirective]
})
export class OpenSlidesTranslationModule {
    public static forRoot(): ModuleWithProviders<TranslateModule> {
        return TranslateModule.forRoot({
            fallbackLang: `en`,
            loader: {
                provide: TranslateLoader,
                useClass: PruningTranslationLoader,
                deps: [HttpClient]
            },
            parser: {
                provide: TranslateParser,
                useClass: CustomTranslationParser,
                deps: [CustomTranslationService]
            }
        });
    }

    // no config store for child.
    public static forChild(): ModuleWithProviders<TranslateModule> {
        return TranslateModule.forChild({
            fallbackLang: `en`,
            loader: {
                provide: TranslateLoader,
                useClass: PruningTranslationLoader,
                deps: [HttpClient]
            },
            parser: {
                provide: TranslateParser,
                useClass: CustomTranslationParser,
                deps: [CustomTranslationService]
            }
        });
    }
}
