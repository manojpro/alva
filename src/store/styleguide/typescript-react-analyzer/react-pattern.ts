import * as PathUtils from 'path';
import { Pattern } from '../../pattern/pattern';
import { Property } from '../../pattern/property/property';
import { getPropreties } from './property-analyzer';
import { Styleguide } from '../styleguide';
import { Export } from './ts-utils';
import { TypescriptReactAnalyzer } from '../typescript-react-analyzer';

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
	public readonly iconPath?: string | undefined;
	public readonly properties: Map<string, Property>;
	public readonly valid: boolean;
	public readonly name: string;
	public readonly id: string;
	public readonly init: PatternInit;
	public readonly analyzer: TypescriptReactAnalyzer | undefined;
	public readonly styleguide: Styleguide;
	public readonly baseIdentifier: string;
	// TODO: let baseclass handle global id generation;
	public get globalId(): string {
		return `${this.styleguide.id}:${this.id}`;
	}

	public constructor(
		styleguide: Styleguide,
		analyzer: TypescriptReactAnalyzer,
		init: PatternInit
	) {
		this.analyzer = analyzer;
		this.styleguide = styleguide;
		this.init = init;

		const baseName = PathUtils.basename(this.init.baseInfo.jsFilePath, '.js');
		const relativeDirectoryPath = PathUtils.relative(
			this.styleguide.path,
			this.init.baseInfo.directory
		);

		this.baseIdentifier = PathUtils.join(relativeDirectoryPath, baseName);
		const exportIdentifier = this.init.export.exportName ? `@${this.init.export.exportName}` : '';

		const id = `${this.baseIdentifier}${exportIdentifier}`;
		this.id = id;

		const directoryName = PathUtils.basename(this.init.baseInfo.directory);
		const name = this.init.export.exportName
			? this.init.export.exportName
			: baseName !== 'index' ? baseName : directoryName;
		this.name = name;

		this.properties = getPropreties(this);
	}

	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}
	public toString(): string {
		throw new Error('Method not implemented.');
	}
	public reload(): void {
		throw new Error('Method not implemented.');
	}
}
