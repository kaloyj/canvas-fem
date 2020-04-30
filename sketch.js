const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palette = require("nice-color-palettes");

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2048, 2048],
};

const sketch = () => {
  const colorCount = random.rangeFloor(1, 6);
  const selectedPalette = random
    .shuffle(random.pick(palette))
    .slice(0, colorCount);

  const createGrid = () => {
    const points = [];
    const count = 6;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = x / (count - 1);
        const v = y / (count - 1);

        points.push([u, v]);
      }
    }

    return points;
  };

  const usedPoints = [];
  const points = createGrid();
  const margin = 200;

  const getRandomUnusedIndex = (ndx) => {
    if (typeof ndx == "number" && !usedPoints.some((up) => up == ndx))
      return ndx;

    const randomIndex = random.rangeFloor(0, points.length);

    return getRandomUnusedIndex(randomIndex);
  };

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    while (usedPoints.length != points.length) {
      const firstPoint = getRandomUnusedIndex();
      usedPoints.push(firstPoint);

      const secondPoint = getRandomUnusedIndex();
      usedPoints.push(secondPoint);

      const firstPosition = points[firstPoint];
      const secondPosition = points[secondPoint];

      const [x1, y1] = [
        lerp(margin, width - margin, firstPosition[0]),
        lerp(margin, height - margin, firstPosition[1]),
      ];

      const [x2, y2] = [
        lerp(margin, width - margin, secondPosition[0]),
        lerp(margin, height - margin, secondPosition[1]),
      ];

      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x2, height - margin);
      context.lineTo(x1, height - margin);
      context.closePath();
      context.strokeStyle = "white";
      context.lineWidth = 0.025 * width;
      context.stroke();
      context.fillStyle = random.pick(selectedPalette);
      context.fill();
    }
  };
};

canvasSketch(sketch, settings);
