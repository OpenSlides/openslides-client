import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParagraphBasedAmendmentEditorComponent } from './paragraph-based-amendment-editor.component';

describe.skip(`ParagraphBasedAmendmentEditorComponent`, () => {
    let component: ParagraphBasedAmendmentEditorComponent;
    let fixture: ComponentFixture<ParagraphBasedAmendmentEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParagraphBasedAmendmentEditorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParagraphBasedAmendmentEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
