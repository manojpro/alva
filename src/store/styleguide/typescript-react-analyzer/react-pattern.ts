import * as PathUtils from 'path';
import { Pattern } from '../pattern';
import { Styleguide } from '../styleguide';

const REACT_PATTERN_TYPE = 'react';

export interface ReactPatternInit {
	directory: string;
	jsFilePath: string;
	declarationFilePath: string;
	exportName?: string;
}

export class ReactPattern implements Pattern {
	public readonly displayName: string;
	public readonly id: string;
	public get styleguideId(): string {
		return this.styleguide.id;
	}
	public get type(): string {
		return REACT_PATTERN_TYPE;
	}
	private readonly init: ReactPatternInit;
	private readonly styleguide: Styleguide;

	public constructor(styleguide: Styleguide, init: ReactPatternInit) {
		this.styleguide = styleguide;
		this.init = init;

		const baseName = PathUtils.basename(this.init.jsFilePath, '.js');
		const relativeDirectoryPath = PathUtils.relative(this.styleguide.path, this.init.directory);

		const baseIdentifier = PathUtils.join(relativeDirectoryPath, baseName);
		const exportIdentifier = this.init.exportName ? `@${this.init.exportName}` : '';

		const id = `${baseIdentifier}${exportIdentifier}`;
		this.id = id;

		const directoryName = PathUtils.basename(this.init.directory);
		const displayName = this.init.exportName
			? this.init.exportName
			: baseName !== 'index' ? baseName : directoryName;
		this.displayName = displayName;
	}
}
