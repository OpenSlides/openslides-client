import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/core/core-services/history.service';
import { TimeTravelService } from 'app/core/core-services/time-travel.service';
import { BannerDefinition, BannerService } from 'app/core/ui-services/banner.service';
import { langToLocale } from 'app/shared/utils/lang-to-locale';

@Component({
    selector: `os-banner`,
    templateUrl: `./banner.component.html`,
    styleUrls: [`./banner.component.scss`]
})
export class BannerComponent implements OnInit {
    public banners: BannerDefinition[] = [];

    public constructor(
        private historyService: HistoryService,
        protected translate: TranslateService,
        public timeTravel: TimeTravelService,
        private banner: BannerService
    ) {}

    public ngOnInit(): void {
        this.banner.activeBanners.subscribe(banners => {
            this.banners = banners;
        });
    }

    /**
     * Get the timestamp for the current point in history mode.
     * Tries to detect the ideal timestamp format using the translation service
     *
     * @returns the timestamp as string
     */
    public getHistoryTimestamp(): string {
        return this.historyService.getHistoryTimeStamp(langToLocale(this.translate.currentLang));
    }
}
