const CHARACTER_SETS = Object.freeze({
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
});

const DEFAULT_OPTIONS = Object.freeze({
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeCharacters: "",
  allowDuplicates: true,
  minimumUppercase: 1,
  minimumLowercase: 1,
  minimumNumbers: 1,
  minimumSymbols: 1,
});

/**
 * Return a cryptographically secure random integer from
 * 0 through maxExclusive - 1.
 *
 * Rejection sampling avoids the modulo-bias problem that
 * occurs when random bytes are directly reduced with `%`.
 */
function secureRandomInt(maxExclusive) {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("maxExclusive must be a positive safe integer.");
  }

  const maxUint32 = 0xffffffff;
  const limit =
    Math.floor((maxUint32 + 1) / maxExclusive) * maxExclusive;

  const random = new Uint32Array(1);

  do {
    crypto.getRandomValues(random);
  } while (random[0] >= limit);

  return random[0] % maxExclusive;
}

/**
 * Select one random character securely.
 */
function secureRandomCharacter(characters) {
  if (!characters) {
    throw new Error("Character set cannot be empty.");
  }

  return characters[secureRandomInt(characters.length)];
}

/**
 * Secure Fisher-Yates shuffle.
 */
function secureShuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function normalizeOptions(options = {}) {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
  };
}

function validateOptions(options) {
  if (
    !Number.isInteger(options.length) ||
    options.length < 8 ||
    options.length > 128
  ) {
    throw new RangeError(
      "Password length must be an integer between 8 and 128."
    );
  }

  const minimums = [
    options.minimumUppercase,
    options.minimumLowercase,
    options.minimumNumbers,
    options.minimumSymbols,
  ];

  if (minimums.some((value) => !Number.isInteger(value) || value < 0)) {
    throw new RangeError(
      "Minimum character requirements must be non-negative integers."
    );
  }

  if (
    options.minimumUppercase > 0 &&
    !options.uppercase
  ) {
    throw new Error(
      "minimumUppercase requires uppercase characters to be enabled."
    );
  }

  if (
    options.minimumLowercase > 0 &&
    !options.lowercase
  ) {
    throw new Error(
      "minimumLowercase requires lowercase characters to be enabled."
    );
  }

  if (
    options.minimumNumbers > 0 &&
    !options.numbers
  ) {
    throw new Error(
      "minimumNumbers requires numbers to be enabled."
    );
  }

  if (
    options.minimumSymbols > 0 &&
    !options.symbols
  ) {
    throw new Error(
      "minimumSymbols requires symbols to be enabled."
    );
  }

  const minimumRequired =
    options.minimumUppercase +
    options.minimumLowercase +
    options.minimumNumbers +
    options.minimumSymbols;

  if (minimumRequired > options.length) {
    throw new RangeError(
      "Minimum character requirements exceed password length."
    );
  }
}

function buildCharacterSets(options) {
  const exclude = new Set(
    [...String(options.excludeCharacters)]
  );

  const removeExcluded = (characters) =>
    [...characters]
      .filter((character) => !exclude.has(character))
      .join("");

  let uppercase = removeExcluded(CHARACTER_SETS.uppercase);
  let lowercase = removeExcluded(CHARACTER_SETS.lowercase);
  let numbers = removeExcluded(CHARACTER_SETS.numbers);
  let symbols = removeExcluded(CHARACTER_SETS.symbols);

  if (options.excludeSimilar) {
    const similarCharacters = new Set([
      "0",
      "O",
      "o",
      "1",
      "I",
      "l",
    ]);

    const removeSimilar = (characters) =>
      [...characters]
        .filter((character) => !similarCharacters.has(character))
        .join("");

    uppercase = removeSimilar(uppercase);
    lowercase = removeSimilar(lowercase);
    numbers = removeSimilar(numbers);
    symbols = removeSimilar(symbols);
  }

  return {
    uppercase,
    lowercase,
    numbers,
    symbols,
  };
}

function addCharactersFromSet(
  output,
  characterSet,
  count,
  allowDuplicates
) {
  if (count === 0) {
    return;
  }

  if (!characterSet) {
    throw new Error(
      "A required character set became empty after exclusions."
    );
  }

  if (!allowDuplicates && count > characterSet.length) {
    throw new RangeError(
      "Not enough unique characters available for the requested minimum."
    );
  }

  const available = [...characterSet];

  for (let i = 0; i < count; i += 1) {
    const index = secureRandomInt(available.length);
    output.push(available[index]);

    if (!allowDuplicates) {
      available.splice(index, 1);
    }
  }
}

function buildPool(characterSets, options) {
  let pool = "";

  if (options.uppercase) {
    pool += characterSets.uppercase;
  }

  if (options.lowercase) {
    pool += characterSets.lowercase;
  }

  if (options.numbers) {
    pool += characterSets.numbers;
  }

  if (options.symbols) {
    pool += characterSets.symbols;
  }

  return pool;
}

/**
 * Generate a cryptographically secure password.
 */
export function generatePassword(userOptions = {}) {
  const options = normalizeOptions(userOptions);

  validateOptions(options);

  const characterSets = buildCharacterSets(options);

  const pool = buildPool(characterSets, options);

  if (!pool) {
    throw new Error(
      "At least one character type must be enabled."
    );
  }

  const passwordCharacters = [];

  addCharactersFromSet(
    passwordCharacters,
    characterSets.uppercase,
    options.minimumUppercase,
    options.allowDuplicates
  );

  addCharactersFromSet(
    passwordCharacters,
    characterSets.lowercase,
    options.minimumLowercase,
    options.allowDuplicates
  );

  addCharactersFromSet(
    passwordCharacters,
    characterSets.numbers,
    options.minimumNumbers,
    options.allowDuplicates
  );

  addCharactersFromSet(
    passwordCharacters,
    characterSets.symbols,
    options.minimumSymbols,
    options.allowDuplicates
  );

  const remainingLength =
    options.length - passwordCharacters.length;

  if (remainingLength > 0) {
    if (!options.allowDuplicates) {
      const usedCharacters = new Set(passwordCharacters);

      const available = [...pool].filter(
        (character) => !usedCharacters.has(character)
      );

      if (available.length < remainingLength) {
        throw new RangeError(
          "Not enough unique characters available for this configuration."
        );
      }

      for (let i = 0; i < remainingLength; i += 1) {
        const index = secureRandomInt(available.length);
        passwordCharacters.push(available[index]);
        available.splice(index, 1);
      }
    } else {
      for (let i = 0; i < remainingLength; i += 1) {
        passwordCharacters.push(
          secureRandomCharacter(pool)
        );
      }
    }
  }

  secureShuffle(passwordCharacters);

  return passwordCharacters.join("");
}

export function getCharacterSets() {
  return { ...CHARACTER_SETS };
}

export function getDefaultOptions() {
  return { ...DEFAULT_OPTIONS };
}