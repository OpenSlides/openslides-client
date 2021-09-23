import { Injectable } from '@angular/core';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { OrganizationSettingsService } from './organization-settings.service';
import { Observable, BehaviorSubject } from 'rxjs';

interface ThemeDefinition {
    name: string;
    class: string;
}

export const Themes: ThemeDefinition[] = [
    {
        name: _('OpenSlides Blue'),
        class: 'openslides-default-light-theme'
    },
    {
        name: _('OpenSlides Blue Dark'),
        class: 'openslides-default-dark-theme'
    },
    {
        name: _('OpenSlides Red'),
        class: 'openslides-red-light-theme'
    },
    {
        name: _('OpenSlides Red Dark'),
        class: 'openslides-red-dark-theme'
    },
    {
        name: _('OpenSlides Green'),
        class: 'openslides-green-light-theme'
    },
    {
        name: _('OpenSlides Green Dark'),
        class: 'openslides-green-dark-theme'
    }
];

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
    public static DEFAULT_THEME = Themes[0].class;

    public get isDarkThemeObservable(): Observable<boolean> {
        return this._isDarkThemeSubject.asObservable();
    }

    public get isDarkTheme(): boolean {
        if (!this._currentTheme) {
            return false;
        }
        return this._currentTheme.includes('dark');
    }

    private readonly _isDarkThemeSubject = new BehaviorSubject<boolean>(false);

    /**
     * Holds the current theme as member.
     */
    private _currentTheme: string;

    /**
     * Here it will subscribe to the observer from login data service. The stheme is part of
     * the login data, so get it from there and not from the config. This service will
     * also cache the theme and provide the right theme on login.
     *
     * @param orgaSettings must be injected to get the theme.
     */
    public constructor(orgaSettings: OrganizationSettingsService) {
        orgaSettings.get('theme').subscribe(newTheme => {
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
        this._currentTheme = theme;

        const classList = document.getElementsByTagName('body')[0].classList; // Get the classlist of the body.
        const toRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));
        if (toRemove.length) {
            classList.remove(...toRemove); // Remove all old themes.
        }
        classList.add(theme, ThemeService.DEFAULT_THEME); // Add the new theme.
        this._isDarkThemeSubject.next(this.isDarkTheme);
    }
}
