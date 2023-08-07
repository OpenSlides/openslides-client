import { Injectable } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PollColor } from 'src/app/domain/models/poll';
import { ThemeRepositoryService } from 'src/app/gateways/repositories/themes/theme-repository.service';

import { HtmlColor, Id } from '../../domain/definitions/key-types';
import { ThemeGeneralColors, ThemeRequiredValues } from '../../domain/models/theme/theme';
import { StorageService } from '../../gateways/storage.service';
import { ViewTheme } from '../pages/organization/pages/designs';
import { OrganizationSettingsService } from '../pages/organization/services/organization-settings.service';
import { ColorDefinition, ColorService } from './color.service';

const DARK_MODE_STORAGE_KEY = `theme_dark_mode`;
const DARK_MODE_CSS_CLASS = `openslides-dark-theme`;
const LIGHT_MODE_CSS_CLASS = `openslides-light-theme`;

export const GENERAL_DEFAULT_COLORS: Partial<ThemeGeneralColors> = {
    yes: `#4caf50`,
    no: `#cc6c5b`,
    abstain: `#a6a6a6`
};
export type GeneralDefaultColorName = keyof typeof GENERAL_DEFAULT_COLORS;

@Injectable({
    providedIn: `root`
})
export class ThemeService {
    public static readonly DEFAULT_PRIMARY_COLOR = `#317796`;
    public static readonly DEFAULT_ACCENT_COLOR = `#2196f3`;
    public static readonly DEFAULT_WARN_COLOR = `#f06400`;

    public get isDarkModeObservable(): Observable<boolean> {
        return this._isDarkModeSubject;
    }

    public set isDarkMode(useDarkMode: boolean) {
        if (useDarkMode) {
            this.changeThemeClass(DARK_MODE_CSS_CLASS);
        } else {
            this.changeThemeClass(LIGHT_MODE_CSS_CLASS);
        }
        this._isDarkModeSubject.next(useDarkMode);
        this.storage.set(DARK_MODE_STORAGE_KEY, useDarkMode);
    }

    public get currentAccentColor(): HtmlColor {
        return this._currentTheme?.accent_500 ?? ThemeService.DEFAULT_ACCENT_COLOR;
    }

    /**
     * Subject that contains the current colors for the headbar, and the yes, no and abstain poll options.
     *
     * Set by the ColorService.
     */
    public readonly currentGeneralColorsSubject: BehaviorSubject<Partial<ThemeGeneralColors>> = new BehaviorSubject({});

    private readonly _isDarkModeSubject = new BehaviorSubject<boolean>(false);

    /**
     * Holds the current theme as member.
     */
    private _currentTheme: ViewTheme | null = null;

    private _currentThemeSubscription: Subscription | null = null;

    private _primaryColorPalette: ColorDefinition[];

    /**
     * Here it will subscribe to the observer from login data service. The theme is part of
     * the login data, so get it from there and not from the config. This service will
     * also cache the theme and provide the right theme on login.
     *
     * @param orgaSettings must be injected to get the theme.
     */
    public constructor(
        orgaSettings: OrganizationSettingsService,
        private colorService: ColorService,
        private themeRepo: ThemeRepositoryService,
        private storage: StorageService
    ) {
        orgaSettings.get(`theme_id`).subscribe(themeId => {
            if (themeId) {
                this.changeThemeById(themeId);
            }
        });
        storage.get<boolean>(DARK_MODE_STORAGE_KEY).then(useDarkMode => this.setInitialTheme(useDarkMode));
        // The observable above will not fire. Do it by hand
        this.changeThemePalettes();
    }

    public getDefaultColorByPalette(palette: ThemePalette): HtmlColor {
        if (palette === `primary`) {
            return ThemeService.DEFAULT_PRIMARY_COLOR;
        }
        if (palette === `warn`) {
            return ThemeService.DEFAULT_WARN_COLOR;
        }
        return ThemeService.DEFAULT_ACCENT_COLOR;
    }

    public toggleDarkMode(): void {
        this.isDarkMode = !this._isDarkModeSubject.value;
    }

    public getPollColor(key: string): string {
        if ([`yes`, `no`, `abstain`].includes(key)) {
            return this.currentGeneralColorsSubject.value[key] ?? GENERAL_DEFAULT_COLORS[key];
        }
        return PollColor[key];
    }

    /**
     * Function to change the theme and ensures, that old themes are removed.
     *
     * @param theme The theme which is applied.
     */
    private changeThemeById(themeId: Id): void {
        this.unsubscribe();
        this._currentThemeSubscription = this.themeRepo.getViewModelObservable(themeId).subscribe(theme => {
            this._currentTheme = theme;
            this.changeThemePalettes(theme === null ? undefined : theme);
        });
    }

    private setInitialTheme(useDarkMode?: boolean): void {
        if (typeof useDarkMode === `boolean`) {
            this.isDarkMode = useDarkMode;
        } else {
            this.isDarkMode = window.matchMedia && window.matchMedia(`(prefers-color-scheme: dark)`).matches;
        }
    }

    private changeThemeClass(nextThemeCssClass: string): void {
        const classList = document.getElementsByTagName(`body`)[0].classList;
        const toRemove = Array.from(classList).filter(className => className.includes(`-theme`));
        if (toRemove.length) {
            classList.remove(...toRemove);
        }
        classList.add(nextThemeCssClass);
    }

    private changeThemePalettes({
        primary_500: primary = ThemeService.DEFAULT_PRIMARY_COLOR,
        accent_500: accent = ThemeService.DEFAULT_ACCENT_COLOR,
        warn_500: warn = ThemeService.DEFAULT_WARN_COLOR,
        yes = GENERAL_DEFAULT_COLORS.yes,
        no = GENERAL_DEFAULT_COLORS.no,
        abstain = GENERAL_DEFAULT_COLORS.abstain,
        headbar,
        ..._
    }: Partial<ThemeRequiredValues & ThemeGeneralColors> = {}): void {
        this._primaryColorPalette = this.colorService.generateColorPaletteByHex(primary);
        const accentColorPalette = this.colorService.generateColorPaletteByHex(accent);
        const warnColorPalette = this.colorService.generateColorPaletteByHex(warn);
        this.setThemeByColorPalette(this._primaryColorPalette, `primary`);
        this.setThemeByColorPalette(accentColorPalette, `accent`);
        this.setThemeByColorPalette(warnColorPalette, `warn`);
        this.changeThemeGeneralColors({ yes, no, abstain, headbar });
    }

    /**
     * Adds the yes, no, abstain and headbar colors to the styles.
     *
     * Uses default values for yes, no and abstain,
     * and the darkest version of the primary color for headbar,
     * if the fields are empty.
     */
    private changeThemeGeneralColors(data: ThemeGeneralColors): void {
        data.headbar = data.headbar ?? (this._primaryColorPalette.find(def => def.name === `900`).hex as HtmlColor);
        for (const usage of Object.keys(data)) {
            const key = `--theme-${usage}`;
            const value = data[usage];
            document.documentElement.style.setProperty(key, value);
        }
        this.currentGeneralColorsSubject.next(data);
        document.documentElement.style.setProperty(
            `--theme-headbar-contrast`,
            this.colorService.isLightFromHex(data.headbar) ? `rgba(black, 0.87)` : `white`
        );
    }

    private setThemeByColorPalette(colorPalette: ColorDefinition[], usage: ThemePalette): void {
        for (const color of colorPalette) {
            this.setThemeColor(color, usage);
        }
    }

    private setThemeColor(color: ColorDefinition, usage: ThemePalette): void {
        const key = `--theme-${usage}-${color.name}`;
        const value = color.hex;
        const keyContrast = `--theme-${usage}-contrast-${color.name}`;
        const valueContrast = color.darkContrast ? `rgba(0, 0, 0, 0.87)` : `white`;
        document.documentElement.style.setProperty(key, value);
        document.documentElement.style.setProperty(keyContrast, valueContrast);
    }

    private unsubscribe(): void {
        if (this._currentThemeSubscription) {
            this._currentThemeSubscription.unsubscribe();
            this._currentThemeSubscription = null;
        }
    }
}
