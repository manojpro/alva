import * as ts from 'typescript';

const WellKnownReactComponentTypes = ['Component', 'StatelessComponent', 'ComponentClass'];

export function getExports(fileName: string): ExportsInfo {
	const exports: ExportsInfo = {
		namedExports: [],
		defaultExport: undefined
	};

	fileName += '/index.d.ts';

	const program = ts.createProgram([fileName], {});
	const sourceFile = program.getSourceFile(fileName);

	const exportStatements = getExportStatements(sourceFile);

	exportStatements.forEach(statement => {
		const exportInfo = getExportInfo(program, statement, type => isReactType(program, type));

		if (!exportInfo) {
			return;
		}

		if (!exportInfo.exportType.resolutionAborted) {
			return;
		}

		if (isNamedExport(exportInfo)) {
			exports.namedExports.push(exportInfo);
			return;
		}

		exports.defaultExport = exportInfo;
	});

	return exports;
}

export function getExportInfo(
	program: ts.Program,
	statement: ts.Statement,
	resolveBaseTypesUntil?: (type: ts.Type) => boolean
): Export | NamedExport | undefined {
	const typechecker = program.getTypeChecker();

	if (ts.isVariableStatement(statement)) {
		for (const declaration of statement.declarationList.declarations) {
			if (!declaration.type) {
				continue;
			}

			const exportName = declaration.name.getText();
			const type = typechecker.getTypeAtLocation(declaration.type);
			const exportType = getTypeInheritanceTree(program, type, resolveBaseTypesUntil);

			return {
				exportName,
				exportType
			};
		}
	}

	if (ts.isClassDeclaration(statement)) {
		if (!statement.name) {
			return;
		}

		const exportName = statement.name.text;
		const type = typechecker.getTypeAtLocation(statement);
		const exportType = getTypeInheritanceTree(program, type, resolveBaseTypesUntil);

		return {
			exportName,
			exportType
		};
	}

	if (ts.isExportAssignment(statement)) {
		const expression = statement.expression;
		const declaration = findDeclaration(expression);

		if (declaration) {
			const type = typechecker.getTypeAtLocation(declaration);
			const exportType = getTypeInheritanceTree(program, type, resolveBaseTypesUntil);

			return {
				exportType
			};
		}
	}

	return;
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
	program: ts.Program,
	type: ts.Type,
	until?: (type: ts.Type) => boolean
): TypeInheritanceTree {
	const typechecker = program.getTypeChecker();

	const retVal: TypeInheritanceTree = {
		baseTypes: [],
		type,
		typeName: undefined,
		resolutionAborted: false
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

	if (until && until(realType)) {
		retVal.resolutionAborted = true;
		return retVal;
	}

	const baseTypes = realType.getBaseTypes();

	if (!baseTypes) {
		return retVal;
	}

	const baseTypeTrees = baseTypes.map(baseType =>
		getTypeInheritanceTree(program, baseType, until)
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

export function getExportStatements(sourceFile: ts.SourceFile): ts.Statement[] {
	const exports: ts.Statement[] = [];

	sourceFile.statements.forEach(child => {
		if (isExport(child)) {
			exports.push(child);
		}
	});

	return exports;
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

export function isNamedExport(exportInfo: Export): exportInfo is NamedExport {
	return (exportInfo as NamedExport).exportName ? true : false;
}

export function isReactType(program: ts.Program, type: ts.Type): boolean {
	if (!(type.symbol && type.symbol.declarations)) {
		return false;
	}

	const symbol = type.symbol;
	const declarations = type.symbol.declarations;

	const isWellKnownType = WellKnownReactComponentTypes.some(
		wellKnownReactComponentType => symbol.name === wellKnownReactComponentType
	);

	if (!isWellKnownType) {
		return false;
	}

	for (const declaration of declarations) {
		const sourceFile = declaration.getSourceFile();
		return sourceFile.fileName.includes('react/index.d.ts');
	}

	return false;
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
	resolutionAborted: boolean;
}

export interface Export {
	exportType: TypeInheritanceTree;
}

export interface NamedExport extends Export {
	exportName: string;
}

export interface ExportsInfo {
	namedExports: NamedExport[];
	defaultExport?: Export;
}
