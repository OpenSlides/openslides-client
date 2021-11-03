import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, InjectionToken, Injector, StaticProvider, TemplateRef } from '@angular/core';
import { OverlayComponent } from 'app/shared/components/overlay/overlay.component';

export const OVERLAY_COMPONENT_DATA = new InjectionToken<any>(`overlay-component-data`);

export type OverlayPosition = 'center' | 'left' | 'top' | 'right' | 'bottom';

export interface CustomOverlayConfig<T = any> {
    /**
     * A css-class attached to the backdrop-component in the DOM
     */
    backdropClass?: string;
    /**
     * Optional data passed to the component attached to an overlay-instance
     *
     * Accessible via the `OVERLAY_COMPONENT_DATA` injectiontoken
     */
    data?: T;
    /**
     * The position on the screen of the component attached to an overlay-instance
     */
    position?: OverlayPosition;
    /**
     * A function that is executed immediately after an overlay-instance is disposed
     */
    onCloseFn?: () => void;
}

export class OverlayInstance<T = any> {
    public get template(): TemplateRef<T> | undefined {
        return this._template;
    }

    public get component(): T | undefined {
        return this._component;
    }

    private readonly _overlayRef: OverlayRef;
    private readonly _onCloseFn: () => void;

    private _template?: TemplateRef<T>;
    private _component?: T;

    public constructor(
        public readonly componentRef: ComponentRef<OverlayComponent>,
        private readonly _overlayComponent: OverlayComponent,
        { overlayRef, onCloseFn }: { overlayRef: OverlayRef } & CustomOverlayConfig<T>
    ) {
        this._overlayRef = overlayRef;
        this._onCloseFn = onCloseFn;
    }

    public close(): void {
        this.componentRef.destroy();
        this._overlayRef.dispose();
        if (this._onCloseFn) {
            this._onCloseFn();
        }
    }

    public attachTemplate(templatePortal: TemplatePortal<T>): void {
        this._overlayComponent.attachTemplate(templatePortal);
        this._template = templatePortal.templateRef;
    }

    public attachComponent(componentPortal: ComponentPortal<T>): void {
        const instance = this._overlayComponent.attachComponent(componentPortal);
        this._component = instance;
    }
}

/**
 * Component to control the visibility of components, that overlay the whole window.
 * Like `global-spinner.component` and `super-search.component`.
 */
@Injectable({
    providedIn: `root`
})
export class OverlayService {
    public constructor(private overlay: Overlay, private injector: Injector) {}

    public open<T>(
        templateOrComponent: TemplateRef<T> | ComponentType<T>,
        config: CustomOverlayConfig = {}
    ): OverlayInstance<T> {
        const overlay = this.createOverlay<T>(config);
        if (templateOrComponent instanceof TemplateRef) {
            const template = new TemplatePortal(templateOrComponent, null, {
                $implicit: config.data,
                instance: overlay
            } as any);
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
