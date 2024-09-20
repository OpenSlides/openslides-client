import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParagraphBasedAmendmentComponent } from './paragraph-based-amendment.component';

xdescribe(`ParagraphBasedAmendmentComponent`, () => {
    let component: ParagraphBasedAmendmentComponent;
    let fixture: ComponentFixture<ParagraphBasedAmendmentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParagraphBasedAmendmentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParagraphBasedAmendmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
