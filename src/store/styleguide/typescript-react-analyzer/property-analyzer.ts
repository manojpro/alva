import { Property } from '../../pattern/property/property';
import { ReactPattern } from './react-pattern';
// import * as ts from 'typescript';

// import { BooleanProperty } from '../../pattern/property/boolean-property';
// import { EnumProperty, Option } from '../../pattern/property/enum-property';
// import { NumberArrayProperty } from '../../pattern/property/number-array-property';
// import { NumberProperty } from '../../pattern/property/number-property';
// import { ObjectProperty } from '../../pattern/property/object-property';
// import { StringArrayProperty } from '../../pattern/property/string-array-property';
// import { StringProperty } from '../../pattern/property/string-property';

export function getPropreties(pattern: ReactPattern): Map<string, Property> {
	return new Map();
}

// function createProperty(signature: ts.PropertySignature): Property | undefined {
// 	const typeNode: ts.TypeNode | undefined = signature.type;
// 	if (!typeNode) {
// 		return undefined;
// 	}

// 	const id: string = signature.name.getText();

// 	let property: Property | undefined;
// 	switch (typeNode.kind) {
// 		case ts.SyntaxKind.StringKeyword:
// 			return new StringProperty(id);

// 		case ts.SyntaxKind.NumberKeyword:
// 			return new NumberProperty(id);

// 		case ts.SyntaxKind.BooleanKeyword:
// 			return new BooleanProperty(id);

// 		case ts.SyntaxKind.ArrayType:
// 			switch ((typeNode as ts.ArrayTypeNode).elementType.kind) {
// 				case ts.SyntaxKind.StringKeyword:
// 					return new StringArrayProperty(id);

// 				case ts.SyntaxKind.NumberKeyword:
// 					return new NumberArrayProperty(id);
// 			}
// 			break;

// 		case ts.SyntaxKind.TypeReference:
// 			const referenceNode = typeNode as ts.TypeReferenceNode;
// 			property = processTypeProperty(id, referenceNode);
// 	}

// 	if (!property) {
// 		property = new ObjectProperty(id);
// 		// TODO: Parse properties
// 	}

// 	return property;
// }

// function processTypeProperty(
// 	id: string,
// 	referenceNode: ts.TypeReferenceNode
// ): Property | undefined {
// 	if (!referenceNode.typeName) {
// 		return undefined;
// 	}

// 	// TODO: Pattern type

// 	const enumTypeName: string = referenceNode.typeName.getText();
// 	const enumDeclaration: ts.EnumDeclaration | undefined = this.enums[enumTypeName];
// 	if (!enumDeclaration) {
// 		return undefined;
// 	}

// 	const options: Option[] = [];
// 	enumDeclaration.members.forEach((enumMember, index) => {
// 		const enumMemberId = enumMember.name.getText();
// 		let enumMemberName = getJsDocValue(enumMember, 'name');
// 		if (enumMemberName === undefined) {
// 			enumMemberName = enumMemberId;
// 		}
// 		const enumMemberOrdinal: number = enumMember.initializer
// 			? parseInt(enumMember.initializer.getText(), 10)
// 			: index;
// 		options.push(new Option(enumMemberId, enumMemberName, enumMemberOrdinal));
// 	});

// 	const result: EnumProperty = new EnumProperty(id);
// 	result.setOptions(options);
// 	return result;
// }

// function getJsDocValue(node: ts.Node, tagName: string): string | undefined {
// 	const jsDocTags: ReadonlyArray<ts.JSDocTag> | undefined = ts.getJSDocTags(node);
// 	let result: string | undefined;
// 	if (jsDocTags) {
// 		jsDocTags.forEach(jsDocTag => {
// 			if (jsDocTag.tagName && jsDocTag.tagName.text === tagName) {
// 				if (result === undefined) {
// 					result = '';
// 				}
// 				result += ` ${jsDocTag.comment}`;
// 			}
// 		});
// 	}

// 	return result === undefined ? undefined : result.trim();
// }
