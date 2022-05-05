import { CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, EventEmitter, HostListener, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { OverlayPosition } from '../../../../definitions';

@Component({
    selector: 'os-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent {
    @ViewChild(CdkPortalOutlet, { static: false })
    // private readonly _outletPortal: CdkPortalOutlet | null = null;
    private set _outletPortal(portal: CdkPortalOutlet | null) {
        console.log(`outletPortal:`, portal);
        this.__instance = portal;
    }

    private get _outletPortal(): CdkPortalOutlet | null {
        return this.__instance;
    }

    private __instance: CdkPortalOutlet | null = null;

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

    public constructor(viewContainer: ViewContainerRef) {
        console.log(`viewContainer`, viewContainer);
    }

    /**
     * Attaches to the backdrop overlay a custom template.
     *
     * @param templateRef The reference to attach.
     */
    public attachTemplate<T>(templateRef: TemplatePortal<T>): void {
        this._outletPortal!.attachTemplatePortal(templateRef);
    }

    /**
     * Attaches to the backdrop overlay a custom component.
     *
     * @param componentRef The component to attach.
     */
    public attachComponent<C>(componentRef: ComponentPortal<C>): C {
        return this._outletPortal!.attachComponentPortal(componentRef).instance;
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
