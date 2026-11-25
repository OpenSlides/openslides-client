import { availableTranslations } from '@app/domain/definitions/languages';

const PROJECTOR_LANGUAGE_STORAGE_PREFIX = `projectorLanguage:`;
const PROJECTOR_LANGUAGE_QUERY_PARAM = `projectorLanguage`;

export class ProjectorLanguageService {
    public readonly availableLanguages = availableTranslations;

    public getLanguage(projectorId: number, fallbackLanguage: string): string {
        const queryLanguage = new URLSearchParams(window.location.search).get(PROJECTOR_LANGUAGE_QUERY_PARAM);
        if (queryLanguage && this.isAvailableLanguage(queryLanguage)) {
            return queryLanguage;
        }

        const storedLanguage = localStorage.getItem(this.getStorageKey(projectorId));
        if (storedLanguage && this.isAvailableLanguage(storedLanguage)) {
            return storedLanguage;
        }

        return this.isAvailableLanguage(fallbackLanguage) ? fallbackLanguage : `en`;
    }

    public setLanguage(projectorId: number, language: string): void {
        if (!this.isAvailableLanguage(language)) {
            throw new Error(`Unsupported projector language: ${language}`);
        }

        localStorage.setItem(this.getStorageKey(projectorId), language);
    }

    private isAvailableLanguage(language: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.availableLanguages, language);
    }

    private getStorageKey(projectorId: number): string {
        return `${PROJECTOR_LANGUAGE_STORAGE_PREFIX}${projectorId}`;
    }
}
