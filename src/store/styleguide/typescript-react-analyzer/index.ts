import { Pattern } from '../../pattern/pattern';
import { StyleguideAnalyzer } from '../styleguide-analyzer';
import { getExports, ExportsInfo } from '../../pattern/parser/typescript-parser/ts-utils';
import * as ts from 'typescript';

import * as FileUtils from 'fs';
import * as PathUtils from 'path';

interface PatternFileInfo {
	directory: string;
	name: string;
	jsFilePath: string;
	declarationFilePath: string;
}

export class TypescriptReactAnalyzer extends StyleguideAnalyzer {
	private program: ts.Program;

	public analyze(path: string): Pattern[] {
		const patternInfos = walkDirectoriesAndCollectPatterns(path);
		console.log(patternInfos);

		const declarationFiles = patternInfos.map(patternInfo => patternInfo.declarationFilePath);

		if (!this.program) {
			this.program = ts.createProgram(declarationFiles, {}, undefined, this.program);
		}

		let cumulativeExports: ExportsInfo[] = [];

		patternInfos.forEach(patternInfo => {
			const sourceFile = this.program.getSourceFile(patternInfo.declarationFilePath);
			const exports = getExports(sourceFile, this.program);

			cumulativeExports = cumulativeExports.concat(exports);
		});

		console.log(cumulativeExports);

		throw new Error('Method not implemented.');
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
				name,
				declarationFilePath,
				jsFilePath
			};

			patterns.push(patternFileInfo);
		}
	});

	return patterns;
}
