import { Injectable } from '@angular/core';
import { HtmlColor, Id } from '../../domain/definitions/key-types';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { OrganizationSettingsService } from '../pages/organization/services/organization-settings.service';
import { StorageService } from '../../gateways/storage.service';
import { ViewTheme } from '../pages/organization/pages/designs';
import { ColorDefinition, ColorService } from './color.service';
import { ThemeRequiredValues } from '../../domain/models/theme/theme';
import { ThemePalette } from '@angular/material/core';
import { ThemeRepositoryService } from 'src/app/gateways/repositories/themes/theme-repository.service';

const DARK_MODE_STORAGE_KEY = `theme_dark_mode`;
const DARK_MODE_CSS_CLASS = `openslides-dark-theme`;
const LIGHT_MODE_CSS_CLASS = `openslides-light-theme`;

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    public static readonly DEFAULT_PRIMARY_COLOR = `#317796`;
    public static readonly DEFAULT_ACCENT_COLOR = `#2196f3`;
    public static readonly DEFAULT_WARN_COLOR = `#f06400`;

    public get isDarkModeObservable(): Observable<boolean> {
        return this._isDarkModeSubject.asObservable();
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

    private readonly _isDarkModeSubject = new BehaviorSubject<boolean>(false);

    /**
     * Holds the current theme as member.
     */
    private _currentTheme: ViewTheme | null = null;

    private _currentThemeSubscription: Subscription | null = null;

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
        warn_500: warn = ThemeService.DEFAULT_WARN_COLOR
    }: Partial<ThemeRequiredValues> = {}): void {
        const primaryColorPalette = this.colorService.generateColorPaletteByHex(primary);
        const accentColorPalette = this.colorService.generateColorPaletteByHex(accent);
        const warnColorPalette = this.colorService.generateColorPaletteByHex(warn);
        this.setThemeByColorPalette(primaryColorPalette, `primary`);
        this.setThemeByColorPalette(accentColorPalette, `accent`);
        this.setThemeByColorPalette(warnColorPalette, `warn`);
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
        const valueContrast = color.darkContrast ? `rgba(black, 0.87)` : `white`;
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
