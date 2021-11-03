import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDeleteDialogComponent } from './member-delete-dialog.component';

describe(`MemberDeleteDialogComponent`, () => {
    let component: MemberDeleteDialogComponent;
    let fixture: ComponentFixture<MemberDeleteDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MemberDeleteDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MemberDeleteDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
