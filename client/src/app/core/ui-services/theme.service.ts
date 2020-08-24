import { Injectable } from '@angular/core';

import { LoginDataService } from './login-data.service';

/**
 * Service to set the theme for OpenSlides.
 */
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    /**
     * Constant, that describes the default theme class.
     */
    public static DEFAULT_THEME = 'openslides-default-light-theme';

    /**
     * Holds the current theme as member.
     */
    private currentTheme: string;

    public get isDarkTheme(): boolean {
        if (!this.currentTheme) {
            return false;
        }
        return this.currentTheme.includes('dark');
    }

    /**
     * Here it will subscribe to the observer from login data service. The stheme is part of
     * the login data, so get it from there and not from the config. This service will
     * also cache the theme and provide the right theme on login.
     *
     * @param loginDataService must be injected to get the theme.
     */
    public constructor(loginDataService: LoginDataService) {
        loginDataService.theme.subscribe(newTheme => {
            if (!newTheme) {
                return;
            }
            this.changeTheme(newTheme);
        });
        // The observable above will not fire. Do it by hand
        this.changeTheme(ThemeService.DEFAULT_THEME);
    }

    /**
     * Function to change the theme and ensures, that old themes are removed.
     *
     * @param theme The theme which is applied.
     */
    private changeTheme(theme: string): void {
        this.currentTheme = theme;

        const classList = document.getElementsByTagName('body')[0].classList; // Get the classlist of the body.
        const toRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));
        if (toRemove.length) {
            classList.remove(...toRemove); // Remove all old themes.
        }
        classList.add(theme, ThemeService.DEFAULT_THEME); // Add the new theme.
    }
}
