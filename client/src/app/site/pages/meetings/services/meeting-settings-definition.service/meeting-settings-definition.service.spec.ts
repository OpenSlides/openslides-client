import { TestBed } from '@angular/core/testing';
import { meetingSettingsDefaults } from 'src/app/domain/definitions/meeting-settings-defaults';
import { Settings } from 'src/app/domain/models/meetings/meeting';
import { Group } from 'src/app/domain/models/users/group';

import { MeetingSettingsDefinitionService, SettingsMap } from './meeting-settings-definition.service';
import { meetingSettings, SettingsGroup, SettingsItem, SettingsType } from './meeting-settings-definitions';

const fakeSettings: SettingsGroup[] = [
    {
        label: `Test setting group`,
        icon: `test`,
        subgroups: [
            {
                label: `Test subgroup`,
                settings: [
                    {
                        key: `one` as keyof Settings,
                        label: `Setting one`,
                        type: `integer`
                    },
                    {
                        key: [`two` as keyof Settings, `three` as keyof Settings],
                        label: `Setting two and three`,
                        type: `daterange`
                    },
                    {
                        key: `four` as keyof Settings,
                        label: `Setting four`,
                        type: `datetime`
                    },
                    {
                        key: `five` as keyof Settings,
                        label: `Setting five`,
                        type: `date`
                    },
                    {
                        key: `a` as keyof Settings,
                        label: `Setting a`
                    },
                    {
                        key: `b` as keyof Settings,
                        label: `Setting b`,
                        type: `string`
                    },
                    {
                        key: `c` as keyof Settings,
                        label: `Setting c`,
                        type: `text`
                    },
                    {
                        key: `d` as keyof Settings,
                        label: `Setting d`,
                        type: `markupText`
                    },
                    {
                        key: `e` as keyof Settings,
                        label: `Setting e`,
                        type: `email`
                    },
                    {
                        key: `bool` as keyof Settings,
                        label: `Boolean setting`,
                        type: `boolean`
                    }, //
                    {
                        key: `groups` as keyof Settings,
                        label: `Group setting`,
                        type: `groups`
                    },
                    {
                        key: `translations` as keyof Settings,
                        label: `Translation setting`,
                        type: `translations`
                    },
                    {
                        key: `ranking` as keyof Settings,
                        label: `Ranking setting`,
                        type: `ranking`
                    },
                    {
                        key: `static` as keyof Settings,
                        label: `Static choice setting`,
                        type: `choice`,
                        choices: {
                            a: `A`,
                            b: `B`,
                            c: `C`
                        }
                    },
                    {
                        key: `dynamic` as keyof Settings,
                        label: `Dynamic choice setting`,
                        type: `choice`,
                        choicesFunc: {
                            collection: `model`,
                            idKey: `id`,
                            labelKey: `stuff`
                        }
                    }
                ]
            }
        ]
    }
];

const fakeSettingsMap: { [key: string]: SettingsItem } = fakeSettings
    .flatMap(group => group.subgroups.flatMap(subgroup => subgroup.settings))
    .filter(setting => !!setting)
    .mapToObject(setting =>
        (Array.isArray(setting.key) ? setting.key : [setting.key]).mapToObject(key => ({ [key]: setting }))
    );

const fakeSettingsDefaults: { [key: string]: any } = {
    ...[`one`, `two`, `four`, `five`].mapToObject((prop, index) => ({ [prop]: index + 1 })),
    bool: true,
    ...[`a`, `b`, `c`, `d`].mapToObject(letter => ({ [letter]: letter })),
    e: `e.mail@email.mail`,
    groups: [new Group()],
    translations: { a: `b`, c: `d`, e: `f` },
    ranking: [{ id: 1, entry: `a`, allocation: 2 }],
    static: `b`,
    dynamic: `s`
};

const fakeBrokenSettingsDefaults: { [key: string]: any } = {
    ...[`one`, `two`, `four`, `five`].mapToObject(letter => ({ [letter]: letter })),
    bool: `not a bool`,
    ...[`a`, `b`, `c`, `d`].mapToObject((prop, index) => ({ [prop]: index + 1 })),
    e: 3,
    groups: true,
    translations: `abcdefghijklmnopqrstuvwxyz`,
    ranking: 123456,
    static: [`d`],
    dynamic: 4
};

const typeToDefault: { [type in SettingsType]: any } = {
    integer: 0,
    boolean: false,
    groups: [],
    translations: {},
    ranking: [],
    choice: null,
    date: null,
    datetime: null,
    daterange: [null, null],
    string: ``,
    text: ``,
    markupText: ``,
    email: ``
};

describe(`MeetingSettingsDefinitionService`, () => {
    let service: MeetingSettingsDefinitionService;

    function mockGetters(settingsDefaults = fakeSettingsDefaults): void {
        spyOnProperty(service, `settings`).and.returnValue(fakeSettings);
        spyOnProperty(service, `settingsDefaults`).and.returnValue(settingsDefaults);
        spyOnProperty(service, `settingsMap`).and.returnValue(fakeSettingsMap as SettingsMap);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MeetingSettingsDefinitionService]
        });
        service = TestBed.inject(MeetingSettingsDefinitionService);
    });

    it(`test getters`, () => {
        expect(service.settings).toBe(meetingSettings);
        expect(service.settingsDefaults).toBe(meetingSettingsDefaults);
        expect(meetingSettings.length).toBeGreaterThan(0);
        expect(service.settingsMap).toBeTruthy();
        const indices = Array.from({ length: 4 }, () => Math.floor(Math.random() * 100));
        indices[0] = indices[0] % meetingSettings.length;
        const values: any[] = [meetingSettings[indices[0]]];
        const properties = [`subgroups`, `settings`, `key`];
        for (let i = 1; i < 4; i++) {
            if (Array.isArray(values[i - 1][properties[i - 1]])) {
                indices[i] = indices[i] % values[i - 1][properties[i - 1]].length;
            }
            values.push(
                Array.isArray(values[i - 1][properties[i - 1]])
                    ? values[i - 1][properties[i - 1]][indices[i]]
                    : values[i - 1][properties[i - 1]]
            );
        }
        expect(service.settingsMap[values[3]]).toBe(values[2]);
    });

    it(`test normal get methods`, () => {
        mockGetters();
        expect(service.getSettingsGroup(`Test setting group`)).toBe(fakeSettings[0]);
        expect(service.getSettingsGroup(`test setting group`)).toBe(fakeSettings[0]);
        expect(service.getSettingsKeys()).toEqual(
            fakeSettings.flatMap(group =>
                group.subgroups.flatMap(subgroup => subgroup.settings.flatMap(setting => setting.key))
            )
        );
    });

    for (const haveDefaults of [true, false]) {
        for (const setting of fakeSettings[0].subgroups[0].settings) {
            it(`test getDefaultValue for ${setting.type ?? `no given type`}${
                haveDefaults ? `` : ` if there's no defaults`
            }`, () => {
                mockGetters(haveDefaults ? fakeSettingsDefaults : {});
                expect(service.getDefaultValue(setting)).toEqual(
                    haveDefaults
                        ? setting.type === `daterange`
                            ? [2, null]
                            : fakeSettingsDefaults[Array.isArray(setting.key) ? setting.key[0] : setting.key]
                        : typeToDefault[setting.type ?? `string`]
                );
            });
            const keys = Array.isArray(setting.key) ? setting.key : [setting.key];
            for (let i = 0; i < keys.length; i++) {
                it(`test getDefaultValue for ${setting.type ?? `no given type`} with settings keys${
                    haveDefaults ? `` : ` if there's no defaults`
                } ${i + 1}`, () => {
                    mockGetters(haveDefaults ? fakeSettingsDefaults : {});
                    expect(service.getDefaultValue(keys[i])).toEqual(
                        haveDefaults
                            ? setting.type === `daterange`
                                ? [2, null]
                                : fakeSettingsDefaults[Array.isArray(setting.key) ? setting.key[0] : setting.key]
                            : typeToDefault[setting.type ?? `string`]
                    );
                });
            }
        }
    }

    for (const type of Object.keys(typeToDefault)) {
        const setting = Object.values(fakeSettingsMap).find(setting => setting.type === type);
        if (setting) {
            it(`test getDefaultValueForType for ${type}`, () => {
                mockGetters();
                expect(service.getDefaultValueForType(setting)).toEqual(typeToDefault[type]);
            });
        }
        const key = Array.isArray(setting.key) ? setting.key[0] : setting.key;
        it(`test validateDefault for ${type}`, () => {
            mockGetters();
            expect(() => service.validateDefault(key, fakeSettingsDefaults[key])).not.toThrowError();
        });
        it(`test validateDefault for ${type} with broken default`, () => {
            mockGetters(fakeBrokenSettingsDefaults);
            expect(() => service.validateDefault(key, fakeBrokenSettingsDefaults[key])).toThrowError();
        });
    }
});
