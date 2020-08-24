import { Component, Input, OnInit } from '@angular/core';

import { MediaManageService } from 'app/core/ui-services/media-manage.service';
import { ThemeService } from 'app/core/ui-services/theme.service';

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
export class LogoComponent implements OnInit {
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

    public constructor(private themeService: ThemeService, private mediaManageService: MediaManageService) {}

    public ngOnInit(): void {
        this.mediaManageService.getLogoUrlObservable('web_header').subscribe(path => {
            if (this.footer !== !!path) {
                this.logoPath = path;
            } else {
                this.logoPath = this.themeService.isDarkTheme ? DEFAULT_LOGO_DARK_THEME : DEFAULT_LOGO;
            }
        });
    }
}
