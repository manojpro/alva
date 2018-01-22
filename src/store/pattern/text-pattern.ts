import { Pattern } from './pattern';
import { Property } from './property/property';
import { StringProperty } from './property/string-property';
import { Styleguide } from '../styleguide/styleguide';
import { StyleguideAnalyzer } from '../styleguide/styleguide-analyzer';

/**
 * A pseudo-pattern representing text-node content of another pattern's children property.
 * The text pattern is not parsed by pattern parsers, but automatically generated.
 * It always contains one string property named "text".
 */
export class TextPattern implements Pattern {
	public readonly styleguide?: Styleguide | undefined;
	public readonly analyzer?: StyleguideAnalyzer | undefined;
	public readonly id: string = 'text';
	// TODO: let baseclass handle global id generation;
	public readonly globalId: string = 'synthetic:text';
	public readonly iconPath?: string | undefined;
	public readonly name: string = 'Text';
	public readonly properties: Map<string, Property>;
	public readonly valid: boolean = true;

	public constructor() {
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
