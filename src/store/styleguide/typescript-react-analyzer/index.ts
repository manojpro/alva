import { getReactComponentExports } from './typescript/react';
import { PatternFileInfo, ReactPattern } from './react-pattern';
import { Styleguide } from '../styleguide';
import { StyleguideAnalyzer } from '../styleguide-analyzer';
import * as ts from 'typescript';

import * as FileUtils from 'fs';
import * as PathUtils from 'path';

export class TypescriptReactAnalyzer extends StyleguideAnalyzer<ReactPattern> {
	private _program: ts.Program;
	public get program(): ts.Program {
		return this._program;
	}

	public readonly id: string = 'react';

	public analyze(styleguide: Styleguide): ReactPattern[] {
		const patterns: ReactPattern[] = [];

		const fileInfos = walkDirectoriesAndCollectPatterns(styleguide.path);

		const declarationFiles = fileInfos.map(patternInfo => patternInfo.declarationFilePath);

		this._program = ts.createProgram(declarationFiles, {}, undefined, this.program);

		fileInfos.forEach(fileInfo => {
			const sourceFile = this.program.getSourceFile(fileInfo.declarationFilePath);
			const exports = getReactComponentExports(sourceFile, this.program);

			exports.forEach(exportInfo => {
				const pattern = new ReactPattern(styleguide, this, fileInfo, exportInfo);

				patterns.push(pattern);
			});
		});

		console.log(patterns);

		return patterns;
	}
}

function walkDirectoriesAndCollectPatterns(directory: string): PatternFileInfo[] {
	let patterns = detectPatternsInDirectory(directory);

	FileUtils.readdirSync(directory).forEach(childName => {
		const childPath = PathUtils.join(directory, childName);

		if (FileUtils.lstatSync(childPath).isDirectory()) {
			patterns = patterns.concat(walkDirectoriesAndCollectPatterns(childPath));
		}
	});

	return patterns;
}

function detectPatternsInDirectory(directory: string): PatternFileInfo[] {
	const patterns: PatternFileInfo[] = [];

	FileUtils.readdirSync(directory).forEach(childName => {
		const childPath = PathUtils.join(directory, childName);

		if (!childPath.endsWith('.d.ts')) {
			return;
		}

		const declarationFilePath = childPath;
		const name = PathUtils.basename(declarationFilePath, '.d.ts');
		const jsFilePath = PathUtils.join(directory, `${name}.js`);

		if (FileUtils.existsSync(jsFilePath)) {
			const patternFileInfo: PatternFileInfo = {
				directory,
				declarationFilePath,
				jsFilePath
			};

			patterns.push(patternFileInfo);
		}
	});

	return patterns;
}
