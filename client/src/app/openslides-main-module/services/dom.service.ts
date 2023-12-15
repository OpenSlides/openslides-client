import { DOCUMENT } from '@angular/common';
import { ComponentRef, EmbeddedViewRef, Inject, Injectable, Type, ViewContainerRef } from '@angular/core';

interface BodyPortalConstructConfig {
    /**
     * Specify an HTML element, which should be used to append components.
     * Caution: This should NOT be the real root or body element!
     */
    root: HTMLElement;
    /**
     * Specify the reference to a view container.
     */
    viewContainer: ViewContainerRef;
}

export class BodyPortal {
    private readonly _root: HTMLElement;
    private readonly _viewContainer: ViewContainerRef;

    private _componentRef: ComponentRef<unknown> | null = null;

    public constructor(config: BodyPortalConstructConfig) {
        for (const key of Object.keys(config)) {
            this[`_${key}`] = config[key];
        }
    }

    public attach<T>(componentType: Type<T>, data: unknown = {}): void {
        this._viewContainer.clear();
        this.showPane();
        const componentRef = this.createComponentRef(componentType, data);
        const domElement = (<EmbeddedViewRef<any>>componentRef.hostView).rootNodes[0] as HTMLElement;
        this._root.appendChild(domElement);
        componentRef.hostView.detectChanges();
        this._componentRef = componentRef;
    }

    public dispose(): void {
        if (this._componentRef) {
            this._componentRef.destroy();
            while (this._root.hasChildNodes()) {
                this._root.removeChild(this._root.childNodes[0]);
            }
            this.hidePane();
        }
    }

    private createComponentRef<T>(component: Type<T>, data: unknown = {}): ComponentRef<T> {
        const componentRef = this._viewContainer.createComponent(component);
        for (const key of Object.keys(data)) {
            componentRef.instance[key] = data[key];
        }
        return componentRef;
    }

    private showPane(): void {
        this._root.style.display = `block`;
    }

    private hidePane(): void {
        this._root.style.display = `none`;
    }
}

@Injectable({
    providedIn: `root`
})
export class DomService {
    private get hostElement(): HTMLElement {
        return this.document.body;
    }

    private _viewContainer: ViewContainerRef | null = null;
    private _pane: HTMLElement | null = null;

    public constructor(@Inject(DOCUMENT) private document: Document) {
        this._pane = this.createPane();
        this.hostElement.appendChild(this._pane);
    }

    public setViewContainer(container: ViewContainerRef): void {
        if (!!this._viewContainer) {
            throw new Error(`Only one view container should be attached!`);
        }
        this._viewContainer = container;
    }

    /**
     * Creates a `BodyPortal`, which is useful to append components to the body element.
     *
     * @param viewContainer Optional reference to a view container. This should be used,
     * if a component should be created, which depends on service modules.
     * @returns A `BodyPortal`. A class which provides functions to append a component to the body element.
     */
    public buildBodyPane(viewContainer: ViewContainerRef = this._viewContainer): BodyPortal {
        return new BodyPortal({ viewContainer, root: this._pane! });
    }

    public attachComponent<T>(componentType: Type<T>, data: unknown = {}): ComponentRef<T> {
        this._viewContainer.clear();
        this.showPane();
        const componentRef = this.createComponentRef(componentType, data);
        const domElement = (<EmbeddedViewRef<any>>componentRef.hostView).rootNodes[0] as HTMLElement;
        this._pane.appendChild(domElement);
        componentRef.hostView.detectChanges();
        return componentRef;
    }

    public dispose<T>(componentRef: ComponentRef<T>): void {
        componentRef.destroy();
        while (this._pane.hasChildNodes()) {
            this._pane.removeChild(this._pane.childNodes[0]);
        }
        this.hidePane();
    }

    private createComponentRef<T>(component: Type<T>, data: unknown = {}): ComponentRef<T> {
        const componentRef = this._viewContainer.createComponent(component);
        for (const key of Object.keys(data)) {
            componentRef.instance[key] = data[key];
        }
        return componentRef;
    }

    private createPane(): HTMLElement {
        const pane = this.document.createElement(`div`);
        pane.classList.add(`os-overlay-container`, `stretch-to-fill-parent`);
        pane.style.display = `none`;
        pane.style.zIndex = `1000`;
        return pane;
    }

    private showPane(): void {
        this._pane.style.display = `block`;
    }

    private hidePane(): void {
        this._pane.style.display = `none`;
    }
}
