import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';

import { MotionDetailServiceModule } from '../motion-detail-service.module';

@Injectable({
    providedIn: MotionDetailServiceModule
})
export class MotionDetailViewOriginUrlService {
    private previousUrl: string;

    public constructor(private router: Router) {
        this.router.events
            .pipe(
                filter((e: any) => e instanceof RoutesRecognized),
                pairwise()
            )
            .subscribe((events: RoutesRecognized[]) => {
                this.previousUrl = events[0].urlAfterRedirects;
            });
    }

    public getPreviousUrl() {
        return this.previousUrl;
    }
}
