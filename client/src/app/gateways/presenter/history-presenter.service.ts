import { Injectable } from '@angular/core';
import { Collection, Fqid, Id } from 'src/app/domain/definitions/key-types';
import { HttpService } from 'src/app/gateways/http.service';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';

interface InformationObject {
    [fqid: string]: string[];
}

export class Position {
    public position: number;
    public timestamp: number;
    public information: InformationObject;
    public user_id: Id;
    public fqid: Fqid;

    public constructor(input?: Partial<Position>) {
        if (input) {
            Object.assign(this, input);
        }
    }
}

export class HistoryPosition extends Position {
    public user: string;

    public get date(): Date {
        return new Date(this.timestamp * 1000);
    }

    private get _collection(): Collection {
        return collectionFromFqid(this.fqid);
    }

    public constructor(input?: Partial<HistoryPosition>) {
        super(input);
        if (input) {
            Object.assign(this, input);
        }
    }

    /**
     * Converts the date (this.now) to a time and date string.
     *
     * @param locale locale indicator, i.e 'de-DE'
     * @returns a human readable kind of time and date representation
     */
    public getLocaleString(locale: string): string {
        return this.date.toLocaleString(locale);
    }

    public getPositionDescriptions(): string[] {
        const information = this.information[this.fqid];
        return information.map(entry => entry.replace(`Object`, this._collection));
    }
}

interface HistoryPresenterResponse {
    [fqid: string]: Position[];
}

const HISTORY_ENDPOINT = `/system/autoupdate/history_information`;

const getUniqueItems = (positions: Position[]) => {
    const positionMap: { [positionNumber: number]: Position } = {};
    for (const position of positions) {
        positionMap[position.position] = position;
    }
    return Object.values(positionMap);
};

@Injectable({
    providedIn: 'root'
})
export class HistoryPresenterService {
    public constructor(private http: HttpService, private userRepo: UserRepositoryService) {}

    public async call(fqid: Fqid): Promise<HistoryPosition[]> {
        const response = await this.http.post<HistoryPresenterResponse>(HISTORY_ENDPOINT, undefined, { fqid });
        return Object.values(response)
            .flatMap(positions => getUniqueItems(positions))
            .sort((positionA, positionB) => positionB.timestamp - positionA.timestamp)
            .map(position => {
                return new HistoryPosition({
                    ...position,
                    fqid,
                    user: this.userRepo.getViewModel(position.user_id)?.getFullName()
                });
            });
    }
}
