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