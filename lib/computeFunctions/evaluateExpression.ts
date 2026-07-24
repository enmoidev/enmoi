// Évaluateur d'expressions arithmétiques
//
// Remplace expr-eval, qui souffre d'une faille de prototype pollution sans
// correctif disponible. La grammaire supportée est volontairement minimale et
// couvre l'intégralité de ce qu'expriment les formules métier :
//
//   expression := terme (("+" | "-") terme)*
//   terme      := facteur (("*" | "/" | "%") facteur)*
//   facteur    := unaire ("^" facteur)?          -- associatif à droite
//   unaire     := ("-" | "+")? primaire
//   primaire   := nombre | variable | fonction "(" args ")" | "(" expression ")"
//
// Sûr par construction : aucune propriété d'objet n'est lue dynamiquement et
// aucun code n'est généré. Les variables sont résolues dans une portée explicite,
// jamais par substitution textuelle.

/// Erreur de syntaxe ou de sémantique dans une formule, avec message destiné à
/// l'administrateur qui édite l'expression.
export class FormulaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormulaError";
  }
}

export type Scope = Readonly<Record<string, number>>;

const FUNCTIONS: Readonly<Record<string, (args: number[]) => number>> = {
  abs: ([x]) => Math.abs(x),
  round: ([x]) => Math.round(x),
  floor: ([x]) => Math.floor(x),
  ceil: ([x]) => Math.ceil(x),
  sqrt: ([x]) => Math.sqrt(x),
  min: (args) => Math.min(...args),
  max: (args) => Math.max(...args),
};

const FUNCTION_ARITY: Readonly<Record<string, { min: number; max: number }>> = {
  abs: { min: 1, max: 1 },
  round: { min: 1, max: 1 },
  floor: { min: 1, max: 1 },
  ceil: { min: 1, max: 1 },
  sqrt: { min: 1, max: 1 },
  min: { min: 1, max: Infinity },
  max: { min: 1, max: Infinity },
};

type Token =
  | { kind: "number"; value: number }
  | { kind: "name"; value: string }
  | { kind: "op"; value: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let raw = "";
      while (i < input.length && /[0-9.]/.test(input[i])) raw += input[i++];
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        throw new FormulaError(`Nombre invalide : « ${raw} ».`);
      }
      tokens.push({ kind: "number", value });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let raw = "";
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) raw += input[i++];
      tokens.push({ kind: "name", value: raw });
      continue;
    }

    if ("+-*/%^(),".includes(char)) {
      tokens.push({ kind: "op", value: char });
      i++;
      continue;
    }

    throw new FormulaError(`Caractère non autorisé dans la formule : « ${char} ».`);
  }

  return tokens;
}

/// Évalue une expression arithmétique dans une portée de variables donnée.
export function evaluateExpression(expression: string, scope: Scope): number {
  if (!expression.trim()) {
    throw new FormulaError("La formule est vide.");
  }

  const tokens = tokenize(expression);
  let position = 0;

  const peek = (): Token | undefined => tokens[position];

  const eatOperator = (value: string): boolean => {
    const token = peek();
    if (token?.kind === "op" && token.value === value) {
      position++;
      return true;
    }
    return false;
  };

  const expect = (value: string): void => {
    if (!eatOperator(value)) {
      throw new FormulaError(`« ${value} » attendu dans la formule.`);
    }
  };

  function parseExpression(): number {
    let left = parseTerm();
    for (;;) {
      if (eatOperator("+")) left += parseTerm();
      else if (eatOperator("-")) left -= parseTerm();
      else return left;
    }
  }

  function parseTerm(): number {
    let left = parseFactor();
    for (;;) {
      if (eatOperator("*")) {
        left *= parseFactor();
      } else if (eatOperator("/")) {
        const divisor = parseFactor();
        if (divisor === 0) throw new FormulaError("Division par zéro dans la formule.");
        left /= divisor;
      } else if (eatOperator("%")) {
        const divisor = parseFactor();
        if (divisor === 0) throw new FormulaError("Modulo par zéro dans la formule.");
        left %= divisor;
      } else {
        return left;
      }
    }
  }

  function parseFactor(): number {
    const base = parseUnary();
    // Associativité à droite : 2^3^2 vaut 2^(3^2).
    if (eatOperator("^")) return Math.pow(base, parseFactor());
    return base;
  }

  function parseUnary(): number {
    if (eatOperator("-")) return -parseUnary();
    if (eatOperator("+")) return parseUnary();
    return parsePrimary();
  }

  function parsePrimary(): number {
    const token = peek();

    if (!token) {
      throw new FormulaError("Formule incomplète.");
    }

    if (token.kind === "number") {
      position++;
      return token.value;
    }

    if (token.kind === "name") {
      position++;
      const name = token.value;

      // Appel de fonction
      if (peek()?.kind === "op" && (peek() as { value: string }).value === "(") {
        if (!Object.hasOwn(FUNCTIONS, name)) {
          throw new FormulaError(`Fonction inconnue : « ${name} ».`);
        }
        expect("(");
        const args: number[] = [];
        if (!eatOperator(")")) {
          do {
            args.push(parseExpression());
          } while (eatOperator(","));
          expect(")");
        }

        const arity = FUNCTION_ARITY[name];
        if (args.length < arity.min || args.length > arity.max) {
          throw new FormulaError(
            `La fonction « ${name} » n'accepte pas ${args.length} argument(s).`
          );
        }
        return FUNCTIONS[name](args);
      }

      // Variable — résolue dans la portée, sans jamais parcourir un prototype.
      if (!Object.hasOwn(scope, name)) {
        const available = Object.keys(scope).sort().join(", ");
        throw new FormulaError(
          `Variable inconnue : « ${name} ». Variables disponibles : ${available}.`
        );
      }
      return scope[name];
    }

    if (token.value === "(") {
      position++;
      const value = parseExpression();
      expect(")");
      return value;
    }

    throw new FormulaError(`Élément inattendu dans la formule : « ${token.value} ».`);
  }

  const result = parseExpression();

  if (position < tokens.length) {
    const rest = tokens[position];
    throw new FormulaError(
      `Élément inattendu à la fin de la formule : « ${
        rest.kind === "number" ? rest.value : rest.value
      } ».`
    );
  }

  if (!Number.isFinite(result)) {
    throw new FormulaError("La formule ne produit pas un nombre exploitable.");
  }

  return result;
}
