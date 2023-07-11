import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { ActionService } from './action.service';

xdescribe(`Service: Action`, () => {
    let service: ActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(ActionService);
    });

    it(`method: `, () => {
        expect(service).toBeTruthy();
    });

    it(`method: `, () => {
        expect(service).toBeTruthy();
    });

    it(`method: `, () => {
        expect(service).toBeTruthy();
    });
});
