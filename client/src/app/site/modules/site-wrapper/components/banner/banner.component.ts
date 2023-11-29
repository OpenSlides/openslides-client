import { ComponentPortal } from '@angular/cdk/portal';
import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Constructable } from 'src/app/domain/interfaces/constructable';

import { BannerDefinition, BannerService } from '../../services/banner.service';

@Component({
    selector: `os-banner`,
    templateUrl: `./banner.component.html`,
    styleUrls: [`./banner.component.scss`]
})
export class BannerComponent implements OnDestroy {
    public readonly activeBanners: Observable<BannerDefinition[]>;

    private ownHeight = 0;

    public constructor(bannerService: BannerService) {
        this.activeBanners = bannerService.getActiveBannersObservable();
    }

    public ngOnDestroy(): void {
        this.registerBannerHeight(0);
    }

    public createComponentPortal(component: Constructable): ComponentPortal<any> {
        return new ComponentPortal(component);
    }

    public registerBannerHeight(height: number): void {
        const areaHeight =
            Number(document.documentElement.style.getPropertyValue(`--banner-area-height`).replace(`px`, ``)) || 0;
        const newHeight = areaHeight === this.ownHeight ? height : areaHeight - this.ownHeight + height;
        document.documentElement.style.setProperty(`--banner-area-height`, `${newHeight}px`);
        this.ownHeight = height;
    }
}
