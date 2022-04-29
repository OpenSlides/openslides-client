import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { Injectable, Injector, StaticProvider, TemplateRef, ViewContainerRef } from '@angular/core';
import { OverlayComponent } from '../components/overlay/overlay.component';
import { CustomOverlayConfig, OverlayInstance, OVERLAY_COMPONENT_DATA } from '../../../definitions';
import { CustomOverlayServiceModule } from './custom-overlay-service.module';

@Injectable({
    providedIn: CustomOverlayServiceModule
})
export class OverlayService {
    public constructor(private overlay: Overlay, private injector: Injector) {}

    public open<T>(
        templateOrComponent: TemplateRef<T> | ComponentType<T>,
        config: CustomOverlayConfig = {}
    ): OverlayInstance<T> {
        const overlay = this.createOverlay<T>(config);
        if (templateOrComponent instanceof TemplateRef) {
            const template = new TemplatePortal(
                templateOrComponent,
                null as any,
                {
                    $implicit: config.data,
                    instance: overlay
                } as any
            );
            overlay.attachTemplate(template);
        } else {
            const injector = this.createInjector(config, overlay);
            const component = new ComponentPortal(templateOrComponent, null, injector);
            overlay.attachComponent(component);
        }

        return overlay;
    }

    /**
     * Function to create an `OverlayComponent`-instace. This behaves like the `MatDialog`.
     *
     * @param config optional. A custom configuration for the `OverlayComponent`.
     */
    public createOverlay<T = any>(config: CustomOverlayConfig = {}): OverlayInstance<T> {
        // console.log(`viewContainer:`, this.viewContainer);
        const overlayRef = this.overlay.create(this.getOverlayConfig(config));
        const componentRef = overlayRef.attach(new ComponentPortal(OverlayComponent));
        componentRef.instance.position = config.position || `center`;
        return new OverlayInstance(componentRef, componentRef.instance, { overlayRef, ...config });
    }

    private getOverlayConfig(config: CustomOverlayConfig): OverlayConfig {
        return {
            hasBackdrop: false,
            disposeOnNavigation: false,
            backdropClass: config.backdropClass,
            height: `100%`,
            width: `100%`
        };
    }

    private createInjector(config: CustomOverlayConfig, instance: OverlayInstance): Injector {
        const providers: StaticProvider[] = [
            {
                provide: OverlayInstance,
                useValue: instance
            },
            {
                provide: OVERLAY_COMPONENT_DATA,
                useValue: config.data
            }
        ];
        return Injector.create({ providers, parent: this.injector });
    }
}
