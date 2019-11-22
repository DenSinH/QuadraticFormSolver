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
        console.log(n + " FOUND");
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
            console.log(frac);
            if (Math.round(Math.sqrt(frac))**2 == frac) {
                done = true;
                alert("f(" + x.toString() + "," + y.toString() + ") = " + n);
                console.log("f(" + x.toString() + "," + y.toString() + ") = " + n);
                console.log(f(x,y));
                return true;
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

    move_away(m, p, rot=0) {
        // move away from the value and point specified as arguments, rot is argument to determine the next point in the
        // canvas
        let other_vals = [];
        let other_points = [];
        let m_found = false;

        // find the other 2 values and points
        for (let i = 0; i < 3; i++) {
            if (this.vals[i] === m && this.points[i] === p && !m_found) {
                m_found = true;
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
        let diff = createVector(this.pos.x - this.prev_pos.x, this.pos.y - this.prev_pos.y);
        diff.mult(5 / (this.dist + 5));
        newPos.add(rotateVector(diff, rot*120));

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
            "nxt": nxt
        }

    }

}