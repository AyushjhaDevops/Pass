const CHARACTER_POOL_SIZES = {
  uppercase: 26,
  lowercase: 26,
  numbers: 10,
  symbols: 32,
};

function getCharacterPool(password) {
  let poolSize = 0;

  if (/[A-Z]/.test(password)) {
    poolSize += CHARACTER_POOL_SIZES.uppercase;
  }

  if (/[a-z]/.test(password)) {
    poolSize += CHARACTER_POOL_SIZES.lowercase;
  }

  if (/[0-9]/.test(password)) {
    poolSize += CHARACTER_POOL_SIZES.numbers;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    poolSize += CHARACTER_POOL_SIZES.symbols;
  }

  return poolSize;
}

export function calculateSearchSpace(password) {
  if (typeof password !== "string" || password.length === 0) {
    return 0;
  }

  const poolSize = getCharacterPool(password);

  if (poolSize === 0) {
    return 0;
  }

  return poolSize ** password.length;
}

export function calculateEntropy(password) {
  if (typeof password !== "string" || password.length === 0) {
    return 0;
  }

  const poolSize = getCharacterPool(password);

  if (poolSize === 0) {
    return 0;
  }

  return password.length * Math.log2(poolSize);
}

export function getCharacterPoolSize(password) {
  return getCharacterPool(password);
}

export function estimateCrackTime(entropyBits, guessesPerSecond = 1e10) {
  if (entropyBits <= 0) {
    return {
      seconds: 0,
      label: "Instant",
    };
  }

  const possibleGuesses = 2 ** entropyBits;
  const seconds = possibleGuesses / guessesPerSecond;

  return {
    seconds,
    label: formatCrackTime(seconds),
  };
}

function formatCrackTime(seconds) {
  if (seconds < 1) {
    return "Less than a second";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }

  if (seconds < 3600) {
    return `${Math.round(seconds / 60)} minutes`;
  }

  if (seconds < 86400) {
    return `${Math.round(seconds / 3600)} hours`;
  }

  if (seconds < 31536000) {
    return `${Math.round(seconds / 86400)} days`;
  }

  if (seconds < 31536000 * 100) {
    return `${Math.round(seconds / 31536000)} years`;
  }

  if (seconds < 31536000 * 1000000) {
    return `${Math.round(seconds / 31536000).toLocaleString()} years`;
  }

  return "Millions of years";
}