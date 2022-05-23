import { DOCUMENT } from '@angular/common';
import { ComponentRef, EmbeddedViewRef, Inject, Injectable, Type, ViewContainerRef } from '@angular/core';

@Injectable({
    providedIn: `root`
})
export class DomService {
    private get hostElement(): HTMLElement {
        if (!this._viewContainer) {
            throw new Error(`A ViewContainerRef has to be set first`);
        }
        return this._viewContainer.element.nativeElement;
    }

    private _viewContainer: ViewContainerRef | null = null;
    private _pane: HTMLElement | null = null;

    public constructor(@Inject(DOCUMENT) private document: Document) {}

    public setViewContainer(container: ViewContainerRef): void {
        if (!!this._viewContainer) {
            throw new Error(`Only one view container should be attached!`);
        }
        this._viewContainer = container;
        this._pane = this.createPane();
        this.hostElement.appendChild(this._pane);
    }

    public attachComponent<T>(componentType: Type<T>, data: Object = {}): ComponentRef<T> {
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

    private createComponentRef<T>(component: Type<T>, data: Object = {}): ComponentRef<T> {
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
