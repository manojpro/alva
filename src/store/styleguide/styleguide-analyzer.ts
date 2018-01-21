import { Pattern } from './pattern';
import { Styleguide } from './styleguide';

export abstract class StyleguideAnalyzer<T extends Pattern = Pattern> {
	public abstract analyze(styleguide: Styleguide): T[];
}
