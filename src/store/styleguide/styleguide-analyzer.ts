import { Pattern } from '../pattern/pattern';
import { Styleguide } from './styleguide';

export abstract class StyleguideAnalyzer<T extends Pattern = Pattern> {
	public abstract analyze(styleguide: Styleguide): T[];
}
