import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

export function createApiReader(root) {
  const configPath = resolve(root, "packages/documents/tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    resolve(root, "packages/documents"),
  );
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  return (item) => {
    const file = program.getSourceFile(resolve(root, item.component.source));
    if (!file) throw new Error(`Missing API source: ${item.component.source}`);
    const exports = checker.getExportsOfModule(
      checker.getSymbolAtLocation(file),
    );
    const names =
      item.component.name === "Table"
        ? ["Table", "TableHeader", "TableRow", "TableCell"]
        : [item.component.name];
    return names.map((name) => {
      let symbol = exports.find((candidate) => candidate.name === name);
      if (!symbol) throw new Error(`Missing exported component: ${name}`);
      if (symbol.flags & ts.SymbolFlags.Alias)
        symbol = checker.getAliasedSymbol(symbol);
      const declaration = symbol.valueDeclaration ?? symbol.declarations[0];
      const signature = checker
        .getTypeOfSymbolAtLocation(symbol, declaration)
        .getCallSignatures()[0];
      if (!signature) throw new Error(`Missing call signature: ${name}`);
      const parameter = signature.parameters[0];
      const binding = signature.declaration?.parameters[0]?.name;
      const defaults = new Map(
        binding && ts.isObjectBindingPattern(binding)
          ? binding.elements
              .filter((element) => element.initializer)
              .map((element) => [
                element.name.getText(),
                element.initializer.getText(),
              ])
          : [],
      );
      const props = parameter
        ? checker.getPropertiesOfType(
            checker.getTypeOfSymbolAtLocation(parameter, declaration),
          )
        : [];
      return {
        name,
        props: props.map((prop) => ({
          name: prop.name,
          type: checker.typeToString(
            checker.getTypeOfSymbolAtLocation(
              prop,
              prop.valueDeclaration ?? declaration,
            ),
            prop.valueDeclaration ?? declaration,
            ts.TypeFormatFlags.NoTruncation |
              ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
          ),
          required: !(prop.flags & ts.SymbolFlags.Optional),
          default: defaults.get(prop.name) ?? null,
        })),
      };
    });
  };
}

function identifiers(node) {
  const names = new Set();
  function visit(child) {
    if (ts.isIdentifier(child)) names.add(child.text);
    ts.forEachChild(child, visit);
  }
  visit(node);
  return names;
}

export async function readExampleSource(root, path, exportName) {
  const source = ts.createSourceFile(
    path,
    await readFile(resolve(root, path), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const declarations = new Map();
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations)
        if (ts.isIdentifier(declaration.name))
          declarations.set(declaration.name.text, statement);
    } else if (statement.name && ts.isIdentifier(statement.name))
      declarations.set(statement.name.text, statement);
  }
  const selected = new Set();
  const used = new Set();
  function include(name) {
    used.add(name);
    const statement = declarations.get(name);
    if (!statement || selected.has(statement)) return;
    selected.add(statement);
    for (const dependency of identifiers(statement)) include(dependency);
  }
  if (!declarations.has(exportName))
    throw new Error(`Missing example export: ${exportName}`);
  include(exportName);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = [];
  const imports = [];
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings))
        throw new Error("Example imports must use named bindings.");
      const elements = bindings.elements.filter((element) =>
        used.has(element.name.text),
      );
      if (!elements.length) continue;
      imports.push(statement.moduleSpecifier.text);
      const modulePath = statement.moduleSpecifier.text.replace(
        /^\.\.\/\.\.\//,
        "../docn/",
      );
      result.push(
        printer.printNode(
          ts.EmitHint.Unspecified,
          ts.factory.updateImportDeclaration(
            statement,
            statement.modifiers,
            ts.factory.updateImportClause(
              statement.importClause,
              statement.importClause.isTypeOnly,
              undefined,
              ts.factory.updateNamedImports(bindings, elements),
            ),
            ts.factory.createStringLiteral(modulePath),
            statement.attributes,
          ),
          source,
        ),
      );
    } else if (selected.has(statement)) result.push(statement.getText(source));
  }
  return { code: result.join("\n\n"), imports };
}
