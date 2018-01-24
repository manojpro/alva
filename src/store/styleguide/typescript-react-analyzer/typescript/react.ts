import { Type } from './type';
import * as ts from 'typescript';

const WellKnownReactComponentTypes = ['Component', 'StatelessComponent', 'ComponentClass'];

export function inheritsWellKnownReactType(program: ts.Program, type: Type): boolean {
	if (isReactType(program, type.type)) {
		return true;
	}

	return type.baseTypes.some(baseType => inheritsWellKnownReactType(program, baseType));
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
