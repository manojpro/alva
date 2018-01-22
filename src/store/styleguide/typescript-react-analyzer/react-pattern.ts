import * as PathUtils from 'path';
import { Pattern } from '../pattern';
import { Styleguide } from '../styleguide';
import { Export } from '../../pattern/parser/typescript-parser/ts-utils';

const REACT_PATTERN_TYPE = 'react';

export interface PatternBaseInfo {
	directory: string;
	jsFilePath: string;
	declarationFilePath: string;
}

export interface PatternInit {
	baseInfo: PatternBaseInfo;
	export: Export;
}

export class ReactPattern implements Pattern {
	public readonly displayName: string;
	public readonly id: string;
	public get styleguideId(): string {
		return this.styleguide.id;
	}
	public get analyzerId(): string {
		return REACT_PATTERN_TYPE;
	}
	private readonly init: PatternInit;
	private readonly styleguide: Styleguide;

	public constructor(styleguide: Styleguide, init: PatternInit) {
		this.styleguide = styleguide;
		this.init = init;

		const baseName = PathUtils.basename(this.init.baseInfo.jsFilePath, '.js');
		const relativeDirectoryPath = PathUtils.relative(
			this.styleguide.path,
			this.init.baseInfo.directory
		);

		const baseIdentifier = PathUtils.join(relativeDirectoryPath, baseName);
		const exportIdentifier = this.init.export.exportName ? `@${this.init.export.exportName}` : '';

		const id = `${baseIdentifier}${exportIdentifier}`;
		this.id = id;

		const directoryName = PathUtils.basename(this.init.baseInfo.directory);
		const displayName = this.init.export.exportName
			? this.init.export.exportName
			: baseName !== 'index' ? baseName : directoryName;
		this.displayName = displayName;
	}
}
