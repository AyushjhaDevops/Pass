const LEET_MAP = {
  "0": "o",
  "1": "i",
  "2": "z",
  "3": "e",
  "4": "a",
  "5": "s",
  "6": "g",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  "$": "s",
  "!": "i",
};

const COMMON_FRAGMENTS = [
  "password",
  "pass",
  "admin",
  "welcome",
  "login",
  "qwerty",
  "letmein",
  "secret",
  "master",
  "football",
  "dragon",
  "monkey",
  "princess",
  "shadow",
  "superman",
];

const KEYBOARD_PATTERNS = [
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "qaz",
  "wsx",
  "edc",
  "rfv",
  "tgb",
  "yhn",
  "ujm",
];

const SEQUENCE_PATTERNS = [
  "0123456789",
  "9876543210",
  "abcdefghijklmnopqrstuvwxyz",
  "zyxwvutsrqponmlkjihgfedcba",
  "qwertyuiop",
  "poiuytrewq",
  "asdfghjkl",
  "lkjhgfdsa",
  "zxcvbnm",
  "mnbvcxz",
];

export function normalizeLeetspeak(password) {
  return password
    .toLowerCase()
    .split("")
    .map((character) => LEET_MAP[character] || character)
    .join("");
}

export function detectLeetspeak(password) {
  const normalized = normalizeLeetspeak(password);

  if (normalized === password.toLowerCase()) {
    return false;
  }

  return COMMON_FRAGMENTS.some((fragment) =>
    normalized.includes(fragment),
  );
}

export function detectCommonFragments(password) {
  const normalized = normalizeLeetspeak(password);

  return COMMON_FRAGMENTS.filter((fragment) =>
    normalized.includes(fragment),
  );
}

export function detectKeyboardPattern(password) {
  const normalized = password.toLowerCase();

  return KEYBOARD_PATTERNS.some((pattern) =>
    normalized.includes(pattern),
  );
}

export function detectSequentialPattern(password) {
  const normalized = password.toLowerCase();

  return SEQUENCE_PATTERNS.some((sequence) => {
    for (let size = 4; size <= sequence.length; size += 1) {
      for (let start = 0; start <= sequence.length - size; start += 1) {
        const fragment = sequence.slice(start, start + size);

        if (normalized.includes(fragment)) {
          return true;
        }
      }
    }

    return false;
  });
}

export function detectRepeatedCharacters(password) {
  return /(.)\1{2,}/.test(password);
}

export function detectRepeatedBlocks(password) {
  if (password.length < 4) {
    return false;
  }

  for (let size = 1; size <= Math.floor(password.length / 2); size += 1) {
    for (
      let start = 0;
      start <= password.length - size * 2;
      start += 1
    ) {
      const first = password.slice(start, start + size);
      const second = password.slice(start + size, start + size * 2);

      if (first === second) {
        return true;
      }
    }
  }

  return false;
}

export function detectYear(password) {
  return /(19|20)\d{2}/.test(password);
}

export function detectDate(password) {
  const normalized = password.replace(/\D/g, " ");

  const datePattern =
    /\b(0?[1-9]|[12]\d|3[01])[\s./-](0?[1-9]|1[0-2])(?:[\s./-](19|20)?\d{2})?\b/;

  return datePattern.test(normalized);
}

export function detectWeakStructure(password) {
  const normalized = normalizeLeetspeak(password);

  const startsWithWord = /^[a-z]+/.test(normalized);
  const containsYear = detectYear(password);
  const endsWithSymbol = /[^A-Za-z0-9]$/.test(password);

  return (
    startsWithWord &&
    containsYear &&
    (endsWithSymbol || /[0-9]{2,}$/.test(password))
  );
}

export function analyzePatterns(password) {
  if (typeof password !== "string" || password.length === 0) {
    return {
      leetspeak: false,
      commonFragments: [],
      keyboard: false,
      sequential: false,
      repeatedCharacters: false,
      repeatedBlocks: false,
      year: false,
      date: false,
      weakStructure: false,
    };
  }

  return {
    leetspeak: detectLeetspeak(password),
    commonFragments: detectCommonFragments(password),
    keyboard: detectKeyboardPattern(password),
    sequential: detectSequentialPattern(password),
    repeatedCharacters: detectRepeatedCharacters(password),
    repeatedBlocks: detectRepeatedBlocks(password),
    year: detectYear(password),
    date: detectDate(password),
    weakStructure: detectWeakStructure(password),
  };
}