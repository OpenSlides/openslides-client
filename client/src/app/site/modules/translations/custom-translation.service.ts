import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CustomTranslation = Record<string, string>;

@Injectable({
    providedIn: `root`
})
export class CustomTranslationService {
    public readonly customTranslationSubject = new BehaviorSubject<CustomTranslation>({});
}
