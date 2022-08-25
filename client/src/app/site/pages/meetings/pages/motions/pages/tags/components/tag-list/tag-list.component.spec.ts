import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagListComponent } from './tag-list.component';

xdescribe(`TagListComponent`, () => {
    let component: TagListComponent;
    let fixture: ComponentFixture<TagListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TagListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TagListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
