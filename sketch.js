let start = false;
let done = false;
let a, h, b;
let f;
let n;

// generate all (s), (d, d) combinations for a triple
function* combinations(vals) {
  for (i = 0; i < 3; i++) {
    yield {
      s: vals[i],
      d: [vals[(i + 1) % 3], vals[(i + 2) % 3]]
    }
  }
}

// return the sorted array without changing the initial one
function sorted(arr) {
  return arr.concat().sort();
}

// rotate a vector
function rotateVector(vec, ang)
{
  ang = -ang * (Math.PI/180);
  var cos = Math.cos(ang);
  var sin = Math.sin(ang);
  return createVector(Math.round(10000*(vec.x * cos - vec.y * sin))/10000,
      Math.round(10000*(vec.x * sin + vec.y * cos))/10000);
}

let startBase;
let stage = "find start";
let found = new Set();
let foundSuperBases = [];
let to_explore_from = [];

// when pressing the start button, initialize everything
function proceed() {
  start = true;
  a = parseInt($("#a").val());
  b = parseInt($("#b").val());
  h = parseInt($("#h").val());
  n = parseInt($("#n").val());

  f = function(x, y) {
    return a*x*x + h*x*y + b*y*y;
  };

  startBase = new SuperBase(
      createVector(0, 0),
      createVector( - 50, 0),
      0,
      [f(1, 0), f(0, 1), f(1, 1)],
      [createVector(1, 0), createVector(0, 1), createVector(1, 1)]
  );
  stage = (startBase.oftype === "normal") ? "find start" : "find solution";
  startBase.check();

  found = new Set();
  foundSuperBases = [];
  to_explore_from = [startBase];

  done = false;

  console.log(a, h, b);

}

// setup the canvas and all needed variables
let width;
let height;
let tryadd;

function setup() {
  width = windowWidth;
  height = windowHeight;
  createCanvas(windowWidth, windowHeight - 200);
  rectMode(CENTER);

  zoom = 1.0;
  offset = createVector(0, 0);
  poffset = createVector(0, 0);
  center = {
    x: width / 2,
    y: height / 2
  };

  smooth();

}


function draw() {
  background(255);
  // Everything must be drawn relative to center
  translate(width/2, height/2);

  // Use scale for 2D "zoom"
  scale(zoom);
  // The offset (note how we scale according to the zoom)
  translate(offset.x/zoom, offset.y/zoom);

  // draw all previously found superbases
  stroke(0, 0, 0);
  strokeWeight(2 / zoom);

  for (let superBase of foundSuperBases) {
    line(superBase.prev_pos.x, superBase.prev_pos.y, superBase.pos.x, superBase.pos.y)
  }

  // if we are not looking for a starting position, and we are not done (yet), but we have nothing to do, finish
  if (stage !== "find start" && !done && to_explore_from.length === 0) {
    alert("NO SOLUTION FOUND");
    console.log("NO SOLUTION FOUND");
    done = true;
  }

  // dont calculate anything until we have started
  if (!start || done) {
    return;
  }

  // find the starting position by moving away from the maximum
  if (stage === "find start") {
    let m_i = startBase.max();
    startBase = startBase.move_away(startBase.vals[m_i], startBase.points[m_i]).nxt;
    startBase.check();
    if (startBase.oftype !== "normal") {
      startBase.pos = createVector(0, 0);
      startBase.prev_pos = createVector(-50, 0);
      startBase.dist = 0;
      stage = "find solution";
      to_explore_from = [startBase];
      foundSuperBases = [startBase];
    }
    return;
  }

  // explore one superbase we havent yet
  let current = to_explore_from.pop();
  let rot = 1;
  for (let _i = 0; _i < 3; _i++) {
    tryadd = false;
    // next superbase and value
    let superBaseData = current.move_away(current.vals[_i], current.points[_i], rot);
    let nxt = superBaseData.nxt;
    let new_val = superBaseData.new_val;
    let data = sorted(nxt.vals).toString();

    // determine if the new superbase must be added
    if (current.oftype === "river") {
      if (n * current.prod() > 0) {
        if (n * current.vals[_i] < 0){
          tryadd = true;
        }
      } else {
            tryadd = true;
        }
      } else if (current.oftype === "lakeside") {
        if (n * current.vals[_i] <= 0) {
          if (Math.abs(new_val) < Math.abs(n)) {
            tryadd = true;
          }
        }
      } else {
        if (Math.abs(new_val) < Math.abs(n)) {
          tryadd = true
        }
    }

    // add new superbase if needed
    if (tryadd) {
      if (!found.has(data)) {
        to_explore_from.push(nxt);
        found.add(data);
        foundSuperBases.push(nxt);
        rot++;

      }
    }

  }

}


// zooming functionality
function keyPressed()
{
  if (key === 'r')
  {
    zoom = 1;
  }
}

function mouseWheel(e) {
  zoom -= event.delta / 500 * zoom;
  zoom = constrain(zoom,0,10000);
}

function mousePressed() {
  mouse = createVector(mouseX, mouseY);
  poffset.set(offset);
}

function mouseDragged() {
  offset.x = mouseX - mouse.x + poffset.x;
  offset.y = mouseY - mouse.y + poffset.y;
}
