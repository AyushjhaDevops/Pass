
import {
  calculateEntropy,
  calculateSearchSpace,
  estimateCrackTime,
  getCharacterPoolSize,
} from "./entropy.js";

import { analyzePatterns } from "./patterns.js";

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

function getCharacterCounts(password) {
  return {
    uppercase: (password.match(/[A-Z]/g) || []).length,
    lowercase: (password.match(/[a-z]/g) || []).length,
    numbers: (password.match(/[0-9]/g) || []).length,
    symbols: (password.match(/[^A-Za-z0-9]/g) || []).length,
  };
}

function isCommonPassword(password) {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

function calculateScore(checks, patterns) {
  let score = 0;

  // Password length
  if (checks.length >= 12) {
    score += 20;
  } else if (checks.length >= 10) {
    score += 12;
  } else if (checks.length >= 8) {
    score += 6;
  }

  if (checks.length >= 16) {
    score += 10;
  }

  if (checks.length >= 20) {
    score += 5;
  }

  // Character classes
  if (checks.hasUppercase) {
    score += 10;
  }

  if (checks.hasLowercase) {
    score += 10;
  }

  if (checks.hasNumber) {
    score += 10;
  }

  if (checks.hasSpecial) {
    score += 10;
  }

  // Weak patterns
  if (patterns.repeatedCharacters) {
    score -= 15;
  }

  if (patterns.repeatedBlocks) {
    score -= 15;
  }

  if (patterns.sequential) {
    score -= 15;
  }

  if (patterns.keyboard) {
    score -= 15;
  }

  if (patterns.year) {
    score -= 10;
  }

  if (patterns.date) {
    score -= 10;
  }

  if (patterns.leetspeak) {
    score -= 10;
  }

  if (patterns.weakStructure) {
    score -= 10;
  }

  if (checks.commonPassword) {
    score -= 40;
  }

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

function getSuggestions(checks, patterns) {
  const suggestions = [];

  if (checks.length < 12) {
    suggestions.push(
      "Increase the password length to at least 12 characters.",
    );
  }

  if (!checks.hasUppercase) {
    suggestions.push("Add uppercase letters.");
  }

  if (!checks.hasLowercase) {
    suggestions.push("Add lowercase letters.");
  }

  if (!checks.hasNumber) {
    suggestions.push("Add numbers.");
  }

  if (!checks.hasSpecial) {
    suggestions.push("Add special characters.");
  }

  if (checks.commonPassword) {
    suggestions.push(
      "Avoid passwords found in common-password lists.",
    );
  }

  if (patterns.commonFragments.length > 0) {
    suggestions.push(
      "Avoid common password words or recognizable fragments.",
    );
  }

  if (patterns.repeatedCharacters) {
    suggestions.push(
      "Avoid repeated characters such as aaa or 111.",
    );
  }

  if (patterns.repeatedBlocks) {
    suggestions.push(
      "Avoid repeating the same block multiple times.",
    );
  }

  if (patterns.sequential) {
    suggestions.push(
      "Avoid sequential patterns such as 1234 or abcd.",
    );
  }

  if (patterns.keyboard) {
    suggestions.push(
      "Avoid keyboard patterns such as qwerty or asdf.",
    );
  }

  if (patterns.year) {
    suggestions.push(
      "Avoid predictable years such as 1999, 2024, or 2026.",
    );
  }

  if (patterns.date) {
    suggestions.push(
      "Avoid dates because they are often easy to guess.",
    );
  }

  if (patterns.leetspeak) {
    suggestions.push(
      "Replacing letters with predictable symbols or numbers is not sufficient by itself.",
    );
  }

  if (patterns.weakStructure) {
    suggestions.push(
      "Avoid predictable structures such as Word + Year + Symbol.",
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "No obvious weaknesses were detected by this local heuristic analyzer.",
    );
  }

  return suggestions;
}

function createEmptyResult() {
  return {
    score: 0,
    strength: "Not analyzed",

    entropy: 0,
    searchSpace: 0,
    characterPoolSize: 0,

    crackTime: {
      seconds: 0,
      label: "Instant",
    },

    checks: {
      length: 0,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
      commonPassword: false,

      // Backward compatibility with Phase 3
      repeatedCharacters: false,
      repeatedSubstrings: false,
      sequentialPattern: false,
      keyboardPattern: false,
    },

    patterns: {
      leetspeak: false,
      commonFragments: [],
      keyboard: false,
      sequential: false,
      repeatedCharacters: false,
      repeatedBlocks: false,
      year: false,
      date: false,
      weakStructure: false,
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

export function analyzePassword(password) {
  if (typeof password !== "string") {
    throw new TypeError("Password must be a string.");
  }

  if (password.length === 0) {
    return createEmptyResult();
  }

  const characterCounts = getCharacterCounts(password);

  const patterns = analyzePatterns(password);

  /*
   * `checks` contains the basic password properties.
   *
   * The legacy pattern properties are intentionally kept here
   * so Phase 3 code remains compatible with Phase 4.
   */
  const checks = {
    length: password.length,

    hasUppercase: characterCounts.uppercase > 0,
    hasLowercase: characterCounts.lowercase > 0,
    hasNumber: characterCounts.numbers > 0,
    hasSpecial: characterCounts.symbols > 0,

    commonPassword: isCommonPassword(password),

    // Phase 3 compatibility
    repeatedCharacters: patterns.repeatedCharacters,
    repeatedSubstrings: patterns.repeatedBlocks,
    sequentialPattern: patterns.sequential,
    keyboardPattern: patterns.keyboard,
  };

  const entropy = calculateEntropy(password);

  const searchSpace = calculateSearchSpace(password);

  const characterPoolSize = getCharacterPoolSize(password);

  const crackTime = estimateCrackTime(entropy);

  const score = calculateScore(checks, patterns);

  return {
    score,

    strength: getStrength(score),

    entropy,

    searchSpace,

    characterPoolSize,

    crackTime,

    checks,

    patterns,

    characterCounts,

    suggestions: getSuggestions(checks, patterns),
  };
}
