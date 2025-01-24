import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { ThemeRepositoryService } from 'src/app/gateways/repositories/themes/theme-repository.service';
import { StorageService } from 'src/app/gateways/storage.service';

import { OrganizationSettingsService } from '../pages/organization/services/organization-settings.service';
import { ColorService } from './color.service';
import { GENERAL_DEFAULT_COLORS, ThemeService } from './theme.service';

describe(`ThemeService`, () => {
    let service: ThemeService;
    let orgaSettingsSpy: jasmine.SpyObj<OrganizationSettingsService>;
    let themeRepoSpy: jasmine.SpyObj<ThemeRepositoryService>;
    let storageSpy: jasmine.SpyObj<StorageService>;

    beforeEach(() => {
        const spy1 = jasmine.createSpyObj(`OrganizationSettingsService`, [`get`]);
        const spy3 = jasmine.createSpyObj(`ThemeRepositoryService`, [`getViewModelObservable`]);
        const spy4 = jasmine.createSpyObj(`StorageService`, [`set`, `get`]);
        spy1.get.and.callFake(function (_) {
            return jasmine.createSpyObj(Observable, [`subscribe`]);
        });
        spy4.get.and.callFake(function (_) {
            return jasmine.createSpyObj(Observable, [`then`]);
        });
        TestBed.configureTestingModule({
            providers: [
                ThemeService,
                { provide: OrganizationSettingsService, useValue: spy1 },
                { provide: ColorService },
                { provide: ThemeRepositoryService, useValue: spy3 },
                { provide: StorageService, useValue: spy4 }
            ]
        });
        service = TestBed.inject(ThemeService);
        orgaSettingsSpy = TestBed.inject(OrganizationSettingsService) as jasmine.SpyObj<OrganizationSettingsService>;
        themeRepoSpy = TestBed.inject(ThemeRepositoryService) as jasmine.SpyObj<ThemeRepositoryService>;
        storageSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
        expect(orgaSettingsSpy.get.calls.count()).toBe(1);
        expect(themeRepoSpy.getViewModelObservable.calls.count()).toBe(0);
        expect(storageSpy.get.calls.count()).toBe(1);
    });

    it(`set isDarkMode to true and toggleDarkMode`, () => {
        let dark: boolean | null = null;
        service.isDarkModeObservable.subscribe(mode => (dark = mode));
        service.isDarkMode = true;
        expect(storageSpy.set.calls.count()).toBe(1);
        expect(dark).toBe(true);
        service.toggleDarkMode();
        expect(storageSpy.set.calls.count()).toBe(2);
        expect(dark).toBe(false);
    });

    it(`get currentAccentColor`, () => {
        expect(service.currentAccentColor).toBe(`#2196f3`);
    });

    it(`use getPollColor()`, () => {
        expect(service.getPollColor(`yes`)).toBe(GENERAL_DEFAULT_COLORS[`yes`]);
        expect(service.getPollColor(`no`)).toBe(GENERAL_DEFAULT_COLORS[`no`]);
        expect(service.getPollColor(`abstain`)).toBe(GENERAL_DEFAULT_COLORS[`abstain`]);
    });
});
