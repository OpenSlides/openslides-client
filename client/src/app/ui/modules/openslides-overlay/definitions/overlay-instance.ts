import { OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { ComponentRef, TemplateRef } from '@angular/core';
import { OverlayComponent } from '../modules/custom-overlay/components/overlay/overlay.component';
import { CustomOverlayConfig } from './overlay-config';

export class OverlayInstance<T = any> {
    public get template(): TemplateRef<T> | undefined {
        return this._template;
    }

    public get component(): T | undefined {
        return this._component;
    }

    private readonly _overlayRef: OverlayRef;
    private readonly _onCloseFn: (() => void) | undefined;

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
