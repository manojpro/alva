import { Pattern } from './pattern';
import { PatternIdentifier } from './pattern-identifier';
import { Property } from './property/property';
import { StringProperty } from './property/string-property';
import { Styleguide } from '../styleguide/styleguide';

/**
 * A pseudo-pattern representing text-node content of another pattern's children property.
 * The text pattern is not parsed by pattern parsers, but automatically generated.
 * It always contains one string property named "text".
 */
export class TextPattern extends Pattern {
	public readonly id: PatternIdentifier;
	public readonly iconPath?: string | undefined;
	public readonly name: string = 'Text';
	public readonly properties: Map<string, Property>;
	public readonly valid: boolean = true;

	public constructor(styleguide: Styleguide) {
		super(styleguide);
		this.id = new PatternIdentifier({
			analyzerId: '',
			styleguideId: styleguide.id,
			patternId: 'text'
		});

		const property: Property = new StringProperty('text');
		property.setName('Text');

		this.properties = new Map([[property.getId(), property]]);
	}

	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}
	public toString(): string {
		return this.name;
	}

	/**
	 * @inheritdoc
	 */
	public reload(): void {
		// Do nothing, this is a synthetic pattern
	}
}
