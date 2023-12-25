:title Property Based Testing
:description Using randomness to assert properties of software
:date 2020-05-05

<script type="application/javascript" src="triangularizationDemo.dist.js"></script>

When building a drawing application I ran into a challenge: how can I use the pressures and angles in a series of input events to render a stroke with thickness?

Each event contains an x and y coordinate as well as a pressure value and an angle.
The pressure and cosine of the angle can be used to compute a desired thickness at each input event.
With these three values - x, y, thickness - we need to generate a series of triangles which represent the desired stroke shape.

This is not a new problem.
Many algorithms exist to solve this exact scenario.
And while the problem space is fascinating, for the purpose of this post I chose to use one of the simplest[^1].

The algorithm starts by first constructing the line segment for each consecutive pair of points.
This produces a chain of line segments with gaps at every change in angle.
To compensate, we then compute the miter angle for each joint.
This miter angle is then used to fill in the gaps and remove any overlaps.

This approach can create sharp corners that break the flow of the line.
To use this algorithm in an actual application, some amount of smoothing or interpolation should be done on the input event stream first.

<style>
canvas { max-width: 100%; }
button { font-size: 1em; padding: 0.2em; }
</style>
<div id="triangularizationDemo"></div>

Here is an implementation.

    const Vector = require('vectory')

    const lineNormal = (a, b) => {
      let d = Vector.sub(a, b || new Vector(0, 0))
        let n0 = Vector.normalize(new Vector(-d.y, d.x))
        let n1 = Vector.normalize(new Vector(d.y, -d.x))

        return {n0, n1}
    }

    const addLineEnd = (triangleStrip, start, end, thickness) => {
      let halfThickness = thickness * 0.5
        let { n0, n1 } = lineNormal(start, end)
        triangleStrip.push(Vector.add(start, Vector.mul(halfThickness, n0)))
        triangleStrip.push(Vector.add(start, Vector.mul(halfThickness, n1)))
        return triangleStrip
    }

    module.exports = (lineStrip, thicknesses) => {
      if (!lineStrip || !thicknesses) { return ['a'] }
      if (lineStrip.length < 2) { return ['b'] }
      if (lineStrip.length != thicknesses.length) { return ['c'] }

      let triangles = []
      addLineEnd(triangles, lineStrip[0], lineStrip[1], thicknesses[0])

      var i = 1
      while(i < lineStrip.length - 1) {
        let a = lineStrip[i - 1]
        let b = lineStrip[i]
        let c = lineStrip[i+1]

        let halfThickness = thicknesses[i] * 0.5

        let tangent = Vector.normalized(
          Vector.normalized(
            Vector.sub(c, b)
          ).add(Vector.normalized(Vector.sub(b, a))))

        let miter0, miter1
        if (tangent.x !== tangent.x) {
          miter0 = Vector.sub(a, b)
          miter1 = Vector.sub(c, b)
        } else {
          let {n0, n1} = lineNormal(tangent)
          miter0 = n0
          miter1 = n1
        }

        let {n0, n1} = lineNormal(a, b)
        let miterLength = Vector.dot(Vector.mul(halfThickness, n0), miter0)
        triangles.push(Vector.add(b, Vector.mul(miterLength, miter0)))
        triangles.push(Vector.add(b, Vector.mul(miterLength, miter1)))
        i += 1
      }

      addLineEnd( triangles
                , lineStrip[lineStrip.length - 1]
                , lineStrip[lineStrip.length - 2]
                , thicknesses[lineStrip.length - 1]
                )

      let temp = triangles[triangles.length - 2]
      triangles[triangles.length - 2] = triangles[triangles.length - 1]
      triangles[triangles.length - 1] = temp

      return triangles
    }

How do we test this?
What would a unit test even look like? It would likely require hand crafting a series of input events that exercises all of the edge cases; vertical lines, horizontal lines, acute angles, obtuse angles, right angles, long segments, short segments, overlapping lines, etc. And once that input sequence was constructed the output triangle strip would also need to be recorded to compare with.
The inner loop would also need to be refactored into multiple functions which would serve no purpose other than improving "testability".
Furthermore, if the algorithm were swapped out with a more sophisticated algorithm the entire test suite would need to be replaced.
A test suite using traditional unit and integration tests would have high coupling with the implementation and therefore have little value in the long term maintenance of the codebase.

Instead, let's look for a property that will be true of every triangularization, regardless of algorithm.
This property should also be true for every input.
Here is a candidate.

For any linestrip and any set of thicknesses, the triangle strip should enclose every point of the input line strip.

    test('property: the triangularized line contains all of the initial points'
        ,() => {
      let thicknessGenerator = jsc.number(0.1, 2)
      let pointGenerator = jsc.pair(jsc.number(-5, 5), jsc.number(-5, 5))
      let pointAndThicknessGenerator = jsc.pair( pointGenerator
                                              , thicknessGenerator
                                              )

      let lineInTriangularization = jsc.forall(
        jsc.tuple([ pointAndThicknessGenerator
                  , pointAndThicknessGenerator
                  , jscSet(pointAndThicknessGenerator)
                  ]),
        ([first, second, rest]) => {
          let points = [ first[0]
                      , second[0]
                      ,  ...rest.map((el) => el[0])
                      ].map((p) => Vec(p[0], p[1]))
          let thicknesses = [first[1], second[1], ...rest.map((el) => el[1])]
          if(!isUnique(points)) { return true }
          const triangleStrip = triangularize(points, thicknesses)
          return points.every((point) => intersect(point, triangleStrip))
        })

      jsc.assert(lineInTriangularization)
    })

This style of testing is typically referred to as _property based testing_.
There are libraries for property based testing in most programming languages[^2].
[JSVerify](https://jsverify.github.io/) is the most popular one in JavaScript.

Each property begins by defining the data generators to use and a predicate function.
The test runner then uses these generators to produce thousands of example inputs.
For each input, the runner evaluates the predicate function to decide if that case passes.
If every case passes, the entire test passes.
If a case fails, the testing library then attempts to shrink the input.
Shrinking seeks to find the simplest input that still fails the predicate function.
This shrinking process is a crucial step in making a property based testing library easy to use or a massive headache.

With property based testing the test suite from the implementation by forcing the author to describe the problem in two completely different ways (the property and the implementation).
This process is often difficult and requires the author to think deeply about the problem before implementing a solution[^3].
While challenging, I find this approach invaluable to writing reliable software and often default to using property based testing when I create a new library.

[^1]: The best description of this approach I found was on the [Cinder Forums](https://web.archive.org/web/20120626185810/http://forum.libcinder.org/topic/smooth-thick-lines-using-geometry-shader#23286000001269127).

[^2]: Some of my favorites are [theft](https://github.com/silentbicycle/theft) and [hypothesis](https://github.com/HypothesisWorks/hypothesis/tree/master/hypothesis-python). They both implement an auto-shrinker that manipulates the random number generator to produce simpler or more complex data instead of relying on the end user to implement their own shrinking functions.

[^3]: There are some patterns to look for to make this step easier; round tripping values through a serialize/deserialize or sign/verify loop, running two implementations (often a simplified/slow/old implementation and the new one), or by identifying mathematical properties like the one listed here.
