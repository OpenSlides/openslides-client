import { Injectable, Type } from '@angular/core';
import { OverlayComponent } from '../components/overlay/overlay.component';
import { CustomOverlayConfig, OverlayInstance } from '../../../definitions';
import { CustomOverlayServiceModule } from './custom-overlay-service.module';
import { DomService } from 'src/app/openslides-main-module/services/dom.service';

@Injectable({
    providedIn: CustomOverlayServiceModule
})
export class OverlayService {
    public constructor(private domService: DomService) {}

    public open<T>(componentType: Type<T>, config: CustomOverlayConfig = {}): OverlayInstance {
        const componentRef = this.domService.attachComponent(OverlayComponent);
        const _config = {
            ...config,
            onCloseFn: () => {
                config.onCloseFn?.();
                this.domService.dispose(componentRef);
            }
        };
        const overlay = new OverlayInstance(componentRef, componentRef.instance, _config);
        overlay.attachComponent(componentType);
        return overlay;
    }
}
