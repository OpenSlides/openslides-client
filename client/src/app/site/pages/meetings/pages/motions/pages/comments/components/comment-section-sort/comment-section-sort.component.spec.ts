import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentSectionSortComponent } from './comment-section-sort.component';

xdescribe(`CommentSectionSortComponent`, () => {
    let component: CommentSectionSortComponent;
    let fixture: ComponentFixture<CommentSectionSortComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommentSectionSortComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentSectionSortComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
