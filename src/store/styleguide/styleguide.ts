import { StyleguideAnalyzer } from './styleguide-analyzer';
import { TypescriptReactAnalyzer } from './typescript-react-analyzer';

const DEFAULT_ANALYZERS = [new TypescriptReactAnalyzer()];

export class Styleguide {
	private readonly analyzers: StyleguideAnalyzer[];
	public readonly id: string;
	public readonly path: string;

	public constructor(
		id: string,
		path: string,
		analyzers: StyleguideAnalyzer[] = DEFAULT_ANALYZERS
	) {
		this.analyzers = analyzers;
		this.id = id;
		this.path = path;
	}

	public load(): void {
		this.analyzers.forEach(analyzer => analyzer.analyze(this));
	}
}
