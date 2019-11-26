let decreaseVal = 5;  // 5 gave no overlap

class SuperBase {
    constructor(pos, prev_pos, dist, vals, points) {
        this.pos = pos;
        this.prev_pos = prev_pos;
        this.dist = dist;
        this.vals = vals;
        this.points = points;  // (x, y) coordinates, input for f

        // assert that we have proper input (shouldn't go wrong)
        if (this.vals.length !== 3) {
            throw "Length is not 3";
        }

        // check type of superbase
        if (this.vals.includes(0)) {
            // lakesides are next to 0-lakes
            this.oftype = "lakeside";
        } else {
            let n = false;  // negative value
            let p = false;  // positive value
            this.vals.forEach(function (item) {
                if (item < 0) {
                    n = true;
                } else {
                    p = true
                }
            });

            if (n && p) {
                // rivers have both positive and negative lakes
                this.oftype = "river"
            } else {
                for (let comb of combinations(this.vals)) {
                    if (Math.abs(comb.d[0]) + Math.abs(comb.d[1]) < Math.abs(comb.s)) {
                        this.oftype = "normal";
                        break;
                    }
                }
                if (!this.oftype) {
                    // wells fulfill the above condition for all combinations
                    this.oftype = "well"
                }
            }
        }
    }

    prod() {
        // product of values (used to check for odd/even amount of negative values)
        let p = 1;
        for (let v of this.vals) {
            p *= v;
        }
        return p;
    }

    check() {
        // find if we have a solution
        for (let i = 0; i < 3; i++) {
            let frac;
            let x, y;
            if (n >= this.vals[i]) {
                frac = n / this.vals[i];
                x = this.points[i].x * Math.sqrt(frac);
                y = this.points[i].y * Math.sqrt(frac);
            } else {
                frac = this.vals[i] / n;
                x = this.points[i].x / Math.sqrt(frac);
                y = this.points[i].y / Math.sqrt(frac);
            }
            if (frac !== 0 && 1/frac !== 0 && Math.round(Math.sqrt(frac))**2 === frac) {
                stage = "done";
                alert("f(" + x.toString() + "," + y.toString() + ") = " + n);
                console.log(n + " FOUND");
                return;
            } else if (n === 0) {
                stage = "done";
                alert("f(0, 0) = " + n);
                return;
            }
        }
    }

    max() {
        // find the index for the maximum value of this superbase
        let m = 0;
        let m_i = 0;
        for (let i = 0; i < 3; i++) {
            if (Math.abs(this.vals[i]) > Math.abs(m)) {
                m = this.vals[i];
                m_i = i;
            }
        }
        return m_i;
    }

    move_away(m, p) {
        // move away from the value and point specified as arguments, rot is argument to determine the next point in the
        // canvas
        let other_vals = [];
        let other_points = [];
        let m_found = false;
        let m_i;

        // find the other 2 values and points
        for (let i = 0; i < 3; i++) {
            if (this.vals[i] === m && this.points[i] === p && !m_found) {
                m_found = true;
                m_i = i;
                continue;
            }
            other_vals.push(this.vals[i]);
            other_points.push(this.points[i]);
        }

        // calculate the next value and the next coordinates of the new superbase
        let new_val = 2*(other_vals[0] + other_vals[1]) - m;
        let new_point = createVector(
            other_points[0].x + other_points[1].x,
            other_points[0].y + other_points[1].y);

        if (new_point.equals(p) || new_point.equals(createVector(-p.x, -p.y))) {
            new_point = createVector(
                other_points[0].x - other_points[1].x,
                other_points[0].y - other_points[1].y);
        }

        // create a new superbase
        let newPos = createVector(this.pos.x, this.pos.y);
        let textPos = createVector(this.pos.x, this.pos.y);
        let textSize = baseTextSize / (this.dist + 1);
        let diff = createVector(this.pos.x - this.prev_pos.x, this.pos.y - this.prev_pos.y);
        diff.mult(decreaseVal / (this.dist + decreaseVal));

        let ang;
        switch (m_i) {
            case 0:
                ang = -45 * (0.5 + 1/(1 + this.dist));
                break;
            case 1:
                ang = 45 * (0.5 + 1/(1 + this.dist));
                break;
            default:
                ang=180;
        }
        diff = rotateVector(diff, ang);
        newPos.add(diff);

        diff.mult(1.5);
        textPos.add(diff);
        textPos.sub(createVector(textSize / 2, 0));


        let nxt = new SuperBase(
            newPos,
            createVector(this.pos.x, this.pos.y),
            this.dist + 1,
            [...other_vals, new_val],
            [...other_points, new_point]
        );

        // check if we found a solution and return
        nxt.check();
        return {
            "new_val": new_val,
            "nxt": nxt,
            "text": {
                "val": new_val,
                "pos": textPos,
                "size": textSize
            }
        }

    }

}