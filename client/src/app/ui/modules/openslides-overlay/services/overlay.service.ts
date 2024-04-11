import { Injectable, Type } from '@angular/core';
import { DomService } from 'src/app/openslides-main-module/services/dom.service';

import { OverlayComponent } from '../components/overlay/overlay.component';
import { CustomOverlayConfig, OverlayInstance } from '../definitions';
import { OpenSlidesOverlayModule } from '../openslides-overlay.module';

@Injectable({
    providedIn: OpenSlidesOverlayModule
})
export class OverlayService {
    public constructor(private domService: DomService) {}

    public open<T>(componentType: Type<T>, config: CustomOverlayConfig = {}): OverlayInstance {
        const componentRef = this.domService.attachComponent(OverlayComponent);
        const _config = {
            ...config,
            onCloseFn: (): void => {
                config.onCloseFn?.();
                this.domService.dispose(componentRef);
            }
        };
        const overlay = new OverlayInstance(componentRef, componentRef.instance, _config);
        overlay.attachComponent(componentType);
        return overlay;
    }
}
