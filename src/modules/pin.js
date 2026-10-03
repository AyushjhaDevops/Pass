const COMMON_PINS = new Set([
  "0000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
  "1234",
  "4321",
  "1212",
  "2121",
  "1122",
  "1221",
  "1004",
  "2000",
  "2001",
  "2002",
  "2003",
  "2004",
  "2005",
  "2006",
  "2007",
  "2008",
  "2009",
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
  "2580",
  "0852",
  "5683",
  "6969",
  "7777",
]);

const DEFAULT_OPTIONS = {
  length: 6,
  noRepeats: true,
  avoidSequential: true,
  avoidCommon: true,
};

function secureRandomInt(max) {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError("Maximum must be a positive integer.");
  }

  const randomValues = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  do {
    crypto.getRandomValues(randomValues);
  } while (randomValues[0] >= limit);

  return randomValues[0] % max;
}

function generateRandomDigit() {
  return String(secureRandomInt(10));
}

function generateCandidate(length, noRepeats) {
  const digits = [];
  const used = new Set();

  while (digits.length < length) {
    const digit = generateRandomDigit();

    if (noRepeats && used.has(digit)) {
      continue;
    }

    digits.push(digit);
    used.add(digit);
  }

  return digits.join("");
}

function isAscendingSequence(pin) {
  for (let index = 1; index < pin.length; index += 1) {
    if (
      Number(pin[index]) !==
      Number(pin[index - 1]) + 1
    ) {
      return false;
    }
  }

  return true;
}

function isDescendingSequence(pin) {
  for (let index = 1; index < pin.length; index += 1) {
    if (
      Number(pin[index]) !==
      Number(pin[index - 1]) - 1
    ) {
      return false;
    }
  }

  return true;
}

function isCircularAscendingSequence(pin) {
  for (let index = 1; index < pin.length; index += 1) {
    const previous = Number(pin[index - 1]);
    const current = Number(pin[index]);

    if (current !== (previous + 1) % 10) {
      return false;
    }
  }

  return true;
}

function isCircularDescendingSequence(pin) {
  for (let index = 1; index < pin.length; index += 1) {
    const previous = Number(pin[index - 1]);
    const current = Number(pin[index]);

    if (current !== (previous + 9) % 10) {
      return false;
    }
  }

  return true;
}

export function hasRepeatedDigits(pin) {
  if (typeof pin !== "string") {
    return false;
  }

  return new Set(pin).size !== pin.length;
}

export function hasSequentialPattern(pin) {
  if (typeof pin !== "string" || pin.length < 3) {
    return false;
  }

  return (
    isAscendingSequence(pin) ||
    isDescendingSequence(pin) ||
    isCircularAscendingSequence(pin) ||
    isCircularDescendingSequence(pin)
  );
}

export function isCommonPin(pin) {
  if (typeof pin !== "string") {
    return false;
  }

  return COMMON_PINS.has(pin);
}

export function calculatePinEntropy(length) {
  if (!Number.isInteger(length) || length <= 0) {
    return 0;
  }

  return length * Math.log2(10);
}

export function calculatePinSearchSpace(length, noRepeats = false) {
  if (!Number.isInteger(length) || length <= 0) {
    return 0;
  }

  if (noRepeats) {
    if (length > 10) {
      return 0;
    }

    let space = 1;

    for (let index = 0; index < length; index += 1) {
      space *= 10 - index;
    }

    return space;
  }

  return 10 ** length;
}

export function estimatePinCrackTime(
  entropyBits,
  guessesPerSecond = 100,
) {
  if (
    !Number.isFinite(entropyBits) ||
    entropyBits <= 0
  ) {
    return {
      seconds: 0,
      label: "Instant",
    };
  }

  const possibleGuesses = 2 ** entropyBits;
  const seconds = possibleGuesses / guessesPerSecond;

  if (seconds < 1) {
    return {
      seconds,
      label: "Less than a second",
    };
  }

  if (seconds < 60) {
    return {
      seconds,
      label: `${Math.round(seconds)} seconds`,
    };
  }

  if (seconds < 3600) {
    return {
      seconds,
      label: `${Math.round(seconds / 60)} minutes`,
    };
  }

  if (seconds < 86400) {
    return {
      seconds,
      label: `${Math.round(seconds / 3600)} hours`,
    };
  }

  if (seconds < 31536000) {
    return {
      seconds,
      label: `${Math.round(seconds / 86400)} days`,
    };
  }

  return {
    seconds,
    label: `${Math.round(
      seconds / 31536000,
    ).toLocaleString()} years`,
  };
}

function calculatePinScore(
  pin,
  options = DEFAULT_OPTIONS,
) {
  let score = 0;

  const length = pin.length;
  const repeated = hasRepeatedDigits(pin);
  const sequential = hasSequentialPattern(pin);
  const common = isCommonPin(pin);

  if (length >= 4) {
    score += 20;
  }

  if (length >= 6) {
    score += 20;
  }

  if (length >= 8) {
    score += 20;
  }

  if (!repeated) {
    score += 15;
  }

  if (!sequential) {
    score += 10;
  }

  if (!common) {
    score += 15;
  }

  if (options.noRepeats && repeated) {
    score -= 20;
  }

  if (options.avoidSequential && sequential) {
    score -= 20;
  }

  if (options.avoidCommon && common) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}

function getStrength(score) {
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

function getSuggestions(pin, options) {
  const suggestions = [];

  if (pin.length < 6) {
    suggestions.push(
      "Use a PIN of at least 6 digits when the device allows it.",
    );
  }

  if (hasRepeatedDigits(pin)) {
    suggestions.push(
      "Avoid repeating the same digit multiple times.",
    );
  }

  if (hasSequentialPattern(pin)) {
    suggestions.push(
      "Avoid predictable sequential patterns.",
    );
  }

  if (isCommonPin(pin)) {
    suggestions.push(
      "Avoid commonly used PINs.",
    );
  }

  if (!options.noRepeats) {
    suggestions.push(
      "Consider enabling the no repeated digits option.",
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "No obvious weaknesses were detected by this local PIN analyzer.",
    );
  }

  return suggestions;
}

export function analyzePin(pin, options = {}) {
  if (typeof pin !== "string") {
    throw new TypeError("PIN must be a string.");
  }

  if (pin.length === 0) {
    return {
      score: 0,
      strength: "Not analyzed",
      entropy: 0,
      searchSpace: 0,
      crackTime: {
        seconds: 0,
        label: "Instant",
      },
      checks: {
        length: 0,
        validDigits: false,
        repeatedDigits: false,
        sequentialPattern: false,
        commonPin: false,
      },
      suggestions: [
        "Generate or enter a PIN to begin analysis.",
      ],
    };
  }

  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const validDigits = /^\d+$/.test(pin);
  const repeatedDigits = hasRepeatedDigits(pin);
  const sequentialPattern = hasSequentialPattern(pin);
  const commonPin = isCommonPin(pin);

  if (!validDigits) {
    return {
      score: 0,
      strength: "Invalid",
      entropy: 0,
      searchSpace: 0,
      crackTime: {
        seconds: 0,
        label: "Unavailable",
      },
      checks: {
        length: pin.length,
        validDigits: false,
        repeatedDigits,
        sequentialPattern,
        commonPin,
      },
      suggestions: [
        "A PIN must contain digits only.",
      ],
    };
  }

  const entropy = calculatePinEntropy(pin.length);

  const searchSpace = calculatePinSearchSpace(
    pin.length,
    config.noRepeats,
  );

  const score = calculatePinScore(
    pin,
    config,
  );

  const crackTime = estimatePinCrackTime(
    entropy,
  );

  return {
    score,
    strength: getStrength(score),
    entropy,
    searchSpace,
    crackTime,
    checks: {
      length: pin.length,
      validDigits,
      repeatedDigits,
      sequentialPattern,
      commonPin,
    },
    suggestions: getSuggestions(
      pin,
      config,
    ),
  };
}

export function getDefaultPinOptions() {
  return {
    ...DEFAULT_OPTIONS,
  };
}

export function generatePin(options = {}) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (
    !Number.isInteger(config.length) ||
    config.length < 4 ||
    config.length > 12
  ) {
    throw new RangeError(
      "PIN length must be between 4 and 12.",
    );
  }

  if (
    config.noRepeats &&
    config.length > 10
  ) {
    throw new RangeError(
      "A PIN with no repeated digits cannot be longer than 10 digits.",
    );
  }

  const maxAttempts = 5000;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt += 1
  ) {
    const pin = generateCandidate(
      config.length,
      config.noRepeats,
    );

    if (
      config.avoidSequential &&
      hasSequentialPattern(pin)
    ) {
      continue;
    }

    if (
      config.avoidCommon &&
      isCommonPin(pin)
    ) {
      continue;
    }

    return pin;
  }

  throw new Error(
    "Unable to generate a PIN matching the selected security rules.",
  );
}