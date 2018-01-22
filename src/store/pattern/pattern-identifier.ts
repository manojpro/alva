const ID_REGEX = new RegExp(/(.*)@(.*):(.*)/);

export interface PatternIdentifierData {
	readonly styleguideId: string;
	readonly analyzerId: string;
	readonly patternId: string;
}

export class PatternIdentifier implements PatternIdentifierData {
	public readonly styleguideId: string;
	public readonly analyzerId: string;
	public readonly patternId: string;
	public get globalId(): string {
		return toString(this);
	}

	public constructor(init: PatternIdentifierData) {
		this.analyzerId = init.analyzerId;
		this.patternId = init.patternId;
		this.styleguideId = init.styleguideId;
	}
}

export function parseIdentifier(id: string): PatternIdentifier | undefined {
	const matches = ID_REGEX.exec(id);

	if (!matches) {
		return;
	}

	return new PatternIdentifier({
		styleguideId: matches[1],
		analyzerId: matches[2],
		patternId: matches[3]
	});
}

export function toString(identifier: PatternIdentifierData): string {
	return `${identifier.styleguideId}@${identifier.analyzerId}:${identifier.patternId}`;
}
