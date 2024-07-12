import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise, startWith } from 'rxjs';

/**
 * Watches URL changes.
 * Can be enhanced using locale storage to support back-navigation even after reload
 */
@Injectable({
    providedIn: `root`
})
export class RoutingStateService {
    private skipUnsafeRouteCheck = false;
    /**
     * Hold the previous URL
     */
    private _previousUrl: string | null = null;

    /**
     * Stores the routing state
     */
    private _customOrigin: string | null = null;

    /**
     * Unsafe paths that the user should not go "back" to
     * TODO: Might also work using Routing parameters
     */
    private unsafeUrls: string[] = [`/login`, `/privacypolicy`, `/legalnotice`, `/new`, `/create`];

    /**
     * Checks if the previous URL is safe to navigate to.
     * If this fails, the open nav button should be shown
     */
    public get isSafePrevUrl(): boolean {
        if (this._previousUrl && !this.skipUnsafeRouteCheck) {
            return !this.unsafeUrls.some(unsafeUrl => this._previousUrl?.includes(unsafeUrl));
        } else {
            return true;
        }
    }

    public get previousUrl(): string | null {
        return this._previousUrl;
    }

    public get customOrigin(): string | null {
        return this._customOrigin;
    }

    private _currentUrl: string = this.location.path();

    /**
     * Watch routing changes and save the last visited URL
     *
     * @param router Angular Router
     */
    public constructor(private router: Router, private location: Location) {
        this.router.events
            .pipe(
                filter(e => e instanceof RoutesRecognized),
                startWith(null),
                pairwise()
            )
            .subscribe((event: any[]) => {
                this.skipUnsafeRouteCheck =
                    router.getCurrentNavigation()?.extras?.state &&
                    router.getCurrentNavigation()?.extras?.state[`canGoBack`];
                this._previousUrl = event[0]?.urlAfterRedirects ?? this._currentUrl;
                const currentNavigationExtras = router.getCurrentNavigation()?.extras;
                if (currentNavigationExtras && currentNavigationExtras.state && currentNavigationExtras.state[`back`]) {
                    this._customOrigin = this._previousUrl;
                } else if (
                    this._customOrigin &&
                    event[0] &&
                    !this.isSameComponent(event[0].urlAfterRedirects, event[1].urlAfterRedirects)
                ) {
                    this._customOrigin = null;
                }
                this._currentUrl = event[1].urlAfterRedirects;
            });
    }

    public goBack(): void {
        this.location.back();
    }

    /**
     * Analyse the URL to check if you were navigating using the same components
     */
    private isSameComponent(urlA: string, urlB: string): boolean {
        const pathA = urlA.slice(0, urlA.lastIndexOf(`/`));
        const pathB = urlB.slice(0, urlB.lastIndexOf(`/`));
        const paramA = urlA.slice(urlA.lastIndexOf(`/`) + 1);
        const paramB = urlB.slice(urlA.lastIndexOf(`/`) + 1);
        return pathA === pathB && !isNaN(+paramA) && !isNaN(+paramB);
    }
}
