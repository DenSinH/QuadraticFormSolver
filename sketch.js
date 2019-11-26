let a, h, b;
let f;
let n;

let startBase;
let stage = "waiting";
let found = new Set();
let foundLines = [];
let foundVals = [];
let to_explore_from = [];
let well;

let baseLength = 50;
let baseTextSize = 12;

function getDefaultVals() {
  return [{
    size: baseTextSize,
    pos: createVector(-baseLength/3, -baseLength / 3),
    val: startBase.vals[0]
  },
    {
      size: baseTextSize,
      pos: createVector(-baseLength/3, baseLength / 3),
      val: startBase.vals[1]
    },
    {
      size: baseTextSize,
      pos: createVector(baseLength / 3, 0),
      val: startBase.vals[2]
    }]
}

function init(sB) {
  found = new Set();
  found.add(sorted(sB.vals).toString());
  to_explore_from = [sB];
  foundVals = getDefaultVals();
  foundLines = [];
  well = sB.oftype === "well";
}

// when pressing the start button, initialize everything
function proceed() {
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

  init(startBase);

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

  for (let l of foundLines) {
    switch (l.type) {
      case "river":
        strokeWeight(6 / zoom);
        break;
      case "lakeside":
        strokeWeight(6 / zoom);
        break;
      default:
        strokeWeight(2 / zoom);
    }
    line(l.x1, l.y1, l.x2, l.y2)
  }

  for (let t of foundVals) {
    textSize(t.size);
    text(t.val, t.pos.x, t.pos.y);
  }

  if (well) {
    stroke(255, 0, 0);
    strokeWeight(20 / zoom);
    point(0, 0);
  }

  // if we are not looking for a starting position, and we are not done (yet), but we have nothing to do, finish
  if (stage === "find solution" && to_explore_from.length === 0) {
    alert("NO SOLUTION FOUND");
    console.log("NO SOLUTION FOUND");
    stage = "done";
  }

  // dont calculate anything until we have started or when we are done
  if (stage === "waiting" || stage === "done") {
    return;
  }

  // find the starting position by moving away from the maximum
  if (stage === "find start") {
    let m_i = startBase.max();
    startBase = startBase.move_away(startBase.vals[m_i], startBase.points[m_i]).nxt;
    startBase.check();
    if (startBase.oftype !== "normal") {
      startBase.pos = createVector(0, 0);
      startBase.prev_pos = createVector(-baseLength, 0);
      startBase.dist = 0;
      stage = "find solution";
      init(startBase);
    }
    return;
  }

  // explore one superbase we havent yet
  let current = to_explore_from.pop();
  let txt = "";
  for (let _i = 0; _i < 3; _i++) {
    txt += current.points[_i].x.toString() + "," + current.points[_i].y + " : " + current.vals[_i] + "<br/>"
  }
  $("#log").html(txt);
  for (let _i = 0; _i < 3; _i++) {
    tryadd = false;
    // next superbase and value
    let superBaseData = current.move_away(current.vals[_i], current.points[_i]);
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
    if (!found.has(data)) {
      if (tryadd) {
        to_explore_from.push(nxt);
        found.add(data);
      }

      foundLines.push({
        x1: nxt.prev_pos.x,
        x2: nxt.pos.x,
        y1: nxt.prev_pos.y,
        y2: nxt.pos.y,
        type: nxt.oftype
      });
      foundVals.push(superBaseData.text);

    }
  }
}


// zooming functionality
function keyPressed()
{
  if (key === 'r')
  {
    zoom = 1;
    offset.x = 0;
    offset.y = 0;
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
