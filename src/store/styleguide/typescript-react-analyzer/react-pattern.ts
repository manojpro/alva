import * as PathUtils from 'path';
import { Pattern } from '../../pattern/pattern';
import { PatternIdentifier } from '../../pattern/pattern-identifier';
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

export class ReactPattern extends Pattern {
	public readonly iconPath?: string | undefined;
	public readonly properties: Map<string, Property>;
	public readonly valid: boolean;
	public readonly name: string;
	public readonly id: PatternIdentifier;
	public readonly init: PatternInit;

	public constructor(
		styleguide: Styleguide,
		analyzer: TypescriptReactAnalyzer,
		init: PatternInit
	) {
		super(styleguide, analyzer);
		this.init = init;
		this.id = this.createIdentifier();
		this.name = this.getName();

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

	private createIdentifier(): PatternIdentifier {
		const analyzer: TypescriptReactAnalyzer = this.analyzer as TypescriptReactAnalyzer;

		const baseName = PathUtils.basename(this.init.baseInfo.jsFilePath, '.js');
		const relativeDirectoryPath = PathUtils.relative(
			this.styleguide.path,
			this.init.baseInfo.directory
		);

		const baseIdentifier = PathUtils.join(relativeDirectoryPath, baseName);
		const exportIdentifier = this.init.export.exportName ? `@${this.init.export.exportName}` : '';

		const id = `${baseIdentifier}${exportIdentifier}`;

		return new PatternIdentifier({
			styleguideId: this.styleguide.id,
			analyzerId: analyzer.id,
			patternId: id
		});
	}

	private getName(): string {
		const baseName = PathUtils.basename(this.init.baseInfo.jsFilePath, '.js');
		const directoryName = PathUtils.basename(this.init.baseInfo.directory);
		const name = this.init.export.exportName
			? this.init.export.exportName
			: baseName !== 'index' ? baseName : directoryName;

		return name;
	}
}
