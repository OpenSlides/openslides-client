import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentSectionListComponent } from './comment-section-list.component';

xdescribe(`CommentSectionListComponent`, () => {
    let component: CommentSectionListComponent;
    let fixture: ComponentFixture<CommentSectionListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommentSectionListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentSectionListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
