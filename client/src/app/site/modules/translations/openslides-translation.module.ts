import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateDirective, TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';

import { CustomTranslationService } from './custom-translation.service';
import { PruningTranslationLoader } from './translation-pruning-loader';

@NgModule({
    imports: [TranslateModule],
    exports: [TranslatePipe, TranslateDirective]
})
export class OpenSlidesTranslationModule {
    public static forRoot(): ModuleWithProviders<TranslateModule> {
        return TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: PruningTranslationLoader,
                deps: [CustomTranslationService, HttpClient]
            }
        });
    }

    // no config store for child.
    public static forChild(): ModuleWithProviders<TranslateModule> {
        return TranslateModule.forChild({
            extend: true,
            loader: {
                provide: TranslateLoader,
                useClass: PruningTranslationLoader,
                deps: [CustomTranslationService, HttpClient]
            }
        });
    }
}
