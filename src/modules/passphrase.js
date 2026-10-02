const DEFAULT_WORDS = [
  "apple",
  "anchor",
  "arrow",
  "autumn",
  "beacon",
  "berry",
  "birch",
  "blue",
  "bridge",
  "canyon",
  "candle",
  "cedar",
  "cloud",
  "comet",
  "coral",
  "crystal",
  "dawn",
  "desert",
  "dream",
  "eagle",
  "ember",
  "falcon",
  "forest",
  "galaxy",
  "garden",
  "glacier",
  "harbor",
  "horizon",
  "island",
  "jungle",
  "lantern",
  "maple",
  "meadow",
  "meteor",
  "moon",
  "mountain",
  "ocean",
  "orchard",
  "pebble",
  "planet",
  "rain",
  "river",
  "rocket",
  "shadow",
  "silver",
  "snow",
  "solar",
  "spark",
  "stone",
  "storm",
  "sunset",
  "thunder",
  "tiger",
  "valley",
  "violet",
  "water",
  "willow",
  "winter",
];

const DEFAULT_OPTIONS = {
  wordCount: 5,
  separator: "-",
  capitalize: false,
  addNumber: false,
  addSymbol: false,
};

const SYMBOLS = "!@#$%^&*";

function secureRandomInt(max) {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError("Maximum must be a positive integer.");
  }

  const randomValues = new Uint32Array(1);

  // Rejection sampling avoids modulo bias.
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  do {
    crypto.getRandomValues(randomValues);
  } while (randomValues[0] >= limit);

  return randomValues[0] % max;
}

function getRandomItem(items) {
  return items[secureRandomInt(items.length)];
}

function capitalizeWord(word) {
  if (word.length === 0) {
    return word;
  }

  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateNumber() {
  return String(secureRandomInt(10));
}

function generateSymbol() {
  return getRandomItem(SYMBOLS.split(""));
}

export function getDefaultPassphraseOptions() {
  return { ...DEFAULT_OPTIONS };
}

export function getWordList() {
  return [...DEFAULT_WORDS];
}

export function calculatePassphraseEntropy(wordCount, wordListSize = DEFAULT_WORDS.length) {
  if (!Number.isInteger(wordCount) || wordCount <= 0) {
    return 0;
  }

  if (!Number.isInteger(wordListSize) || wordListSize <= 1) {
    return 0;
  }

  return wordCount * Math.log2(wordListSize);
}

export function generatePassphrase(options = {}) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (
    !Number.isInteger(config.wordCount) ||
    config.wordCount < 4 ||
    config.wordCount > 12
  ) {
    throw new RangeError("Word count must be between 4 and 12.");
  }

  if (typeof config.separator !== "string") {
    throw new TypeError("Separator must be a string.");
  }

  const words = [];

  for (let index = 0; index < config.wordCount; index += 1) {
    let word = getRandomItem(DEFAULT_WORDS);

    if (config.capitalize) {
      word = capitalizeWord(word);
    }

    words.push(word);
  }

  let passphrase = words.join(config.separator);

  if (config.addNumber) {
    passphrase += generateNumber();
  }

  if (config.addSymbol) {
    passphrase += generateSymbol();
  }

  return passphrase;
}