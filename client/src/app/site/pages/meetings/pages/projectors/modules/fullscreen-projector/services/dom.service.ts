import { DOCUMENT } from '@angular/common';
import { ComponentFactoryResolver, Injectable, ApplicationRef, Injector, EmbeddedViewRef, Inject } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DomService {
    private _hostElement: HTMLElement | null = null;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        @Inject(DOCUMENT) private document: Document
    ) {}

    public appendComponentToBody(component: any, data: { [index: string | number]: any } = {}): void {
        if (!this._hostElement) {
            this._hostElement = this.createHostElement();
            this.document.body.appendChild(this._hostElement);
        }
        while (this._hostElement.hasChildNodes()) {
            this._hostElement.removeChild(this._hostElement.childNodes[0]);
        }
        // 1. Create a component reference from the component
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory<any>(component)
            .create(this.injector);
        for (const index of Object.keys(data)) {
            componentRef.instance[index] = data[index];
        }

        // 2. Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(componentRef.hostView);

        // 3. Get DOM element from component
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

        // 4. Append DOM element to the body
        this._hostElement.appendChild(domElem);
    }

    private createHostElement(): HTMLElement {
        const pane = document.createElement(`div`);
        pane.classList.add(`os-overlay-container`, `stretch-to-fill-parent`);
        pane.style.zIndex = `999`;
        return pane;
    }
}
