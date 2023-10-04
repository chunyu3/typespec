// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  matchType,
  ProtoDeclaration,
  ProtoEnumDeclaration,
  ProtoEnumVariantDeclaration,
  ProtoFieldDeclaration,
  ProtoFile,
  ProtoMessageDeclaration,
  ProtoMethodDeclaration,
  ProtoOneOfDeclaration,
  ProtoServiceDeclaration,
  ProtoType,
  StreamingMode,
} from "./ast.js";

// This module defines how to emit the text representation of a ProtoFile AST.

const PROTO_MAX_ONE_LINE_DOC_LENGTH = 80;

/**
 * Write the given `file` to a string.
 */
export function writeProtoFile(file: ProtoFile): string {
  let result = "// Generated by Microsoft TypeSpec\n";

  let docComment = collect(writeBlockDocumentationComment(file)).join("\n");
  if (docComment.length > 0) docComment = "\n" + docComment;
  result += docComment;

  result += '\nsyntax = "proto3";\n';

  if (file.package) result += `\npackage ${file.package};\n`;

  for (const _import of file.imports) {
    result += `\nimport "${_import}";`;
  }

  if (file.imports.length > 0) result += "\n";

  const opts = Object.entries(file.options);
  for (const [name, valueData] of opts) {
    const value = typeof valueData === "string" ? `"${valueData}"` : valueData.toString();
    result += `\noption ${name} = ${value};`;
  }

  // Give the declarations a little breathing room if options were provided
  if (opts.length > 0) result += "\n";

  for (const decl of file.declarations) {
    result += "\n" + collect(writeDeclaration(decl, 0)).join("\n") + "\n";
  }

  return result;
}

/**
 * Write the given `decl` to a line iterable.
 */
function* writeDeclaration(decl: ProtoDeclaration, indentLevel: number): Iterable<string> {
  switch (decl.kind) {
    case "message":
      yield* writeMessage(decl, indentLevel);
      return;
    case "service":
      yield* writeService(decl, indentLevel);
      return;
    case "field":
      yield* writeField(decl, indentLevel);
      return;
    case "oneof":
      yield* writeOneOf(decl, indentLevel);
      return;
    case "enum":
      yield* writeEnum(decl, indentLevel);
      return;
    case "variant":
      yield* writeVariant(decl, indentLevel);
      return;
    case "method":
      yield* writeMethod(decl);
      return;
    /* c8 ignore next 5 */
    default:
      const __exhaust: never = decl;
      throw __exhaust;
  }
}

/**
 * Write the given message `decl` to a line iterable.
 */
function* writeMessage(decl: ProtoMessageDeclaration, indentLevel: number): Iterable<string> {
  yield* writeBlockDocumentationComment(decl);

  const head = `message ${decl.name} {`;
  const tail = "}";

  if (decl.declarations.length > 0 || decl.reservations?.length) {
    yield head;
    yield* indent(writeReservations(decl));
    yield* indent(flatMap(decl.declarations, (decl) => writeDeclaration(decl, indentLevel + 1)));
    yield tail;
  } else yield head + tail;
}

function* writeReservations(decl: ProtoMessageDeclaration): Iterable<string> {
  const { reservedNumbers, reservedNames } = selectMap(
    decl.reservations ?? [],
    (v) => (typeof v === "number" || Array.isArray(v) ? "reservedNumbers" : "reservedNames"),
    {
      reservedNumbers: (v) => (Array.isArray(v) ? v[0] + " to " + v[1] : v.toString()),
      reservedNames: (v) => `"${v.toString()}"`,
    }
  );

  if (reservedNumbers.length + reservedNames.length > 0) {
    if (reservedNumbers.length > 0) yield `reserved ${reservedNumbers.join(", ")};`;
    if (reservedNames.length > 0) yield `reserved ${reservedNames.join(", ")};`;
    yield "";
  }
}

function* writeService(decl: ProtoServiceDeclaration, indentLevel: number): Iterable<string> {
  yield* writeBlockDocumentationComment(decl);

  const head = `service ${decl.name} {`;
  const tail = "}";

  if (decl.operations.length > 0) {
    yield head;
    yield* indent(flatMap(decl.operations, (decl) => writeDeclaration(decl, indentLevel + 1)));
    yield tail;
  } else yield head + tail;
}

function* writeMethod(decl: ProtoMethodDeclaration): Iterable<string> {
  yield* writeBlockDocumentationComment(decl);

  const [inStream, outStream] = [
    decl.stream & StreamingMode.In,
    decl.stream & StreamingMode.Out,
  ].map((v) => (v ? "stream " : ""));

  yield `rpc ${decl.name}(${inStream}${writeType(decl.input)}) returns (${outStream}${writeType(
    decl.returns
  )});`;
}

function* writeOneOf(decl: ProtoOneOfDeclaration, indentLevel: number): Iterable<string> {
  yield* writeBlockDocumentationComment(decl);

  // OneOf declarations must have at least one element, so no need to check for declarations
  yield `oneof ${decl.name} {`;
  yield* indent(flatMap(decl.declarations, (decl) => writeDeclaration(decl, indentLevel + 1)));
  yield "}";
}

function* writeEnum(decl: ProtoEnumDeclaration, indentLevel: number): Iterable<string> {
  yield* writeBlockDocumentationComment(decl);

  yield `enum ${decl.name} {`;
  if (decl.allowAlias) {
    yield "  option allow_alias = true;";

    if (decl.variants.length > 0) yield "";
  }
  yield* indent(flatMap(decl.variants, (decl) => writeDeclaration(decl, indentLevel + 1)));
  yield "}";
}

function writeVariant(decl: ProtoEnumVariantDeclaration, indentLevel: number): Iterable<string> {
  const output = `${decl.name} = ${decl.value};`;

  return writeDocumentationCommentFlexible(decl, output, indentLevel);
}

function writeField(decl: ProtoFieldDeclaration, indentLevel: number): Iterable<string> {
  const prefix = decl.repeated ? "repeated " : "";
  const output = prefix + `${writeType(decl.type)} ${decl.name} = ${decl.index};`;

  return writeDocumentationCommentFlexible(decl, output, indentLevel);
}

function writeType(type: ProtoType): string {
  return matchType(type, {
    map: (k, v) => `map<${k}, ${writeType(v)}>`,
    ref: (r) => r,
    scalar: (s) => s,
  });
}

// #region utils

/**
 * Indents an iterable of strings by prepending an amount of spaces to each item
 * in the iterable.
 *
 * @param it - the string iterable to indent
 * @param depth - the indentation depth in spaces, defaults to 2
 */
function* indent(it: Iterable<string>, depth: number = 2): Iterable<string> {
  for (const value of it) {
    if (value !== "") {
      yield " ".repeat(depth) + value;
    } else yield value;
  }
}

/**
 * Writes a block comment from the given declaration.
 */
function* writeBlockDocumentationComment(decl: ProtoDeclaration | ProtoFile): Iterable<string> {
  yield* decl.doc
    ?.trim()
    .split("\n")
    .map((line) => `// ${line}`) ?? [];
}

/**
 * Writes a block comment or inline postfix comment depending on the length of the content.
 */
function* writeDocumentationCommentFlexible(
  decl: ProtoDeclaration,
  output: string,
  indentLevel: number
): Iterable<string> {
  const docComment = decl.doc?.trim();
  const docCommentIsOneLine = docComment && !docComment?.includes("\n");

  const fullLength = indentLevel * 2 + output.length + 1 + (docComment?.length ?? 0);

  if (docCommentIsOneLine && fullLength <= PROTO_MAX_ONE_LINE_DOC_LENGTH) {
    yield output + " // " + decl.doc;
  } else {
    yield* writeBlockDocumentationComment(decl);
    yield output;
  }
}

/**
 * A version of flatMap that works with generic iterables.
 *
 * @param it - the iterable to flatten and map
 * @param f - the function to run on the items of `it`
 */
function* flatMap<T1, T2>(it: Iterable<T1>, f: (v: T1) => T2 | Iterable<T2>): Iterable<T2> {
  for (const value of it) {
    const result = f(value);
    if (typeof result === "object" && result !== null && Symbol.iterator in result) {
      yield* result as Iterable<T2>;
    } else {
      yield result as T2;
    }
  }
}

/**
 * Collects an iterable into an array. Having this as a callable function is useful for writing functional combinations.
 *
 * @param it - the iterable to collect
 * @returns an array with all the items in the iterable
 */
function collect<T>(it: Iterable<T>): T[] {
  return [...it];
}

/**
 * A helper function that allows categorizing items from an iterable into groups and running a different map function
 * for each group.
 *
 * @param source - the iterable to apply the selection and mapping to
 * @param select - a function that is applied to each item and produces a selector
 * @param delegates - a record of selectors to mapping functions
 * @returns a record of selectors to arrays of results produced by each delegate
 */
function selectMap<TIn, Delegates extends { [k: string]: (input: TIn) => unknown }>(
  source: Iterable<TIn>,
  select: (v: TIn) => keyof Delegates,
  delegates: Delegates
) {
  const result = Object.fromEntries(Object.keys(delegates).map((k) => [k, []])) as unknown as {
    [K in keyof Delegates]: ReturnType<Delegates[K]>[];
  };
  for (const value of source) {
    const k = select(value);
    result[k].push(delegates[k](value) as any);
  }

  return result;
}

// #endregion
