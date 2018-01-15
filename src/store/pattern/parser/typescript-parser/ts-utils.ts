import * as ts from 'typescript';

export function isExport(node: ts.Node): boolean {
	if (ts.isExportAssignment(node)) {
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

export function getExportName(node: ts.Node): string | undefined {
	let exportName: string | undefined;

	if (node.kind === ts.SyntaxKind.Identifier) {
		return node.getText();
	}

	for (const child of node.getChildren()) {
		exportName = getExportName(child);

		if (exportName) {
			return exportName;
		}
	}

	return undefined;
}

export function getAst(node: ts.Node): TypeScriptAst {
	return {
		node: node.getText(),
		kind: node.kind,
		children: node.getChildren().map(getAst)
	};
}

export interface TypeScriptAst {
	node: string;
	kind: number;
	children: TypeScriptAst[];
}
