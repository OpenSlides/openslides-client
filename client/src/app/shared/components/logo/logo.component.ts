import { Component, Input, OnInit } from '@angular/core';

import { MediaManageService } from 'app/core/ui-services/media-manage.service';
import { ThemeService } from 'app/core/ui-services/theme.service';
import { BaseComponent } from '../../../site/base/components/base.component';
import { ComponentServiceCollector } from '../../../core/ui-services/component-service-collector';

const DEFAULT_LOGO = '/assets/img/openslides-logo.svg';
const DEFAULT_LOGO_DARK_THEME = '/assets/img/openslides-logo-dark.svg';

/**
 * Component to hold the logo for the app.
 */
@Component({
    selector: 'os-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss']
})
export class LogoComponent extends BaseComponent implements OnInit {
    /**
     * Local variable to hold the path for a custom web header.
     */
    public logoPath: string;

    /**
     * determines if the current picture is displayed in the footer.
     * Optional.
     */
    @Input()
    public footer = false;

    @Input()
    public default = false;

    @Input()
    public hasDarkBackground = false;

    private get useDarkLogo(): boolean {
        return this._isDarkTheme || this.hasDarkBackground;
    }

    private _path: string | null = null;
    private _isDarkTheme = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private themeService: ThemeService,
        private mediaManageService: MediaManageService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.themeService.isDarkThemeObservable.subscribe(isDarkTheme => {
                this._isDarkTheme = isDarkTheme;
                this.changeLogo();
            })
        );
        if (this.default) {
            /**
             * reversed colors, default logo is usually on a negative contrast background
             * (i.e. mat-bar)
             */
            this.logoPath = this.useDarkLogo ? DEFAULT_LOGO_DARK_THEME : DEFAULT_LOGO;
        } else {
            this.mediaManageService.getLogoUrlObservable('web_header').subscribe(path => {
                this._path = path;
                this.changeLogo();
            });
        }
    }

    private changeLogo(): void {
        if (this.footer !== !!this._path) {
            this.logoPath = this._path;
        } else {
            this.logoPath = this.useDarkLogo ? DEFAULT_LOGO_DARK_THEME : DEFAULT_LOGO;
        }
    }
}
