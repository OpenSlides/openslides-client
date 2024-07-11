import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { DelegationSetting } from 'src/app/domain/definitions/delegation-setting';
import { Permission } from 'src/app/domain/definitions/permission';
import { OperatorService } from 'src/app/site/services/operator.service';

import { PermsDirective } from './perms.directive';

type TestConditionalType = {
    and: boolean;
    or: boolean;
    complement: boolean;
};

export class BasePermsTestComponent<ComponentDataType extends object> {
    public constructor(public conditionals: ComponentDataType) {}

    public setTestComponentData(conditionals: Partial<ComponentDataType>): void {
        for (const key of Object.keys(conditionals)) {
            this.conditionals[key] = conditionals[key];
        }
    }
}

@Component({
    template: `
        <div id="normal" *osPerms="permission"></div>
        <div id="or" *osPerms="permission; or: conditionals.or"></div>
        <div id="and" *osPerms="permission; and: conditionals.and"></div>
        <div id="complement" *osPerms="permission; complement: conditionals.complement"></div>
        <div
            id="delegation"
            *osPerms="
                permission;
                delegationSettingAlternative: ['users_forbid_delegator_in_list_of_speakers', altPermission]
            "
        ></div>
    `
})
class TestComponent extends BasePermsTestComponent<TestConditionalType> {
    public readonly permission = Permission.listOfSpeakersCanSee;
    public readonly altPermission = Permission.listOfSpeakersCanManage;

    public constructor() {
        super({ and: true, or: true, complement: true });
    }
}

class MockOperatorService {
    public get operatorUpdated(): Observable<void> {
        return this._operatorUpdatedSubject;
    }

    public get delegationSettingsUpdated(): Observable<void> {
        return this._delegationSettingsUpdatedSubject;
    }

    private _operatorUpdatedSubject = new Subject<void>();
    private _delegationSettingsUpdatedSubject = new Subject<void>();
    private _permList: Permission[] = [];
    private _appliedSettings: DelegationSetting[] = [];
    private _user_delegated = false;

    public hasPerms(...checkPerms: Permission[]): boolean {
        return checkPerms.some(perm => this._permList.includes(perm));
    }

    public isAllowedWithDelegation(...appliedSettings: DelegationSetting[]): boolean {
        return !appliedSettings.some(setting => this._appliedSettings.includes(setting)) || !this._user_delegated;
    }

    public changeOperatorPermsForTest(newPermList: Permission[]): void {
        this._permList = newPermList;
        this._operatorUpdatedSubject.next();
    }

    public changeOperatorDelegationForTest(delegated: boolean): void {
        this._user_delegated = delegated;
        this._operatorUpdatedSubject.next();
    }

    public changeDelegatorSettingsForTest(appliedSettings: DelegationSetting[]): void {
        this._appliedSettings = appliedSettings;
        this._delegationSettingsUpdatedSubject.next();
    }
}

describe(`PermsDirective`, () => {
    let fixture: ComponentFixture<TestComponent>;
    let operatorService: MockOperatorService;
    const update = () => {
        fixture.detectChanges();
        jasmine.clock().tick(100000);
    };
    const getElement = (css: string) => fixture.debugElement.query(By.css(css));

    beforeEach(() => {
        jasmine.clock().install();
        fixture = TestBed.configureTestingModule({
            declarations: [PermsDirective, TestComponent],
            providers: [PermsDirective, { provide: OperatorService, useClass: MockOperatorService }]
        }).createComponent(TestComponent);

        operatorService = TestBed.inject(OperatorService) as unknown as MockOperatorService;
        update();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it(`check if element gets restricted`, async () => {
        expect(getElement(`#normal`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanSee]);
        update();
        expect(getElement(`#normal`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([]);
        update();
        expect(getElement(`#normal`)).toBeFalsy();
    });

    it(`check if or condition works`, async () => {
        expect(getElement(`#or`)).toBeTruthy();
        fixture.componentInstance.setTestComponentData({ or: false });
        update();
        expect(getElement(`#or`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanSee]);
        update();
        expect(getElement(`#or`)).toBeTruthy();
        fixture.componentInstance.setTestComponentData({ or: true });
        update();
        expect(getElement(`#or`)).toBeTruthy();
    });

    it(`check if and condition works`, async () => {
        expect(getElement(`#and`)).toBeFalsy();
        fixture.componentInstance.setTestComponentData({ and: false });
        update();
        expect(getElement(`#and`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanSee]);
        update();
        expect(getElement(`#and`)).toBeFalsy();
        fixture.componentInstance.setTestComponentData({ and: true });
        update();
        expect(getElement(`#and`)).toBeTruthy();
    });

    it(`check if delegationSettingAlternative works`, async () => {
        expect(getElement(`#delegation`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanSee]);
        update();
        expect(getElement(`#delegation`)).toBeTruthy();
        operatorService.changeOperatorDelegationForTest(true);
        update();
        expect(getElement(`#delegation`)).toBeTruthy();
        operatorService.changeDelegatorSettingsForTest([`users_forbid_delegator_in_list_of_speakers`]);
        update();
        expect(getElement(`#delegation`)).toBeFalsy();
        operatorService.changeDelegatorSettingsForTest([`users_forbid_delegator_as_submitter`]);
        update();
        expect(getElement(`#delegation`)).toBeTruthy();
        operatorService.changeDelegatorSettingsForTest([`users_forbid_delegator_in_list_of_speakers`]);
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanManage]);
        update();
        expect(getElement(`#delegation`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanSee]);
        operatorService.changeOperatorDelegationForTest(false);
        update();
        expect(getElement(`#delegation`)).toBeTruthy();
    });

    it(`check if complement works`, async () => {
        expect(getElement(`#complement`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanSee]);
        update();
        expect(getElement(`#complement`)).toBeFalsy();
    });
});
