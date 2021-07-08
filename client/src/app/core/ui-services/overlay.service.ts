import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, InjectionToken, Injector, StaticProvider, TemplateRef } from '@angular/core';

import { OverlayComponent } from 'app/site/common/components/overlay/overlay.component';

export const OVERLAY_COMPONENT_DATA = new InjectionToken<any>('overlay-component-data');

export type OverlayPosition = 'center' | 'left' | 'top' | 'right' | 'bottom';

export interface CustomOverlayConfig<T = any> {
    disposeOnClose?: boolean;
    backdropClass?: string;
    data?: T;
    position?: OverlayPosition;
}

export class OverlayInstance {
    public constructor(
        private readonly overlayRef: OverlayRef,
        public readonly componentRef: ComponentRef<OverlayComponent>,
        public readonly overlayComponent: OverlayComponent
    ) {}

    public close(): void {
        this.componentRef.destroy();
        this.overlayRef.dispose();
    }
}

/**
 * Component to control the visibility of components, that overlay the whole window.
 * Like `global-spinner.component` and `super-search.component`.
 */
@Injectable({
    providedIn: 'root'
})
export class OverlayService {
    /**
     *
     * @param dialogService Injects the `MatDialog` to show the `super-search.component`
     */
    public constructor(private overlay: Overlay, private injector: Injector) {}

    public open<T>(
        templateOrComponent: TemplateRef<T> | ComponentType<T>,
        config: CustomOverlayConfig = {}
    ): OverlayInstance {
        const overlay = this.createOverlay(config);
        if (templateOrComponent instanceof TemplateRef) {
            overlay.overlayComponent.attachTemplate(
                new TemplatePortal(templateOrComponent, null, {
                    $implicit: config.data,
                    instance: overlay
                } as any)
            );
        } else {
            const injector = this.createInjector(config, overlay);
            overlay.overlayComponent.attachComponent(new ComponentPortal(templateOrComponent, null, injector));
        }

        return overlay;
    }

    /**
     * Function to create an `OverlayComponent`-instace. This behaves like the `MatDialog`.
     *
     * @param config optional. A custom configuration for the `OverlayComponent`.
     */
    public createOverlay(config: CustomOverlayConfig = {}): OverlayInstance {
        const overlayRef = this.overlay.create(this.getOverlayConfig(config));
        const componentRef = overlayRef.attach(new ComponentPortal(OverlayComponent));
        componentRef.instance.position = config.position || 'center';
        return new OverlayInstance(overlayRef, componentRef, componentRef.instance);
    }

    private getOverlayConfig(config: CustomOverlayConfig): OverlayConfig {
        return {
            hasBackdrop: false,
            disposeOnNavigation: false,
            backdropClass: config.backdropClass,
            height: '100%',
            width: '100%'
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
