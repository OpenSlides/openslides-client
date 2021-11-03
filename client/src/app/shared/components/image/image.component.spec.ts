import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { ImageComponent } from './image.component';

describe(`ResourceComponent`, () => {
    let component: ImageComponent;
    let fixture: ComponentFixture<ImageComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [ImageComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
