import * as ts from 'typescript';

export function getTypeArgumentsFromClassDeclaration(
	declaration: ts.ClassDeclaration,
	program: ts.Program
): ts.Type[] {
	const retVal: ts.Type[] = [];

	const blupp = program.getTypeChecker().getTypeAtLocation(declaration);

	if (!declaration.heritageClauses) {
		return retVal;
	}

	const heritageClauses = declaration.heritageClauses;

	heritageClauses.forEach(heritageClause => {
		heritageClause.types.forEach(expression => {
			if (!expression.typeArguments) {
				return;
			}

			expression.typeArguments.forEach(typeNode => {
				const type = program.getTypeChecker().getTypeFromTypeNode(typeNode);
				retVal.push(type);
			});
		});
	});

	return retVal;
}

export function getTypeArgumentsFromVariableDeclaration(
	declaration: ts.VariableDeclaration,
	program: ts.Program
): ts.Type[] {
	const retVal: ts.Type[] = [];

	if (!declaration.type) {
		return retVal;
	}

	const type = program.getTypeChecker().getTypeFromTypeNode(declaration.type);

	return [type];
}
