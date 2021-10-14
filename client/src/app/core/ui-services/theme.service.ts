import { Injectable } from '@angular/core';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { OrganizationSettingsService } from './organization-settings.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { HtmlColor } from '../definitions/key-types';

interface ThemeDefinition {
    name: string;
    class: string;
}

class ThemeMap {
    public primary: HtmlColor;
    public accent: HtmlColor;
    public warn: HtmlColor;
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

const blueThemeMap: ThemeMap = {
    primary: '#317796',
    accent: '#2196f3',
    warn: '#f06400'
};

const redThemeMap: ThemeMap = {
    primary: '#c31c23',
    accent: '#03a9f4',
    warn: '#11c2a2'
};

const greenThemeMap: ThemeMap = {
    primary: '#46962c',
    accent: '#55c3b6',
    warn: '#e359ce'
};

const themeMaps: { [cssClass: string]: ThemeMap } = {
    'openslides-default-light-theme': blueThemeMap,
    'openslides-default-dark-theme': blueThemeMap,
    'openslides-red-light-theme': redThemeMap,
    'openslides-red-dark-theme': redThemeMap,
    'openslides-green-light-theme': greenThemeMap,
    'openslides-green-dark-theme': greenThemeMap
};

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
        if (!this._currentThemeClass) {
            return false;
        }
        return this._currentThemeClass.includes('dark');
    }

    public get currentAccentColor(): HtmlColor {
        return themeMaps[this._currentThemeClass]?.accent ?? blueThemeMap.accent;
    }

    private readonly _isDarkThemeSubject = new BehaviorSubject<boolean>(false);

    /**
     * Holds the current theme as member.
     */
    private _currentThemeClass: string;

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
        this._currentThemeClass = theme;

        const classList = document.getElementsByTagName('body')[0].classList; // Get the classlist of the body.
        const toRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));
        if (toRemove.length) {
            classList.remove(...toRemove); // Remove all old themes.
        }
        classList.add(theme, ThemeService.DEFAULT_THEME); // Add the new theme.
        this._isDarkThemeSubject.next(this.isDarkTheme);
    }
}
