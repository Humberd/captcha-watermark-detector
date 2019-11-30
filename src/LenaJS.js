LenaJS = {};

LenaJS.convolution = function(pixels, weights) {
  var side = Math.round(Math.sqrt(weights.length)),
      halfSide = Math.floor(side / 2),
      src = pixels.data,
      canvasWidth = pixels.width,
      canvasHeight = pixels.height,
      temporaryCanvas = document.createElement('canvas'),
      temporaryCtx = temporaryCanvas.getContext('2d'),
      outputData = temporaryCtx.createImageData(canvasWidth, canvasHeight);

  for (var y = 0; y < canvasHeight; y++) {

    for (var x = 0; x < canvasWidth; x++) {

      var dstOff = (y * canvasWidth + x) * 4,
          sumReds = 0,
          sumGreens = 0,
          sumBlues = 0;

      for (var kernelY = 0; kernelY < side; kernelY++) {
        for (var kernelX = 0; kernelX < side; kernelX++) {

          var currentKernelY = y + kernelY - halfSide,
              currentKernelX = x + kernelX - halfSide;

          if (currentKernelY >= 0 &&
              currentKernelY < canvasHeight &&
              currentKernelX >= 0 &&
              currentKernelX < canvasWidth) {

            var offset = (currentKernelY * canvasWidth + currentKernelX) * 4,
                weight = weights[kernelY * side + kernelX];

            sumReds += src[offset] * weight;
            sumGreens += src[offset + 1] * weight;
            sumBlues += src[offset + 2] * weight;
          }
        }
      }

      outputData.data[dstOff] = sumReds;
      outputData.data[dstOff + 1] = sumGreens;
      outputData.data[dstOff + 2] = sumBlues;
      outputData.data[dstOff + 3] = 255;
    }
  }
  return outputData;
};

LenaJS.cloneImageData = function(pixels) {
  return document.createElement('canvas').getContext('2d').createImageData(pixels.width, pixels.height);
};

LenaJS.highpass = function(pixels) {
  var operator = [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1,
  ];

  return LenaJS.convolution(pixels, operator);
};

LenaJS.thresholding = function(pixels, threshold) {
  const newPixels = LenaJS.cloneImageData(pixels);
  for (var i = 0; i < pixels.data.length; i += 4) {
    var r = pixels.data[i],
        g = pixels.data[i + 1],
        b = pixels.data[i + 2];

    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    var thr = threshold || 128;

    newPixels.data[i] = newPixels.data[i + 1] = newPixels.data[i + 2] = v > thr ? 255 : 0;
    newPixels.data[i + 3] = pixels.data[i + 3];
  }

  return newPixels;
};

LenaJS.sharpen = function(pixels) {
  var operator = [
    0, -0.2, 0,
    -0.2, 1.8, -0.2,
    0, -0.2, 0,
  ];

  return LenaJS.convolution(pixels, operator);
};
