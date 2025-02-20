import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaUploadContentComponent } from './media-upload-content.component';

xdescribe(`MediaUploadContentComponent`, () => {
    let component: MediaUploadContentComponent;
    let fixture: ComponentFixture<MediaUploadContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MediaUploadContentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MediaUploadContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
