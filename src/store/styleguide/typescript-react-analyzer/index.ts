import { ReactPattern, ReactPatternInit } from './react-pattern';
import { Styleguide } from '../styleguide';
import { StyleguideAnalyzer } from '../styleguide-analyzer';
import { getExports } from '../../pattern/parser/typescript-parser/ts-utils';
import * as ts from 'typescript';

import * as FileUtils from 'fs';
import * as PathUtils from 'path';

export class TypescriptReactAnalyzer extends StyleguideAnalyzer<ReactPattern> {
	private program: ts.Program;

	public analyze(styleguide: Styleguide): ReactPattern[] {
		const patterns: ReactPattern[] = [];

		const patternInfos = walkDirectoriesAndCollectPatterns(styleguide.path);

		const declarationFiles = patternInfos.map(patternInfo => patternInfo.declarationFilePath);

		this.program = ts.createProgram(declarationFiles, {}, undefined, this.program);

		patternInfos.forEach(patternInfo => {
			const sourceFile = this.program.getSourceFile(patternInfo.declarationFilePath);
			const exports = getExports(sourceFile, this.program);

			if (exports.defaultExport) {
				const pattern = new ReactPattern(styleguide, {
					...patternInfo
				});

				patterns.push(pattern);
			}

			exports.namedExports.forEach(namedExport => {
				const pattern = new ReactPattern(styleguide, {
					...patternInfo,
					exportName: namedExport.exportName
				});

				patterns.push(pattern);
			});
		});

		console.log(patterns);

		return patterns;
	}
}

function walkDirectoriesAndCollectPatterns(directory: string): ReactPatternInit[] {
	let patterns = detectPatternsInDirectory(directory);

	FileUtils.readdirSync(directory).forEach(childName => {
		const childPath = PathUtils.join(directory, childName);

		if (FileUtils.lstatSync(childPath).isDirectory()) {
			patterns = patterns.concat(walkDirectoriesAndCollectPatterns(childPath));
		}
	});

	return patterns;
}

function detectPatternsInDirectory(directory: string): ReactPatternInit[] {
	const patterns: ReactPatternInit[] = [];

	FileUtils.readdirSync(directory).forEach(childName => {
		const childPath = PathUtils.join(directory, childName);

		if (!childPath.endsWith('.d.ts')) {
			return;
		}

		const declarationFilePath = childPath;
		const name = PathUtils.basename(declarationFilePath, '.d.ts');
		const jsFilePath = PathUtils.join(directory, `${name}.js`);

		if (FileUtils.existsSync(jsFilePath)) {
			const patternFileInfo: ReactPatternInit = {
				directory,
				declarationFilePath,
				jsFilePath
			};

			patterns.push(patternFileInfo);
		}
	});

	return patterns;
}
