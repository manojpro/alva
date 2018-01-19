import * as FileUtils from 'fs';
import * as ts from 'typescript';

export function analyzeFile(fileName: string): void {
	fileName += '/index.d.ts';
	fileName =
		'/Users/waljul/Workspace/myaudi/packages/myaudi-components/lib/patterns/button/index.d.ts';

	const tsConfigFile = '/Users/waljul/Workspace/myaudi/packages/myaudi-components/tsconfig.json';
	const compilerOptions = JSON.parse(FileUtils.readFileSync(tsConfigFile).toString())
		.compilerOptions;

	const program = ts.createProgram([fileName], compilerOptions);
	const typechecker = program.getTypeChecker();
	const sourceFile = program.getSourceFile(fileName);

	const reactImport = findImport(sourceFile, 'react');

	if (reactImport && reactImport.importClause) {
		console.log(reactImport.importClause.getText());
	}

	const exports = getExports(sourceFile);
	exports.forEach(node => {
		let exportName = 'unknown';
		let exportType: TypeInheritanceTree | undefined;

		if (ts.isVariableStatement(node)) {
			node.declarationList.declarations.some(declaration => {
				if (!declaration.type) {
					return false;
				}

				exportName = declaration.name.getText();
				const type = typechecker.getTypeAtLocation(declaration.type);
				exportType = getTypeInheritanceTree(typechecker, type);

				return true;
			});
		}

		if (ts.isClassDeclaration(node)) {
			if (node.name) {
				exportName = node.name.text;
			}

			const type = typechecker.getTypeAtLocation(node);
			exportType = getTypeInheritanceTree(typechecker, type);
		}

		if (ts.isExportAssignment(node)) {
			exportName = 'default';

			const expression = node.expression;
			const declaration = findDeclaration(expression);

			if (declaration) {
				const type = typechecker.getTypeAtLocation(declaration);
				exportType = getTypeInheritanceTree(typechecker, type);
			}
		}

		const statementText = node.getText();

		console.log(statementText);
		console.log('-- name: ', exportName);
		console.log('-- type: ', exportType);
		console.log(`
		====================================
		`);
	});
}

export function findDeclaration(expression: ts.Expression): ts.Declaration | undefined {
	const sourceFile = expression.getSourceFile();

	for (const statement of sourceFile.statements) {
		if (ts.isVariableStatement(statement)) {
			for (const variableDeclaration of statement.declarationList.declarations) {
				if (variableDeclaration.name.getText() === expression.getText()) {
					return variableDeclaration;
				}
			}
		}
	}

	return;
}

export function getTypeInheritanceTree(
	typechecker: ts.TypeChecker,
	type: ts.Type,
	until?: ts.Type
): TypeInheritanceTree {
	const retVal: TypeInheritanceTree = {
		baseTypes: [],
		type,
		typeName: undefined
	};

	const symbol = type.symbol;

	if (!symbol) {
		return retVal;
	}

	retVal.typeName = symbol.name;

	const typeDeclaration = symbol.declarations && symbol.declarations[0];

	if (!typeDeclaration) {
		return retVal;
	}

	const realType = typechecker.getTypeAtLocation(typeDeclaration);
	const baseTypes = realType.getBaseTypes();

	if (!baseTypes) {
		return retVal;
	}

	const baseTypeTrees = baseTypes.map(baseType =>
		getTypeInheritanceTree(typechecker, baseType, until)
	);
	retVal.baseTypes = baseTypeTrees;

	return retVal;
}

export function findImport(
	sourceFile: ts.SourceFile,
	moduleSpecifier: string
): ts.ImportDeclaration | undefined {
	for (const statement of sourceFile.statements) {
		if (ts.isImportDeclaration(statement)) {
			if (!ts.isStringLiteral(statement.moduleSpecifier)) {
				continue;
			}

			const moduleSpecifierText = statement.moduleSpecifier.text;

			if (moduleSpecifierText === moduleSpecifier) {
				return statement;
			}
		}
	}

	return undefined;
}

export function getExports(sourceFile: ts.SourceFile): ts.Statement[] {
	const exports: ts.Statement[] = [];

	sourceFile.statements.forEach(child => {
		if (isExport(child)) {
			exports.push(child);
		}
	});

	return exports;
}

export function isDescendant(
	typechecker: ts.TypeChecker,
	type: ts.Type,
	ancestor: ts.Type
): boolean {
	return true;
}

export function isExport(node: ts.Node): boolean {
	if (ts.isExportAssignment(node) || ts.isExportDeclaration(node) || ts.isExportSpecifier(node)) {
		return true;
	}

	if (!node.modifiers) {
		return false;
	}

	const modifiers = ts.getCombinedModifierFlags(node);
	if ((modifiers & ts.ModifierFlags.Export) === ts.ModifierFlags.Export) {
		return true;
	}

	return false;
}

export function getExportName(node: ts.Node, isRoot: boolean = true): string | undefined {
	let exportName: string | undefined;

	if (node.kind === ts.SyntaxKind.Identifier) {
		return node.getText();
	}

	for (const child of node.getChildren()) {
		exportName = getExportName(child, false);

		if (exportName) {
			return exportName;
		}
	}

	return undefined;
}

export function getAst(node: ts.Node): TypeScriptAst {
	return {
		node,
		text: node.getText(),
		kind: node.kind,
		children: node.getChildren().map(getAst)
	};
}

export interface TypeScriptAst {
	text: string;
	node: ts.Node;
	kind: number;
	children: TypeScriptAst[];
}

export interface TypeInheritanceTree {
	type: ts.Type;
	typeName?: string;
	baseTypes: TypeInheritanceTree[];
}
