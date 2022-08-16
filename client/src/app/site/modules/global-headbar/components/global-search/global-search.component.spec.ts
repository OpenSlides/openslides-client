import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalHeadbarModule } from '../../global-headbar.module';
import { GlobalSearchComponent } from './global-search.component';

xdescribe(`GlobalSearchComponent`, () => {
    let component: GlobalSearchComponent;
    let fixture: ComponentFixture<GlobalSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GlobalHeadbarModule],
            declarations: [GlobalSearchComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(GlobalSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
