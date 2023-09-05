import {
    Component,
    EmbeddedViewRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    TemplateRef,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

import { OverlayPosition } from '../../definitions';

@Component({
    selector: `os-overlay`,
    templateUrl: `./overlay.component.html`,
    styleUrls: [`./overlay.component.scss`]
})
export class OverlayComponent {
    @ViewChild(`viewContainer`, { read: ViewContainerRef, static: true })
    private readonly _viewContainer!: ViewContainerRef;

    /**
     * Optional set the position of the component overlying on this overlay.
     *
     * Defaults to `'center'`.
     */
    @Input()
    public position: OverlayPosition = `center`;

    /**
     * An optional class applied to the backdrop of this overlay.
     */
    @Input()
    public backdropClass: string | string[] | object = {};

    /**
     * EventEmitter to handle a click on the backdrop.
     */
    @Output()
    public backdrop = new EventEmitter<void>();

    /**
     * EventEmitter to handle clicking `escape`.
     */
    @Output()
    public escape = new EventEmitter<void>();

    private get hostElement(): HTMLElement {
        return this._viewContainer.element.nativeElement;
    }

    /**
     * Attaches to the backdrop overlay a custom template.
     *
     * @param _templateRef The reference to attach.
     */
    public attachTemplate<T>(_templateRef: TemplateRef<T>): void {}

    /**
     * Attaches to the backdrop overlay a custom component.
     *
     * @param component The component to attach.
     */
    public attachComponent<C>(component: Type<C>): C {
        const componentRef = this._viewContainer.createComponent(component);
        const instance = componentRef.instance;
        const domElement = (<EmbeddedViewRef<any>>componentRef.hostView).rootNodes[0] as HTMLElement;
        this.hostElement.appendChild(domElement);
        return instance;
    }

    /**
     * Listens to keyboard inputs.
     *
     * If the user presses `escape`, the EventEmitter will emit a signal.
     *
     * @param event `KeyboardEvent`.
     */
    @HostListener(`document:keydown`, [`$event`])
    public keyListener(event: KeyboardEvent): void {
        if (event.code === `Escape`) {
            this.escape.emit();
        }
    }
}
