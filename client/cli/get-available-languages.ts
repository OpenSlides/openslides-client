/**
 * Helper script to print a comma-separated list of all available translations.
 */
import { availableTranslations } from "src/app/domain/definitions/languages";

console.log(Object.keys(availableTranslations).join(`,`));
