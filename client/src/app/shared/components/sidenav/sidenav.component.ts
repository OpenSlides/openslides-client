import { Component, ContentChild, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { SidenavContentDirective } from './sidenav-content.directive';
import { SidenavDrawerContentDirective } from './sidenav-drawer-content.directive';

@Component({
    selector: 'os-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
    @ContentChild(SidenavContentDirective, { read: TemplateRef, static: true })
    public content: TemplateRef<any>;

    @ContentChild(SidenavDrawerContentDirective, { read: TemplateRef, static: true })
    public drawerContent: TemplateRef<any>;

    @ViewChild('sideNav', { static: true, read: MatSidenav })
    private sideNav: MatSidenav | undefined;

    @Input()
    public isPrimaryBackground = false;

    public get isMobile(): boolean {
        return this.vp.isMobile;
    }

    public get meeting(): ViewMeeting | undefined {
        return this.activeMeetingService.meeting;
    }

    public constructor(private vp: ViewportService, private activeMeetingService: ActiveMeetingService) {}

    public close(): void {
        this.sideNav?.close();
    }

    public toggle(): void {
        this.sideNav?.toggle();
    }

    public mobileAutoCloseNav(): void {
        if (this.isMobile) {
            this.sideNav.close();
        }
    }

    public getLinkToMainPage(): (string | number)[] {
        return this.meeting ? ['/', this.meeting.id] : [''];
    }
}
