import { NgModule } from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

/**
 * @deprecated TranslatePipe and Directive should be imported directly. Do not add to new components/modules.
 */
@NgModule({
    imports: [TranslatePipe, TranslateDirective],
    exports: [TranslatePipe, TranslateDirective]
})
export class OpenSlidesTranslationModule {}
