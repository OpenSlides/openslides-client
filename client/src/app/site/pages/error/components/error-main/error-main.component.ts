import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/site/services/auth.service';
import { FallbackRoutesService } from 'src/app/site/services/fallback-routes.service';

@Component({
    selector: `os-error-main`,
    templateUrl: `./error-main.component.html`,
    styleUrls: [`./error-main.component.scss`]
})
export class ErrorMainComponent implements OnInit {
    public error: string;
    public msg: string[] = [];

    private _meetingId: number;

    public constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router,
        private fallbackRoutesService: FallbackRoutesService
    ) {}

    public ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this._meetingId = params[`meetingId`];
            this.error = params[`error`];
            this.msg = params[`msg`];
        });
    }

    public leaveErrorPage(): void {
        this.router.navigate(this.getReturnUrl());
    }

    private getReturnUrl(): (string | number)[] {
        if (!this.authService.isAuthenticated()) {
            return [`login`];
        } else if (this._meetingId) {
            const fallbackRoute = this.fallbackRoutesService.getFallbackRoute();
            if (fallbackRoute) {
                return [this._meetingId, fallbackRoute];
            }

            return [this._meetingId];
        }

        return [``];
    }
}
