import { Pattern } from '../pattern/pattern';

export abstract class StyleguideAnalyzer {
	public abstract analyze(path: string): Pattern[];
}
