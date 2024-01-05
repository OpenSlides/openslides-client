import { Component, inject, Input, OnInit } from '@angular/core';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { ThemeService } from 'src/app/site/services/theme.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

const DEFAULT_LOGO = `/assets/img/openslides-logo.svg`;
const DEFAULT_LOGO_DARK_THEME = `/assets/img/openslides-logo-dark.svg`;

@Component({
    selector: `os-logo`,
    templateUrl: `./logo.component.html`,
    styleUrls: [`./logo.component.scss`]
})
export class LogoComponent extends BaseUiComponent implements OnInit {
    /**
     * Local variable to hold the path for a custom web header.
     */
    public logoPath: string | null = null;

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
        return this._isDarkMode || this.hasDarkBackground;
    }

    private _path: string | null = null;
    private _isDarkMode = false;

    private themeService = inject(ThemeService);
    private mediaManageService = inject(MediaManageService);

    public ngOnInit(): void {
        this.subscriptions.push(
            this.themeService.isDarkModeObservable.subscribe(isDarkMode => {
                this._isDarkMode = isDarkMode;
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
            this.mediaManageService.getLogoUrlObservable(`web_header`).subscribe(path => {
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
