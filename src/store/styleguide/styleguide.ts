import { Pattern } from '../pattern/pattern';
import { StyleguideAnalyzer } from './styleguide-analyzer';
import { TypescriptReactAnalyzer } from './typescript-react-analyzer';

const DEFAULT_ANALYZERS = [new TypescriptReactAnalyzer()];

export class Styleguide {
	private readonly analyzers: StyleguideAnalyzer[];
	public readonly id: string;
	public readonly path: string;
	public patterns: Pattern[] = [];

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
		this.patterns = [];

		this.analyzers.forEach(analyzer => {
			const patterns = analyzer.analyze(this);
			this.patterns = this.patterns.concat(patterns);
		});
	}

	public findPattern(id: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.id === id);
	}

	/**
	 * Returns all pattern of this folder and its sub-folders matching a given search string.
	 * @param term The search string as provided by the user.
	 * @return The list of matching patterns.
	 */
	public searchPatterns(term: string): Pattern[] {
		const result: Pattern[] = [];
		this.patterns.forEach(pattern => {
			if (patternMatchesSearch(pattern, term)) {
				result.push(pattern);
			}
		});

		return result;
	}
}

function patternMatchesSearch(pattern: Pattern, term: string): boolean {
	if (!term || !pattern.name) {
		return false;
	}
	return pattern.name.toLowerCase().indexOf(term.toLowerCase()) >= 0;
}
