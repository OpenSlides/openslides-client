import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { QrCodeComponent } from 'src/app/ui/modules/qr-code';

import { SlideToken } from '../../definitions';
import { WifiAccessDataSlideComponent } from './components/wifi-access-data-slide/wifi-access-data-slide.component';

@NgModule({
    declarations: [WifiAccessDataSlideComponent],
    imports: [CommonModule, QrCodeComponent, OpenSlidesTranslationModule.forChild()],
    providers: [{ provide: SlideToken.token, useValue: WifiAccessDataSlideComponent }]
})
export class WifiAccessDataSlideModule {}
