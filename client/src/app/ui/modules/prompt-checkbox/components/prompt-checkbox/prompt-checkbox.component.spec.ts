import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptCheckboxComponent } from './prompt-checkbox.component';

xdescribe(`PromptDialogComponent`, () => {
    let component: PromptCheckboxComponent;
    let fixture: ComponentFixture<PromptCheckboxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PromptCheckboxComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PromptCheckboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
