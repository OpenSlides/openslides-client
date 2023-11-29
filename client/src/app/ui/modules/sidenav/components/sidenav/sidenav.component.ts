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

    @ViewChild(`sideNav`, { read: MatSidenav })
    private sideNav: MatSidenav | undefined;

    @Input()
    public logoLink = [``];

    private desktopOpen = true;

    public get isMobile(): boolean {
        return this.vp.isMobile;
    }

    public get isOpen(): boolean {
        return this.isMobile ? this.sideNav?.opened ?? false : this.desktopOpen;
    }

    public constructor(private vp: ViewPortService) {}

    public close(): void {
        if (this.isMobile) {
            this.sideNav?.close();
        } else {
            this.desktopOpen = false;
        }
    }

    public toggle(): void {
        if (this.isMobile) {
            this.sideNav?.toggle();
        } else {
            this.desktopOpen = !this.desktopOpen;
        }
    }

    public mobileAutoCloseNav(): void {
        if (this.isMobile && this.sideNav) {
            this.sideNav.close();
        }
    }

    public open(): void {
        if (this.isMobile) {
            this.sideNav?.open();
        } else {
            this.desktopOpen = true;
        }
    }
}
