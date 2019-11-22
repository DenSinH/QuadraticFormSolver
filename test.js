// Daniel Shiffman
// Hanukkah 2011
// 8 nights of Processing examples
// http://www.shiffman.net

// The scale of our world
let zoom;
// A vector to store the offset from the center
let offset;
// The previous offset
let poffset;
// A vector for the mouse position
let mouse;

function setup() {
    createCanvas(600, 400);
    zoom = 1.0;
    offset = createVector(0, 0);
    poffset = createVector(0, 0);

    smooth();
}

function draw() {
    background(255);
    push();
    // Everything must be drawn relative to center
    translate(width/2, height/2);

    // Use scale for 2D "zoom"
    scale(zoom);
    // The offset (note how we scale according to the zoom)
    translate(offset.x/zoom, offset.y/zoom);

    // An arbitrary design so that we have something to see!
    randomSeed(1);
    for (let i = 0; i < 500; i++) {
        stroke(0);
        noFill();
        rectMode(CENTER);
        let h = 100;
        if (random(1) < 0.5) {
            rect(random(-h,h),random(-h,h),12,12);
        } else {
            ellipse(random(-h,h),random(-h,h),12,12);
        }
    }
    pop();

    // Draw some text (not panned or zoomed!)
    fill(0);
    text("a: zoom in\nz: zoom out\ndrag mouse to pan",10,32);


}

// Zoom in and out when the key is pressed
function mouseWheel() {
    zoom -= event.delta / 1000;
    zoom = constrain(zoom,0,100);
}

// Store the mouse and the previous offset
function mousePressed() {
    mouse = createVector(mouseX, mouseY);
    poffset.set(offset);
}

// Calculate the new offset based on change in mouse vs. previous offsey
function mouseDragged() {
    offset.x = mouseX - mouse.x + poffset.x;
    offset.y = mouseY - mouse.y + poffset.y;
}