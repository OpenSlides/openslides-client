import { MeetingSettingsModule } from './meeting-settings.module';

describe(`SettingsModule`, () => {
    let settingsModule: MeetingSettingsModule;

    beforeEach(() => {
        settingsModule = new MeetingSettingsModule();
    });

    it(`should create an instance`, () => {
        expect(settingsModule).toBeTruthy();
    });
});
