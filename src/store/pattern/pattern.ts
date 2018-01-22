import { Property } from './property/property';
import { Styleguide } from '../styleguide/styleguide';
import { StyleguideAnalyzer } from '../styleguide/styleguide-analyzer';

/**
 * A pattern represents a reusable, styled component (e.g. a React component) of the styleguide.
 * Patterns are parsed from the lib folder of the styleguide, supporting a set of properties
 * of various types, like strings, numbers, page elements, etc.
 * The designer then creates page elements within a page using these patterns as a basis.
 * Patterns may be structured into folders (like 'atoms', 'modules', etc.).
 * Depending on the pattern parser used, various styleguide formats are supported,
 * e.g. Patternplate.
 */
export interface Pattern {
	readonly styleguide?: Styleguide;
	readonly analyzer?: StyleguideAnalyzer;
	readonly globalId: string;
	/**
	 * The ID of the pattern (also the folder name within the parent folder).
	 */
	readonly id: string;

	/**
	 * The absolute path to the icon of the pattern, if provided by the implementation.
	 */
	readonly iconPath?: string;

	/**
	 * The human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 */
	readonly name: string;

	/**
	 * The properties this pattern supports.
	 */
	readonly properties: Map<string, Property>;

	/**
	 * This is a valid pattern for Alva (has been parsed successfully).
	 */
	readonly valid: boolean;

	/**
	 * Returns a property this pattern supports, by its ID.
	 * @param id The ID of the property.
	 * @return The property for the given ID, if it exists.
	 */
	getProperty(id: string): Property | undefined;

	/**
	 * Returns a string representation of this pattern.
	 * @return The string representation.
	 */
	toString(): string;

	/**
	 * Loads (or reloads) this pattern from its implemetation.
	 * This methods delegates to all registered pattern parsers to read all meta-information
	 * provided, parsing name, ID, properties, etc. of the pattern.
	 * All parsers may contribute to the final pattern information.
	 */
	reload(): void;
}
