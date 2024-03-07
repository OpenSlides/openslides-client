import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { OperatorService } from 'src/app/site/services/operator.service';

import { PermsDirective } from './perms.directive';

type TestConditionalType = {
    and: boolean;
    or: boolean;
    complement: boolean;
};

@Component({
    template: `
        <div id="normal" *osPerms="permission"></div>
        <div id="or" *osPerms="permission; or: conditionals.or"></div>
        <div id="and" *osPerms="permission; and: conditionals.and"></div>
        <div id="complement" *osPerms="permission; complement: conditionals.complement"></div>
    `
})
class TestComponent {
    public readonly permission = Permission.listOfSpeakersCanSee;
    public conditionals: TestConditionalType = { and: true, or: true, complement: true };

    public setTestComponentData(conditionals: { and?: boolean; or?: boolean; complement?: boolean }): void {
        for (const key in Object.keys(this.conditionals)) {
            conditionals[key] = conditionals[key] ?? this.conditionals[key];
        }
        this.conditionals = conditionals as TestConditionalType;
    }
}

class MockOperatorService {
    public get operatorUpdated(): Observable<void> {
        return this._operatorUpdatedSubject;
    }

    private _operatorUpdatedSubject = new Subject<void>();
    private _permList: Permission[] = [];

    public hasPerms(...checkPerms: Permission[]): boolean {
        return checkPerms.some(perm => this._permList.includes(perm));
    }

    public changeOperatorPermsForTest(newPermList: Permission[]): void {
        this._permList = newPermList;
        this._operatorUpdatedSubject.next();
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

    it(`check if complement works`, async () => {
        expect(getElement(`#complement`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([Permission.listOfSpeakersCanSee]);
        update();
        expect(getElement(`#complement`)).toBeFalsy();
    });
});
