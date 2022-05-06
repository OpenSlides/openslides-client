import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/site/services/theme.service';

@Component({
    selector: 'os-site-wrapper',
    templateUrl: './site-wrapper.component.html',
    styleUrls: ['./site-wrapper.component.scss']
})
export class SiteWrapperComponent {
    public constructor(_themeService: ThemeService) {}
}
