import { Component, ContentChild, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ViewPortService } from 'src/app/site/services/view-port.service';

import { SidenavDrawerContentDirective } from '../../directives/sidenav-drawer-content.directive';
import { SidenavMainContentDirective } from '../../directives/sidenav-main-content.directive';

@Component({
    selector: `os-sidenav`,
    templateUrl: `./sidenav.component.html`,
    styleUrls: [`./sidenav.component.scss`]
})
export class SidenavComponent {
    @ContentChild(SidenavMainContentDirective, { read: TemplateRef, static: true })
    public content: TemplateRef<any> | null = null;

    @ContentChild(SidenavDrawerContentDirective, { read: TemplateRef, static: true })
    public drawerContent: TemplateRef<any> | null = null;

    @ViewChild(`sideNav`, { static: true, read: MatSidenav })
    private sideNav: MatSidenav | undefined;

    @Input()
    public logoLink = [``];

    public get isMobile(): boolean {
        return this.vp.isMobile;
    }

    public get raisedContent(): boolean {
        return this._raisedContent;
    }

    private _raisedContent: boolean = false;

    public constructor(private vp: ViewPortService) {}

    public close(): void {
        this.sideNav?.close();
    }

    public toggle(): void {
        this.sideNav?.toggle();
    }

    public mobileAutoCloseNav(): void {
        if (this.isMobile && this.sideNav) {
            this.sideNav.close();
        }
    }
}
