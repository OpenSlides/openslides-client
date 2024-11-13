import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';

import { CustomTranslationService } from './custom-translation.service';
import { PruningTranslationLoader } from './translation-pruning-loader';

@NgModule({
    imports: [TranslateModule],
    exports: [TranslatePipe]
})
export class OpenSlidesTranslationModule {
    public static forRoot(): ModuleWithProviders<TranslateModule> {
        return TranslateModule.forRoot({
            defaultLanguage: `en`,
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
            defaultLanguage: `en`,
            loader: {
                provide: TranslateLoader,
                useClass: PruningTranslationLoader,
                deps: [CustomTranslationService, HttpClient]
            }
        });
    }
}
