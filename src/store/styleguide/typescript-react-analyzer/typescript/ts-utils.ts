import { Type } from './type';
import * as ts from 'typescript';

export function getExports(sourceFile: ts.SourceFile, program: ts.Program): Export[] {
	const exports: Export[] = [];

	const exportStatements = getExportStatements(sourceFile);

	exportStatements.forEach(statement => {
		const exportInfo = getExportInfo(program, statement);

		if (!exportInfo) {
			return;
		}

		exports.push(exportInfo);
	});

	return exports;
}

export function getExportInfo(program: ts.Program, statement: ts.Statement): Export | undefined {
	const typechecker = program.getTypeChecker();

	if (ts.isVariableStatement(statement)) {
		for (const declaration of statement.declarationList.declarations) {
			if (!declaration.type) {
				continue;
			}

			const exportName = declaration.name.getText();
			const type = typechecker.getTypeAtLocation(declaration);
			const exportType = new Type(type, typechecker);

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
		const exportType = new Type(type, typechecker);

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
			const exportType = new Type(type, typechecker);

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

export interface Export {
	exportType: Type;
	exportName?: string;
}
