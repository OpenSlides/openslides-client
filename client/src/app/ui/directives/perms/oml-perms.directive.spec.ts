import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { OperatorService } from 'src/app/site/services/operator.service';

import { OmlPermsDirective } from './oml-perms.directive';
import { BasePermsTestComponent } from './perms.directive.spec';

type TestConditionalType = {
    and: boolean;
    or: boolean;
    complement: boolean;
};

@Component({
    template: `
        <div id="normal" *osOmlPerms="permission"></div>
        <div id="or" *osOmlPerms="permission; or: conditionals.or"></div>
        <div id="and" *osOmlPerms="permission; and: conditionals.and"></div>
        <div id="complement" *osOmlPerms="permission; complement: conditionals.complement"></div>
        <ng-container *osOmlPerms="permission; then thenTemplate; else elseTemplate"></ng-container>
        <ng-template #thenTemplate>
            <div id="then"></div>
        </ng-template>
        <ng-template #elseTemplate>
            <div id="else"></div>
        </ng-template>
    `
})
class TestComponent extends BasePermsTestComponent<TestConditionalType> {
    public permission = OML.can_manage_organization;
    public constructor() {
        super({ and: true, or: true, complement: true });
    }
}

class MockOperatorService {
    public get operatorUpdated(): Observable<void> {
        return this._operatorUpdatedSubject;
    }

    private _operatorUpdatedSubject = new Subject<void>();
    private _permList: OML[] = [];

    public hasOrganizationPermissions(...checkPerms: OML[]): boolean {
        return checkPerms.some(perm => this._permList.includes(perm));
    }

    public changeOperatorPermsForTest(newPermList: OML[]): void {
        this._permList = newPermList;
        this._operatorUpdatedSubject.next();
    }
}

describe(`OmlPermsDirective`, () => {
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
            declarations: [OmlPermsDirective, TestComponent],
            providers: [OmlPermsDirective, { provide: OperatorService, useClass: MockOperatorService }]
        }).createComponent(TestComponent);

        operatorService = TestBed.inject(OperatorService) as unknown as MockOperatorService;
        update();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it(`check if element gets restricted`, async () => {
        expect(getElement(`#normal`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([OML.can_manage_organization]);
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
        operatorService.changeOperatorPermsForTest([OML.can_manage_organization]);
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
        operatorService.changeOperatorPermsForTest([OML.can_manage_organization]);
        update();
        expect(getElement(`#and`)).toBeFalsy();
        fixture.componentInstance.setTestComponentData({ and: true });
        update();
        expect(getElement(`#and`)).toBeTruthy();
    });

    it(`check if complement works`, async () => {
        expect(getElement(`#complement`)).toBeTruthy();
        operatorService.changeOperatorPermsForTest([OML.can_manage_organization]);
        update();
        expect(getElement(`#complement`)).toBeFalsy();
    });

    it(`check if then and else work`, async () => {
        expect(getElement(`#else`)).toBeTruthy();
        expect(getElement(`#then`)).toBeFalsy();
        operatorService.changeOperatorPermsForTest([OML.can_manage_organization]);
        update();
        expect(getElement(`#else`)).toBeFalsy();
        expect(getElement(`#then`)).toBeTruthy();
    });
});
