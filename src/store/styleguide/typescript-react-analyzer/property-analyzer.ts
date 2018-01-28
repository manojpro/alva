import { Property } from '../../pattern/property/property';
import * as ts from 'typescript';

import { BooleanProperty } from '../../pattern/property/boolean-property';
import { EnumProperty, Option } from '../../pattern/property/enum-property';
import { NumberArrayProperty } from '../../pattern/property/number-array-property';
import { NumberProperty } from '../../pattern/property/number-property';
import { ObjectProperty } from '../../pattern/property/object-property';
import { StringArrayProperty } from '../../pattern/property/string-array-property';
import { StringProperty } from '../../pattern/property/string-property';

export function getProperties(type: ts.Type, typechecker: ts.TypeChecker): Map<string, Property> {
	const properties = new Map<string, Property>();
	const members = type.getApparentProperties();

	members.forEach(memberSymbol => {
		if ((memberSymbol.flags & ts.SymbolFlags.Property) !== ts.SymbolFlags.Property) {
			return;
		}

		const property = createProperty(memberSymbol.name, memberSymbol, typechecker);

		if (property) {
			properties.set(property.getId(), property);
		}
	});

	return properties;
}

function createProperty(
	name: string,
	symbol: ts.Symbol,
	typechecker: ts.TypeChecker
): Property | undefined {
	const declaration = findTypeDeclaration(symbol) as ts.PropertyDeclaration;

	if (!declaration) {
		return;
	}

	if (!declaration.type) {
		return;
	}

	let typeNode = declaration.type;

	if (ts.isUnionTypeNode(declaration.type)) {
		typeNode = declaration.type.types[0];
	}

	const type = typechecker.getTypeFromTypeNode(typeNode);

	const optional = (symbol.flags & ts.SymbolFlags.Optional) === ts.SymbolFlags.Optional;

	if ((type.flags & ts.TypeFlags.String) === ts.TypeFlags.String) {
		const property = new StringProperty(name);
		property.setRequired(!optional);
		return property;
	}

	if ((type.flags & ts.TypeFlags.Number) === ts.TypeFlags.Number) {
		const property = new NumberProperty(name);
		property.setRequired(!optional);
		return property;
	}

	if ((type.flags & ts.TypeFlags.Boolean) === ts.TypeFlags.Boolean) {
		const property = new BooleanProperty(name);
		property.setRequired(!optional);
		return property;
	}

	if (ts.isTypeReferenceNode(typeNode)) {
		if (!type.symbol) {
			return;
		}

		const typeReferenceDeclaration = findTypeDeclaration(type.symbol);

		if (!typeReferenceDeclaration) {
			return;
		}

		if (ts.isEnumDeclaration(typeReferenceDeclaration)) {
			const property = new EnumProperty(name);
			property.setOptions(getEnumTypeOptions(typeReferenceDeclaration));
			property.setRequired(!optional);
			return property;
		}

		if (ts.isInterfaceDeclaration(typeReferenceDeclaration)) {
			const property = new ObjectProperty(name);
			property.setProperties(getProperties(type, typechecker));
			return property;
		}
	}

	if (ts.isArrayTypeNode(typeNode)) {
		const arrayTypeNode = typeNode;

		switch (arrayTypeNode.elementType.kind) {
			case ts.SyntaxKind.StringKeyword:
				return new StringArrayProperty(name);

			case ts.SyntaxKind.NumberKeyword:
				return new NumberArrayProperty(name);
		}
	}

	return undefined;
}

function findTypeDeclaration(symbol: ts.Symbol): ts.Declaration | undefined {
	if (symbol.valueDeclaration) {
		return symbol.valueDeclaration;
	}

	if (symbol.declarations) {
		return symbol.declarations[0];
	}

	// const internalSymbol = symbol as {
	// 	type?: ts.Type;
	// };

	// if (!(internalSymbol.type && internalSymbol.type.symbol)) {
	// 	return;
	// }

	// if (internalSymbol.type.symbol) {
	// 	return findTypeDeclaration(internalSymbol.type.symbol);
	// }

	return;
}

function getEnumTypeOptions(declaration: ts.EnumDeclaration): Option[] {
	return declaration.members.map((enumMember, index) => {
		const enumMemberId = enumMember.name.getText();
		let enumMemberName = getJsDocValue(enumMember, 'name');
		if (enumMemberName === undefined) {
			enumMemberName = enumMemberId;
		}
		const enumMemberOrdinal: number = enumMember.initializer
			? parseInt(enumMember.initializer.getText(), 10)
			: index;

		return new Option(enumMemberId, enumMemberName, enumMemberOrdinal);
	});
}

function getJsDocValue(node: ts.Node, tagName: string): string | undefined {
	const jsDocTags: ReadonlyArray<ts.JSDocTag> | undefined = ts.getJSDocTags(node);
	let result: string | undefined;
	if (jsDocTags) {
		jsDocTags.forEach(jsDocTag => {
			if (jsDocTag.tagName && jsDocTag.tagName.text === tagName) {
				if (result === undefined) {
					result = '';
				}
				result += ` ${jsDocTag.comment}`;
			}
		});
	}

	return result === undefined ? undefined : result.trim();
}
