import { Property } from '../../pattern/property/property';
import { ReactPattern } from './react-pattern';
import * as ts from 'typescript';

import { BooleanProperty } from '../../pattern/property/boolean-property';
import { EnumProperty, Option } from '../../pattern/property/enum-property';
import { NumberArrayProperty } from '../../pattern/property/number-array-property';
import { NumberProperty } from '../../pattern/property/number-property';
import { ObjectProperty } from '../../pattern/property/object-property';
import { StringArrayProperty } from '../../pattern/property/string-array-property';
import { StringProperty } from '../../pattern/property/string-property';

export function getProperties(pattern: ReactPattern): Map<string, Property> {
	const propType = pattern.exportInfo.exportType.typeArguments[0];

	if (!propType) {
		return new Map();
	}

	const properties = new Map<string, Property>();
	const members = propType.type.getApparentProperties();

	members.forEach(memberSymbol => {
		if (
			!(memberSymbol.valueDeclaration && ts.isPropertySignature(memberSymbol.valueDeclaration))
		) {
			return;
		}

		const signature = memberSymbol.valueDeclaration;
		const property = createProperty(signature, pattern.exportInfo.exportType.typeChecker);

		if (property) {
			properties.set(property.getId(), property);
		}
	});

	return properties;
}

function createProperty(
	signature: ts.PropertySignature,
	typechecker: ts.TypeChecker
): Property | undefined {
	const typeNode: ts.TypeNode | undefined = signature.type;
	if (!typeNode) {
		return undefined;
	}

	const id: string = signature.name.getText();

	let property: Property | undefined;
	switch (typeNode.kind) {
		case ts.SyntaxKind.StringKeyword:
			return new StringProperty(id);

		case ts.SyntaxKind.NumberKeyword:
			return new NumberProperty(id);

		case ts.SyntaxKind.BooleanKeyword:
			return new BooleanProperty(id);

		case ts.SyntaxKind.ArrayType:
			switch ((typeNode as ts.ArrayTypeNode).elementType.kind) {
				case ts.SyntaxKind.StringKeyword:
					return new StringArrayProperty(id);

				case ts.SyntaxKind.NumberKeyword:
					return new NumberArrayProperty(id);
			}
			break;

		case ts.SyntaxKind.TypeReference:
			const typeReference = typeNode as ts.TypeReferenceNode;
			return processTypeProperty(id, typeReference, typechecker);
	}

	if (!property) {
		property = new ObjectProperty(id);
		// TODO: Parse properties
	}

	return property;
}

function processTypeProperty(
	id: string,
	referenceNode: ts.TypeReferenceNode,
	typechecker: ts.TypeChecker
): Property | undefined {
	if (!referenceNode.typeName) {
		return undefined;
	}

	const type = typechecker.getTypeFromTypeNode(referenceNode);

	if (!(type.symbol && type.symbol.valueDeclaration)) {
		return undefined;
	}

	const declaration = type.symbol.valueDeclaration;

	if (!ts.isEnumDeclaration(declaration)) {
		return undefined;
	}

	const options: Option[] = [];
	declaration.members.forEach((enumMember, index) => {
		const enumMemberId = enumMember.name.getText();
		let enumMemberName = getJsDocValue(enumMember, 'name');
		if (enumMemberName === undefined) {
			enumMemberName = enumMemberId;
		}
		const enumMemberOrdinal: number = enumMember.initializer
			? parseInt(enumMember.initializer.getText(), 10)
			: index;
		options.push(new Option(enumMemberId, enumMemberName, enumMemberOrdinal));
	});

	const result: EnumProperty = new EnumProperty(id);
	result.setOptions(options);
	return result;
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
