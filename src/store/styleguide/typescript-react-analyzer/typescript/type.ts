import * as ts from 'typescript';

export interface InternalType extends ts.Type {
	typeArguments: InternalType[] | undefined;
}

export class Type {
	public readonly type: InternalType;
	public readonly typeChecker: ts.TypeChecker;

	public get name(): string | undefined {
		return this.type.symbol && this.type.symbol.name;
	}

	public constructor(type: ts.Type, typechecker: ts.TypeChecker) {
		this.type = type as InternalType;
		this.typeChecker = typechecker;
	}

	public get baseTypes(): Type[] {
		let baseTypes = this.type.getBaseTypes();

		if (!baseTypes) {
			const originalType = getOriginalType(this.type, this.typeChecker);

			if (originalType) {
				baseTypes = originalType.getBaseTypes();
			}
		}

		if (!baseTypes) {
			return [];
		}

		return baseTypes.map(baseType => new Type(baseType, this.typeChecker));
	}

	public get typeArguments(): Type[] {
		if (!this.type.typeArguments) {
			return [];
		}

		return this.type.typeArguments.map(typeArg => new Type(typeArg, this.typeChecker));
	}

	public get isConstructable(): boolean {
		if (!this.type.symbol) {
			return false;
		}

		return (this.type.symbol.flags & ts.SymbolFlags.Class) === ts.SymbolFlags.Class;
	}
}

function getOriginalType(type: ts.Type, typechecker: ts.TypeChecker): ts.Type | undefined {
	if (!type.symbol) {
		return;
	}

	const typeDeclaration = type.symbol.declarations && type.symbol.declarations[0];

	if (!typeDeclaration) {
		return;
	}

	const realType = typechecker.getTypeAtLocation(typeDeclaration);
	return realType;
}
