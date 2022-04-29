import { NgModule } from '@angular/core';
import { OverlayComponent } from './components/overlay/overlay.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { CustomOverlayServiceModule } from './services/custom-overlay-service.module';

const DECLARATIONS = [OverlayComponent];
const SERVICES = [CustomOverlayServiceModule];

@NgModule({
    declarations: DECLARATIONS,
    exports: [...DECLARATIONS, ...SERVICES],
    imports: [OverlayModule]
})
export class CustomOverlayModule {}
