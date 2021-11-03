import { CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { OverlayPosition } from 'app/core/ui-services/overlay.service';

@Component({
    selector: `os-overlay`,
    templateUrl: `./overlay.component.html`,
    styleUrls: [`./overlay.component.scss`]
})
export class OverlayComponent implements OnInit {
    @ViewChild(CdkPortalOutlet, { static: true })
    public outletPortal: CdkPortalOutlet;

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
    public backdropClass: string;

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

    /**
     * Default constructor
     */
    public constructor() {}

    /**
     * OnInit
     */
    public ngOnInit(): void {}

    /**
     * Attaches to the backdrop overlay a custom template.
     *
     * @param templateRef The reference to attach.
     */
    public attachTemplate<T>(templateRef: TemplatePortal<T>): void {
        this.outletPortal.attachTemplatePortal(templateRef);
    }

    /**
     * Attaches to the backdrop overlay a custom component.
     *
     * @param componentRef The component to attach.
     */
    public attachComponent<C>(componentRef: ComponentPortal<C>): C {
        return this.outletPortal.attachComponentPortal(componentRef).instance;
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
