import { ComponentRef, TemplateRef, ViewContainerRef, Type } from '@angular/core';
import { OverlayComponent } from '../modules/custom-overlay/components/overlay/overlay.component';
import { CustomOverlayConfig } from './overlay-config';

export class OverlayInstance<T = any> {
    public get template(): TemplateRef<T> | undefined {
        return this._template;
    }

    public get component(): T | undefined {
        return this._component;
    }

    private readonly _onCloseFn: (() => void) | undefined;

    private _template?: TemplateRef<T>;
    private _component?: T;

    public constructor(
        public readonly componentRef: ComponentRef<OverlayComponent>,
        private readonly _overlayComponent: OverlayComponent,
        { onCloseFn }: CustomOverlayConfig<T>
    ) {
        this._onCloseFn = onCloseFn;
    }

    public close(): void {
        this.componentRef.destroy();
        if (this._onCloseFn) {
            this._onCloseFn();
        }
    }

    public attachTemplate(templateRef: TemplateRef<T>): void {}

    public attachComponent(component: Type<T>): void {
        const instance = this._overlayComponent.attachComponent(component);
        this._component = instance;
    }
}
