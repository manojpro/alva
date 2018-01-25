import * as PathUtils from 'path';
import { Pattern } from '../../pattern/pattern';
import { PatternIdentifier } from '../../pattern/pattern-identifier';
import { Property } from '../../pattern/property/property';
import { getPropreties } from './property-analyzer';
import { ReactComponentExport } from './typescript/react';
import { Styleguide } from '../styleguide';
import { TypescriptReactAnalyzer } from '../typescript-react-analyzer';

export interface PatternFileInfo {
	directory: string;
	jsFilePath: string;
	declarationFilePath: string;
}

export interface PatternInit {
	baseInfo: PatternFileInfo;
	export: ReactComponentExport;
}

export class ReactPattern extends Pattern {
	public readonly iconPath?: string | undefined;
	private readonly _properties: Map<string, Property>;
	public readonly valid: boolean;
	public readonly name: string;
	public readonly id: PatternIdentifier;
	public readonly fileInfo: PatternFileInfo;
	public readonly exportInfo: ReactComponentExport;

	public get properties(): Map<string, Property> {
		return this._properties;
	}

	public constructor(
		styleguide: Styleguide,
		analyzer: TypescriptReactAnalyzer,
		fileInfo: PatternFileInfo,
		exportInfo: ReactComponentExport
	) {
		super(styleguide, analyzer);

		this.fileInfo = fileInfo;
		this.exportInfo = exportInfo;

		this.id = this.createIdentifier();
		this.name = this.getName();
		this._properties = getPropreties(this);
	}

	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}
	public toString(): string {
		return '';
	}
	public reload(): void {
		throw new Error('Method not implemented.');
	}

	private createIdentifier(): PatternIdentifier {
		const analyzer: TypescriptReactAnalyzer = this.analyzer as TypescriptReactAnalyzer;

		const baseName = PathUtils.basename(this.fileInfo.jsFilePath, '.js');
		const relativeDirectoryPath = PathUtils.relative(
			this.styleguide.path,
			this.fileInfo.directory
		);

		const baseIdentifier = PathUtils.join(relativeDirectoryPath, baseName);
		const exportIdentifier = this.exportInfo.exportName ? `@${this.exportInfo.exportName}` : '';

		const id = `${baseIdentifier}${exportIdentifier}`;

		return new PatternIdentifier({
			styleguideId: this.styleguide.id,
			analyzerId: analyzer.id,
			patternId: id
		});
	}

	private getName(): string {
		const baseName = PathUtils.basename(this.fileInfo.jsFilePath, '.js');
		const directoryName = PathUtils.basename(this.fileInfo.directory);
		const name = this.exportInfo.exportName
			? this.exportInfo.exportName
			: baseName !== 'index' ? baseName : directoryName;

		return name;
	}
}
