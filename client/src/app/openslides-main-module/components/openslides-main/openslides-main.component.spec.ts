import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSlidesMainModule } from '../../openslides-main.module';
import { OpenSlidesMainRoutingModule } from '../../openslides-main-routing.module';
import { OpenSlidesMainComponent } from './openslides-main.component';

xdescribe(`OpenslidesMainComponent`, () => {
    let component: OpenSlidesMainComponent;
    let fixture: ComponentFixture<OpenSlidesMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OpenSlidesMainModule, OpenSlidesMainRoutingModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OpenSlidesMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
