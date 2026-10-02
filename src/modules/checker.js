const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "123456",
  "123456789",
  "12345678",
  "1234567890",
  "qwerty",
  "qwerty123",
  "admin",
  "admin123",
  "letmein",
  "welcome",
  "welcome123",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "abc123",
  "111111",
  "000000",
  "123123",
  "654321",
  "login",
  "secret",
  "master",
]);

const SEQUENTIAL_PATTERNS = [
  "0123456789",
  "1234567890",
  "abcdefghijklmnopqrstuvwxyz",
  "zyxwvutsrqponmlkjihgfedcba",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

function hasCharacterClass(password, pattern) {
  return pattern.test(password);
}

function hasRepeatedCharacters(password) {
  return /(.)\1{2,}/.test(password);
}

function hasRepeatedSubstrings(password) {
  if (password.length < 4) {
    return false;
  }

  for (let size = 1; size <= Math.floor(password.length / 2); size++) {
    for (let i = 0; i <= password.length - size * 2; i++) {
      const first = password.slice(i, i + size);
      const second = password.slice(i + size, i + size * 2);

      if (first === second) {
        return true;
      }
    }
  }

  return false;
}

function hasSequentialPattern(password) {
  const normalized = password.toLowerCase();

  return SEQUENTIAL_PATTERNS.some((sequence) => {
    for (let size = 4; size <= sequence.length; size++) {
      for (let start = 0; start <= sequence.length - size; start++) {
        const fragment = sequence.slice(start, start + size);

        if (normalized.includes(fragment)) {
          return true;
        }
      }
    }

    return false;
  });
}

function hasKeyboardPattern(password) {
  const normalized = password.toLowerCase();

  const keyboardPatterns = [
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

  return keyboardPatterns.some((pattern) =>
    normalized.includes(pattern)
  );
}

function isCommonPassword(password) {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

function getCharacterCounts(password) {
  return {
    uppercase: (password.match(/[A-Z]/g) || []).length,
    lowercase: (password.match(/[a-z]/g) || []).length,
    numbers: (password.match(/[0-9]/g) || []).length,
    symbols: (password.match(/[^A-Za-z0-9]/g) || []).length,
  };
}

function calculateCharacterPoolSize(password) {
  let poolSize = 0;

  if (/[A-Z]/.test(password)) {
    poolSize += 26;
  }

  if (/[a-z]/.test(password)) {
    poolSize += 26;
  }

  if (/[0-9]/.test(password)) {
    poolSize += 10;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    poolSize += 32;
  }

  return poolSize;
}

function calculateEntropy(password) {
  if (!password) {
    return 0;
  }

  const poolSize = calculateCharacterPoolSize(password);

  if (poolSize === 0) {
    return 0;
  }

  return password.length * Math.log2(poolSize);
}

function calculateScore(checks) {
  let score = 0;

  // Length
  if (checks.length >= 12) score += 20;
  else if (checks.length >= 10) score += 12;
  else if (checks.length >= 8) score += 6;

  // Character diversity
  if (checks.hasUppercase) score += 10;
  if (checks.hasLowercase) score += 10;
  if (checks.hasNumber) score += 10;
  if (checks.hasSpecial) score += 10;

  // Length bonus
  if (checks.length >= 16) score += 10;
  if (checks.length >= 20) score += 5;

  // Security penalties
  if (checks.repeatedCharacters) score -= 15;
  if (checks.repeatedSubstrings) score -= 15;
  if (checks.sequentialPattern) score -= 15;
  if (checks.keyboardPattern) score -= 15;
  if (checks.commonPassword) score -= 40;

  return Math.max(0, Math.min(100, score));
}

function getStrength(score) {
  if (score === 0) {
    return "Not analyzed";
  }

  if (score < 25) {
    return "Very Weak";
  }

  if (score < 45) {
    return "Weak";
  }

  if (score < 65) {
    return "Fair";
  }

  if (score < 85) {
    return "Strong";
  }

  return "Very Strong";
}

function getSuggestions(checks) {
  const suggestions = [];

  if (checks.length < 12) {
    suggestions.push(
      "Increase the password length to at least 12 characters."
    );
  }

  if (!checks.hasUppercase) {
    suggestions.push(
      "Add uppercase letters."
    );
  }

  if (!checks.hasLowercase) {
    suggestions.push(
      "Add lowercase letters."
    );
  }

  if (!checks.hasNumber) {
    suggestions.push(
      "Add numbers."
    );
  }

  if (!checks.hasSpecial) {
    suggestions.push(
      "Add special characters."
    );
  }

  if (checks.commonPassword) {
    suggestions.push(
      "Avoid common passwords."
    );
  }

  if (checks.repeatedCharacters) {
    suggestions.push(
      "Avoid repeated characters."
    );
  }

  if (checks.repeatedSubstrings) {
    suggestions.push(
      "Avoid repeating the same sequence."
    );
  }

  if (checks.sequentialPattern) {
    suggestions.push(
      "Avoid sequential characters such as 1234 or abcd."
    );
  }

  if (checks.keyboardPattern) {
    suggestions.push(
      "Avoid keyboard patterns such as qwerty or asdf."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "No obvious weaknesses were detected by this checker."
    );
  }

  return suggestions;
}

export function analyzePassword(password) {
  if (typeof password !== "string") {
    throw new TypeError("Password must be a string.");
  }

  if (password.length === 0) {
    return {
      score: 0,
      strength: "Not analyzed",
      entropy: 0,
      checks: {
        length: 0,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
        repeatedCharacters: false,
        repeatedSubstrings: false,
        sequentialPattern: false,
        keyboardPattern: false,
        commonPassword: false,
      },
      characterCounts: {
        uppercase: 0,
        lowercase: 0,
        numbers: 0,
        symbols: 0,
      },
      suggestions: [
        "Enter a password to begin analysis.",
      ],
    };
  }

  const characterCounts =
    getCharacterCounts(password);

  const checks = {
    length: password.length,

    hasUppercase:
      characterCounts.uppercase > 0,

    hasLowercase:
      characterCounts.lowercase > 0,

    hasNumber:
      characterCounts.numbers > 0,

    hasSpecial:
      characterCounts.symbols > 0,

    repeatedCharacters:
      hasRepeatedCharacters(password),

    repeatedSubstrings:
      hasRepeatedSubstrings(password),

    sequentialPattern:
      hasSequentialPattern(password),

    keyboardPattern:
      hasKeyboardPattern(password),

    commonPassword:
      isCommonPassword(password),
  };

  const score = calculateScore(checks);

  return {
    score,
    strength: getStrength(score),
    entropy: calculateEntropy(password),
    checks,
    characterCounts,
    suggestions: getSuggestions(checks),
  };
}