function filterImage(pixels) {
  const layers = [];
  let lastPixels = LenaJS.highpass(pixels);
  layers.push({
    name: '1. HighPass',
    pixels: lastPixels,
  });

  lastPixels = LenaJS.sharpen(lastPixels);
  layers.push({
    name: '2. Sharpen',
    pixels: lastPixels,
  });

  lastPixels = LenaJS.thresholding(lastPixels, 200);
  layers.push({
    name: '3. Threshold',
    pixels: lastPixels,
  });

  return layers;
}

const WHITE_PIXEL = 255;
const BLACK_PIXEL = 0;

function detectWatermarkXStartPosition(pixels) {
  const rowLength = pixels.width;
  const blackWhiteChannel = pixels.data.filter((_, index) => index % 4 === 0);
  const blackWhiteChannelRows = blackWhiteChannel.reduce((previousValue, currentValue, currentIndex) => {
    // Channel values are in one dimentional array.
    // we need to convert it to 2 dimentional array, where each array is a row
    const currentRowIndex = Math.floor(currentIndex / rowLength);
    previousValue[currentRowIndex] = previousValue[currentRowIndex] || [];
    previousValue[currentRowIndex].push(currentValue);

    return previousValue;
  }, []);
  // Clearing first and last row, because they mostly have garbage values.
  blackWhiteChannelRows[0].fill(BLACK_PIXEL);
  blackWhiteChannelRows[blackWhiteChannelRows.length - 1].fill(BLACK_PIXEL);
  const analyzedRows = blackWhiteChannelRows.map(row => getRowPixels(row));
  const rowWithMostConsecutiveWhites = analyzedRows.reduce((previousValue, currentValue) => {
    if (currentValue.consecutiveWhites > previousValue.consecutiveWhites) {
      return currentValue;
    }

    return previousValue;
  }, analyzedRows[0]);

  return rowWithMostConsecutiveWhites.consecutiveWhitesStartIndex;
}

function getRowPixels(pixelsRow) {
  return {
    totalWhite: pixelsRow.filter(it => it === WHITE_PIXEL).length,
    ...getMostConsecutiveValues(pixelsRow, WHITE_PIXEL),
  };
}

function getMostConsecutiveValues(pixelsRow, searchedValue) {
  let longestSequenceLength = 0;
  let longestSequenceEndIndex = 0;
  let currentSequenceLength = 0;
  let currentSequenceEndIndex = 0;
  let previous;
  pixelsRow.forEach((pixel, pixelIndex) => {
    if (pixel !== previous) {
      currentSequenceLength = 0;
      currentSequenceEndIndex = 0;
    }

    if (pixel === searchedValue) {
      currentSequenceLength++;
      currentSequenceEndIndex = pixelIndex;
    }

    if (currentSequenceLength > longestSequenceLength) {
      longestSequenceLength = currentSequenceLength;
      longestSequenceEndIndex = currentSequenceEndIndex;
    }

    previous = pixel;
  });

  return {
    consecutiveWhites: longestSequenceLength,
    consecutiveWhitesStartIndex: longestSequenceEndIndex - longestSequenceLength,
  };
}
