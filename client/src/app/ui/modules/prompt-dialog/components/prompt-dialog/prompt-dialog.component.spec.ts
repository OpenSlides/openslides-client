import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptDialogComponent } from './prompt-dialog.component';

xdescribe(`PromptDialogComponent`, () => {
    let component: PromptDialogComponent;
    let fixture: ComponentFixture<PromptDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PromptDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PromptDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
