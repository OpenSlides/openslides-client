import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { MediafileSlideComponent } from './mediafile-slide.component';

xdescribe(`MediafileSlideComponent`, () => {
    let component: MediafileSlideComponent;
    let fixture: ComponentFixture<MediafileSlideComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [PdfViewerModule],
            declarations: [MediafileSlideComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MediafileSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
