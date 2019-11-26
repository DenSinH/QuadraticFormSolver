import numpy as np
from pprint import pformat
from warnings import warn
import math


a = 3
h = 6
b = -5
f = lambda x, y: a*x**2 + h*x*y + b*y**2

def combinations(vals):
    for i in range(3):
        yield vals[i], (vals[(i + 1) % 3], vals[(i + 2) % 3])


class SuperBase(object):

    def __init__(self, vals):
        self.vals = vals  # [(val, [x y]),...]
        if len(self.vals) != 3:
            warn(str(self.vals))

        if 0 in vals:
            self.oftype = "lakeside"
        elif any(v[0] < 0 for v in self.vals) and any(v[0] > 0 for v in self.vals):
                self.oftype = "river"
        else:
            for s, d in combinations(list(self.vals)):
                if abs(d[0][0]) + abs(d[1][0]) < abs(s[0]):
                    self.oftype = "normal"
                    break
            else:
                self.oftype = "well"

    def values(self):
        for v in self.vals:
            yield v[0]

    def __hash__(self):
        # SuperBases are equal if their values are equal
        return hash((p for p in sorted(self.values())))

    def __eq__(self, other):
        if isinstance(other, SuperBase):
            # SuperBases are equal if their values are equal
            return set(self.values()) == set(other.values())
        raise TypeError

    def __ne__(self, other):
        return not (self == other)

    def __repr__(self):
        return pformat(self.vals, indent=4)

    def prod(self):
        p = 1
        for i in self.values():
            p *= i
        return p

    def check(self, n):
        for v in self.vals:
            frac = max(n / v[0], v[0] / n, key=lambda x: abs(x))
            if frac < 0:
                return False
            if int(math.sqrt(frac))**2 == frac:
                coords = (math.sqrt(frac)*v[1] if n >= v[0] else v[1] / math.sqrt(frac)).astype(int)
                print(f"{n} FOUND AT POINT {coords}")
                print(f"{a}*({coords[0]})**2 + {h}*{coords[0]}*{coords[1]} + {b}({coords[1]})**2 == {f(*coords)}")
                quit()
        return False

    def max(self):
        return max((v for v in self.vals), key=lambda v: abs(v[0]))

    def move_away(self, m):
        global n
        # we know that this maximum is singular if the type is normal, since otherwise oftype would be well

        others = []
        m_found = False
        for v in self.vals:
            if v[0] == m[0] and np.all(v[1] == m[1]) and not m_found:
                m_found = True
                continue

            others.append(v)

        new_val = 2*(others[0][0] + others[1][0]) - m[0]

        new_point = others[0][1] + others[1][1]
        if np.all(new_point == m[1]) or np.all(new_point == -m[1]):
            new_point = others[0][1] - others[1][1]

        nxt = SuperBase(
            others + [(new_val, new_point)]
        )
        nxt.check(n)
        return new_val, nxt


n = int(input("n: "))

start = SuperBase([
    (f(*point), np.array(point, dtype=int)) for point in ((1, 0), (0, 1), (1, 1))
])
start.check(n)

"""FIND STARTING POSITION"""
while start.oftype == "normal":
    _, start = start.move_away(start.max())
    start.check(n)

print(start, start.oftype)

found = {start}
to_explore_from = {start}

while to_explore_from:
    current = to_explore_from.pop()
    #print(current.vals, current.oftype)
    for v in current.vals:
        tryadd = False
        new_value, new = current.move_away(v)  # don't check new value, along the river anything might happen
        if current.oftype == "river":
            if n * current.prod() > 0:
                if n * v[0] < 0:
                    tryadd = True

            else:
                tryadd = True

        elif current.oftype == "lakeside":
            # if n == 0 we have already found it, so we don't have to worry about this case
            if n * v[0] <= 0:
                if abs(new_value) < abs(n):  # values only get larger absolutely
                    tryadd = True

        else:  # well or normal, move away from all points, the one we came from will not be explored
            if abs(new_value) < abs(n):  # values only get larger absolutely
                tryadd = True

        # print(new_value, tryadd)
        if tryadd:
            if new not in found:
                to_explore_from.add(new)
                found.add(new)

print(f"{n} IS NOT A SOLUTION OF {a}x**2 + {h}xy + {b}y**2")
