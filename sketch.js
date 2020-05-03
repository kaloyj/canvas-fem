const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const GRID_POINTS_X = 6;
const GRID_POINTS_Y = 4;

random.setSeed(random.getRandomSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: [1920, 1080],
};

const sketch = () => {
  const createGrid = () => {
    const points = [];

    for (let x = 0; x < GRID_POINTS_X; x++) {
      for (let y = 0; y < GRID_POINTS_Y; y++) {
        const u = x / (GRID_POINTS_X - 1);
        const v = y / (GRID_POINTS_Y - 1);

        points.push({ position: [u, v], selected: false });
      }
    }

    return points;
  };

  const usedPoints = [];
  const points = createGrid();
  const pathByIndex = [];
  const margin = 0;

  // calc waypoints traveling along vertices
  // from http://jsfiddle.net/Zeaklous/7faRQ/1029/
  const calcWaypoints = (vertices) => {
    var waypoints = [];
    for (var i = 1; i < vertices.length; i++) {
      var pt0 = vertices[i - 1];
      var pt1 = vertices[i];
      var dx = pt1[0] - pt0[0];
      var dy = pt1[1] - pt0[1];
      for (var j = 0; j < 100; j++) {
        var x = pt0[0] + (dx * j) / 100;
        var y = pt0[1] + (dy * j) / 100;
        waypoints.push([x, y]);
      }
    }
    return waypoints;
  };

  const getRandomUnusedIndex = (ndx) => {
    if (typeof ndx == "number" && !usedPoints.some((up) => up == ndx))
      return ndx;

    const randomIndex = random.rangeFloor(0, points.length);

    return getRandomUnusedIndex(randomIndex);
  };

  const animateGroup = (context, width) => {
    for (let ndx = 0; ndx < pathByIndex.length; ndx++) {
      const path = calcWaypoints(pathByIndex[ndx]);
      context.strokeStyle = "white";
      context.save();

      let i = 1;

      function animate() {
        if (i < path.length - 1) {
          window.requestAnimationFrame(animate);
        }

        const [x2, y2] = path[i];
        const [x1, y1] = path[i - 1];

        context.beginPath();

        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineWidth = 0.0075 * width;
        context.stroke();
        i++;
      }

      animate();
    }
  };

  return ({ context, width, height }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    // animation outline
    // creates the path for animation
    for (let i = 0; i < GRID_POINTS_X; i++) {
      let randomIndex = random.rangeFloor(0, points.length);
      context.beginPath();
      for (let j = 0; j < GRID_POINTS_Y; j++) {
        let { position, selected } = points[randomIndex];

        const [x1, y1] = [
          lerp(margin, width - margin, position[0]),
          lerp(margin, height - margin, position[1]),
        ];

        if (j === 0) {
          context.moveTo(x1, y1);
          pathByIndex[i] = [...(pathByIndex[i] || []), [x1, y1]];
        } else if (j === GRID_POINTS_Y - 1 && !selected) {
          context.lineTo(x1, height - margin);
          pathByIndex[i] = [...(pathByIndex[i] || []), [x1, height - margin]];
        } else {
          context.lineTo(x1, y1);
          pathByIndex[i] = [...(pathByIndex[i] || []), [x1, y1]];
        }

        points[randomIndex].selected = true;
        randomIndex = random.rangeFloor(0, points.length);
      }

      context.strokeStyle = "white";
      context.lineWidth = 0.00035 * width;
      context.stroke();
    }

    animateGroup(context, width);
  };
};

canvasSketch(sketch, settings);
