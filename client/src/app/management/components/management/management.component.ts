import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MainMenuService } from 'app/core/core-services/main-menu.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { SidenavComponent } from 'app/shared/components/sidenav/sidenav.component';
import { BaseComponent } from 'app/site/base/components/base.component';
import { Observable } from 'rxjs';

import { ThemeService } from '../../../core/ui-services/theme.service';

@Component({
    selector: `os-management`,
    templateUrl: `./management.component.html`,
    styleUrls: [`./management.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class ManagementComponent extends BaseComponent implements OnInit {
    public get isDarkThemeObservable(): Observable<boolean> {
        return this.themeService.isDarkModeObservable;
    }

    @ViewChild(`sideNav`, { static: true, read: SidenavComponent })
    private sideNav: SidenavComponent | undefined;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private menuService: MainMenuService,
        private themeService: ThemeService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.menuService.toggleMenuSubject.subscribe(() => this.toggleSidenav()));
    }

    private toggleSidenav(): void {
        this.sideNav?.toggle();
    }
}
