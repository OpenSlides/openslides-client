import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from 'e2e-imports.module';

import { SearchRepoSelectorComponent } from './search-repo-selector.component';

describe('SearchRepoSelectorComponent', () => {
    let component: SearchRepoSelectorComponent;
    let fixture: ComponentFixture<SearchRepoSelectorComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [SearchRepoSelectorComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchRepoSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
