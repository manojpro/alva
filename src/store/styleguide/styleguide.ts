import { StyleguideAnalyzer } from './styleguide-analyzer';
import { TypescriptReactAnalyzer } from './typescript-react-analyzer';

const DEFAULT_ANALYZERS = [new TypescriptReactAnalyzer()];

export class Styleguide {
	private readonly analyzers: StyleguideAnalyzer[];

	public constructor(analyzers: StyleguideAnalyzer[] = DEFAULT_ANALYZERS) {
		this.analyzers = analyzers;
	}

	public load(path: string): void {
		this.analyzers.forEach(analyzer => analyzer.analyze(path));
	}
}
