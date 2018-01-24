import * as ts from 'typescript';

declare module 'typescript' {
	interface Type {
		typeArguments: Type[] | undefined;
	}
}
