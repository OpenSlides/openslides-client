import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceDialogComponent } from './choice-dialog.component';

xdescribe(`ChoiceDialogComponent`, () => {
    let component: ChoiceDialogComponent;
    let fixture: ComponentFixture<ChoiceDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChoiceDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChoiceDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
