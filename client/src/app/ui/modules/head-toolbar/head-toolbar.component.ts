import { TemplatePortal } from '@angular/cdk/portal';
import {
    AfterViewInit,
    Component,
    OnDestroy,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GlobalHeadbarService } from 'src/app/site/modules/global-headbar/global-headbar.service';

/**
 * Reusable toolbar compoment
 *
 * Will register the content into the global headbar
 * ```
 */
@Component({
    selector: `os-head-toolbar`,
    templateUrl: `./head-toolbar.component.html`,
    styleUrls: [`./head-toolbar.component.scss`],
    imports: [MatToolbarModule],
    encapsulation: ViewEncapsulation.None,
    standalone: true
})
export class HeadToolbarComponent implements AfterViewInit, OnDestroy {
    @ViewChild(`toolbarContent`) public toolbarContent: TemplateRef<unknown>;

    /**
     * Empty constructor
     */
    public constructor(
        private headbarService: GlobalHeadbarService,
        private _viewContainerRef: ViewContainerRef
    ) {}

    public ngAfterViewInit(): void {
        this.headbarService.additionalHeadbar = new TemplatePortal(this.toolbarContent, this._viewContainerRef);
    }

    public ngOnDestroy(): void {
        this.headbarService.additionalHeadbar = null;
    }
}
