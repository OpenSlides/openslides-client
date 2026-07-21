import { Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CustomTranslation = Record<string, string>;

@Service()
export class CustomTranslationService {
    public readonly customTranslationSubject = new BehaviorSubject<CustomTranslation>({});
}
