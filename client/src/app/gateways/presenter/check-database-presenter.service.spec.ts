import { TestBed } from '@angular/core/testing';

import { CheckDatabasePresenterService } from './check-database-presenter.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';

describe(`CheckDatabasePresenterService`, () => {
    let service: CheckDatabasePresenterService;
    let presenter: MockPresenterService;

    const okResult = {
        ok: true,
        errors: ``
    };

    const corruptResult = {
        ok: false,
        errors: `The database is so corrupt, you've got to bribe it to make it work.`
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CheckDatabasePresenterService, { provide: PresenterService, useClass: MockPresenterService }]
        });

        service = TestBed.inject(CheckDatabasePresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.CHECK_DATABASE_ALL, (data?: any) => {
            if (!data || !(typeof data === `object`) || Object.keys(data).length) {
                return { error: `data had wrong format` };
            }
            return { returnValue: corruptResult };
        });
        presenter.returnValueFns.set(Presenter.CHECK_DATABASE, (data?: any) => {
            if (
                !data ||
                !(typeof data === `object`) ||
                Object.keys(data).length > 1 ||
                (Object.keys(data).length === 1 && !Number.isInteger(data.meeting_id))
            ) {
                return { error: `data had wrong format` };
            }
            return { returnValue: okResult };
        });
    });

    it(`should correctly call check_database if all is set to false`, async () => {
        expect(await service.call()).toEqual(okResult);
        expect(await service.call(false)).toEqual(okResult);
    });

    it(`should correctly call check_database_all if all is set to true`, async () => {
        expect(await service.call(true)).toEqual(corruptResult);
    });
});
