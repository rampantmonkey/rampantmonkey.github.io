(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const triangularize = require('./triangularize')
const Vector = require('vectory')

const renderPoints = (ctx, points) => {
  const radius = 5
  points.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = '#bc3e3e'
    ctx.fill()
  })
}

const renderLinestrip = (ctx, points) => {
  ctx.beginPath()
  ctx.strokeStyle = '#222'
  ctx.moveTo(points[0].x, points[0].y)
  points.forEach((point) => {
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  })
}

const renderTrianglestrip = (ctx, triangleStrip )=> {
  ctx.beginPath()
  ctx.strokeStyle = '#1a4f73'
  ctx.moveTo(triangleStrip[0].x, triangleStrip[0].y)
  var i = 1
  while(i < triangleStrip.length - 1) {
    let a = triangleStrip[i - 1]
    let b = triangleStrip[i + 0]
    let c = triangleStrip[i + 1]
    ctx.lineTo(b.x, b.y)
    ctx.lineTo(c.x, c.y)
    ctx.lineTo(a.x, a.y)
    ctx.moveTo(b.x, b.y)
    ctx.stroke()
    ++i
  }
}

const clearCanvas = (canvas) => {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#f6f6f6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

const initCanvas = (parent) => {
  const canvas = document.createElement('canvas')
  canvas.style.border = '1px solid #cfcfcf'
  canvas.style.borderRadius = '0.3em'
  canvas.style.display = 'block'
  canvas.style.margin = '0 auto'
  canvas.width = 720
  canvas.height = 720
  clearCanvas(canvas)
  const ctx = canvas.getContext('2d')
  parent.appendChild(canvas)

  return canvas
}

const renderCanvas = (canvas, state) => {
  clearCanvas(canvas)

  const ctx = canvas.getContext('2d')
  const lineStrip = [ new Vector(100, 100)
                    , new Vector(200, 200)
                    , new Vector(300, 250)
                    , new Vector(375, 400)
                    , new Vector(280, 500)
                    , new Vector(500, 600)
                    , new Vector(650, 550)
                    ]

  const thicknesses = [ 50
                      , 50
                      , 50
                      , 50
                      , 50
                      , 50
                      , 50
                      ]

  state.points && renderPoints(ctx, lineStrip)
  state.lines && renderLinestrip(ctx, lineStrip)
  state.triangles && renderTrianglestrip(ctx, triangularize(lineStrip, thicknesses))
}

const btn = (parent, label) => {
  const b = document.createElement('button')
  b.innerHTML = label
  b.style.margin = "0.5em"
  parent.appendChild(b)
  return b
}


(() => {
  window.addEventListener('load', () => {
    let parent = document.getElementById("triangularizationDemo") || document.body
    let btnContainer = document.createElement('div')
    btnContainer.style.margin = "0 auto"
    btnContainer.style.textAlign = "center"
    const pointsBtn = btn(btnContainer, 'Points')
    const linesBtn = btn(btnContainer, 'Line Strip')
    const trianglesBtn = btn(btnContainer, 'Triangle Strip')
    parent.appendChild(btnContainer)
    let state = {
      points: true,
      lines: true,
      triangles: true,
    }

    const canvas = initCanvas(parent, state)
    renderCanvas(canvas, state)

    pointsBtn.addEventListener('click', () => {
      state.points = !state.points
      renderCanvas(canvas, state)
    }, false)

    linesBtn.addEventListener('click', () => {
      state.lines = !state.lines
      renderCanvas(canvas, state)
    }, false)

    trianglesBtn.addEventListener('click', () => {
      state.triangles = !state.triangles
      renderCanvas(canvas, state)
    }, false)
  }, false)
})()

},{"./triangularize":3,"vectory":2}],2:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vector = factory());
}(this, function () { 'use strict';

  function Vector (x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Vector.displayName = 'Vector';

  Vector.from = function (data) {
    return new Vector(data[0], data[1])
  };

  Vector.fromAngle = function (angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle))
  };

  Vector.parse = function (string) {
    return Vector.from(string.trim().replace(',', ' ').split(/\s+/).map(parseFloat))
  };

  Vector.add = function (one, another) {
    return another.add(one)
  };

  Vector.prototype.add = function (vector) {
    return new Vector(this.x + vector.x, this.y + vector.y)
  };

  Vector.iadd = function (one, another) {
    return another.iadd(one)
  };

  Vector.prototype.iadd = function (vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this
  };

  Vector.sub = function (one, another) {
    return another.sub(one)
  };

  Vector.prototype.sub = function (vector) {
    return new Vector(this.x - vector.x, this.y - vector.y)
  };

  Vector.isub = function (one, another) {
    return another.isub(one)
  };

  Vector.prototype.isub = function (vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this
  };

  Vector.mul = function (scalar, vector) {
    return vector.mul(scalar)
  };

  Vector.prototype.mul = function (scalar) {
    return new Vector(this.x * scalar, this.y * scalar)
  };

  Vector.imul = function (scalar, vector) {
    return vector.imul(scalar)
  };

  Vector.prototype.imul = function (scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this
  };

  Vector.div = function (scalar, vector) {
    return vector.div(scalar)
  };

  Vector.prototype.div = function (scalar) {
    return new Vector(this.x / scalar, this.y / scalar)
  };

  Vector.idiv = function (scalar, vector) {
    return vector.idiv(scalar)
  };

  Vector.prototype.idiv = function (scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this
  };

  Vector.lerp = function (one, another, t) {
    return one.lerp(another, t)
  };

  Vector.prototype.lerp = function (vector, t) {
    var x = (1 - t) * this.x + t * vector.x;
    var y = (1 - t) * this.y + t * vector.y;
    return new Vector(x, y)
  };

  Vector.normalized = function (vector) {
    return vector.normalized()
  };

  Vector.prototype.normalized = function () {
    var x = this.x;
    var y = this.y;
    var length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      return new Vector(x / length, y / length)
    } else {
      return new Vector(0, 0)
    }
  };

  Vector.normalize = function (vector) {
    return vector.normalize()
  };

  Vector.prototype.normalize = function () {
    var x = this.x;
    var y = this.y;
    var length = Math.sqrt(x * x + y * y);
    if (length > 0) {
      this.x = x / length;
      this.y = y / length;
    }
    return this
  };

  Vector.magnitude = function (vector) {
    return vector.magnitude()
  };

  Vector.prototype.magnitude = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  };

  Vector.dot = function (one, another) {
    return another.dot(one)
  };

  Vector.prototype.dot = function (vector) {
    return this.x * vector.x + this.y * vector.y
  };

  Vector.distance = function (one, another) {
    return another.distance(one)
  };

  Vector.prototype.distance = function (vector) {
    var x = this.x - vector.x;
    var y = this.y - vector.y;
    return Math.sqrt(x * x + y * y)
  };

  Vector.angleOf = function (vector) {
    return vector.angleOf()
  };

  Vector.prototype.angleOf = function () {
    return Math.atan2(this.y, this.x)
  };

  Vector.angleTo = function (one, another) {
    return another.angleTo(one)
  };

  Vector.prototype.angleTo = function (vector) {
    return Math.acos(this.dot(vector) / (this.magnitude() * vector.magnitude()))
  };

  function rotate (vector, theta) {
    var c = Math.cos(theta);
    var s = Math.sin(theta);
    var x = vector.x;
    var y = vector.y;
    vector.x = x * c - y * s;
    vector.y = x * s + y * c;
    return vector
  }

  Vector.rotate = function (theta, vector) {
    return vector.rotate(theta)
  };

  Vector.prototype.rotate = function (theta) {
    return rotate(this.copy(), theta)
  };

  Vector.irotate = function (theta, vector) {
    return vector.irotate(theta)
  };

  Vector.prototype.irotate = function (theta) {
    return rotate(this, theta)
  };

  Vector.reset = function (one, another) {
    return another.reset(one)
  };

  Vector.prototype.reset = function (vector) {
    this.x = vector.x;
    this.y = vector.y;
    return this
  };

  Vector.zero = function (vector) {
    return vector.zero()
  };

  Vector.prototype.zero = function () {
    this.x = 0;
    this.y = 0;
    return this
  };

  Vector.set = function (x, y, vector) {
    return vector.set(x, y)
  };

  Vector.prototype.set = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
    return this
  };

  Vector.copy = function (vector) {
    return vector.copy()
  };

  Vector.prototype.copy = function () {
    return new Vector(this.x, this.y)
  };

  Vector.clone = Vector.copy;

  Vector.prototype.clone = Vector.prototype.copy;

  Vector.toJSON = function (vector) {
    return vector.toJSON()
  };

  Vector.prototype.toJSON = function () {
    return [this.x, this.y]
  };

  Vector.toString = function (vector) {
    return vector ? vector.toString() : Function.prototype.toString.call(this)
  };

  Vector.prototype.toString = function () {
    return this.x.toFixed(3) + ' ' + this.y.toFixed(3)
  };

  /* istanbul ignore else */
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Vector.prototype[Symbol.toStringTag] = 'Vector';
  }

  Vector.toArray = function (vector) {
    return vector.toArray()
  };

  Vector.prototype.toArray = function () {
    return [this.x, this.y]
  };

  var numberEpsilon = 'EPSILON' in Number ? Number.EPSILON : 2.220446049250313e-16;

  Vector.equals = function (one, another) {
    return one.equals(another)
  };

  Vector.prototype.equals = function (vector) {
    return (
      Math.abs(this.x - vector.x) < numberEpsilon &&
      Math.abs(this.y - vector.y) < numberEpsilon
    )
  };

  Vector.compare = function (one, another) {
    return one.compare(another)
  };

  Vector.prototype.compare = function (vector) {
    var thisMagnitude = this.magnitude();
    var vectorMagnitude = vector.magnitude();
    return (thisMagnitude > vectorMagnitude) - (vectorMagnitude > thisMagnitude)
  };

  Object.defineProperties(Vector.prototype, {
    xx: {
      configurable: true,
      get: function () {
        return new Vector(this.x, this.x)
      },
      set: function (vector) {
        this.x = vector.x;
        this.y = vector.x;
      }
    },
    xy: {
      configurable: true,
      get: function () {
        return new Vector(this.x, this.y)
      },
      set: function (vector) {
        this.x = vector.x;
        this.y = vector.y;
      }
    },
    yx: {
      configurable: true,
      get: function () {
        return new Vector(this.y, this.x)
      },
      set: function (vector) {
        this.x = vector.y;
        this.y = vector.x;
      }
    },
    yy: {
      configurable: true,
      get: function () {
        return new Vector(this.y, this.y)
      },
      set: function (vector) {
        this.x = vector.y;
        this.y = vector.y;
      }
    }
  });

  function VectorIterator (vector) {
    this.vector = vector;
    this.__idx = 0;
  }

  VectorIterator.prototype.next = function () {
    if (this.__idx === 0) {
      this.__idx++;
      return {
        done: false,
        value: this.vector.x
      }
    } else if (this.__idx === 1) {
      this.__idx++;
      return {
        done: false,
        value: this.vector.y
      }
    } else {
      return {
        done: true,
        value: void 0
      }
    }
  };

  /* istanbul ignore else */
  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    Vector.prototype[Symbol.iterator] = function iterator () {
      return new VectorIterator(this)
    };
  }

  return Vector;

}));

},{}],3:[function(require,module,exports){
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

  let triangleStrip = []
  addLineEnd(triangleStrip, lineStrip[0], lineStrip[1], thicknesses[0])

  var i = 1
  while(i < lineStrip.length - 1) {
    let a = lineStrip[i - 1]
    let b = lineStrip[i]
    let c = lineStrip[i+1]
    let halfThickness = thicknesses[i] * 0.5
    let tangent = Vector.normalized(Vector.normalized(Vector.sub(c, b)).add(Vector.normalized(Vector.sub(b, a))))
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
    triangleStrip.push(Vector.add(b, Vector.mul(miterLength, miter0)))
    triangleStrip.push(Vector.add(b, Vector.mul(miterLength, miter1)))
    i += 1
  }

  addLineEnd(triangleStrip,
             lineStrip[lineStrip.length - 1],
             lineStrip[lineStrip.length - 2],
             thicknesses[lineStrip.length - 1])
  let temp = triangleStrip[triangleStrip.length - 2]
  triangleStrip[triangleStrip.length - 2] = triangleStrip[triangleStrip.length - 1]
  triangleStrip[triangleStrip.length - 1] = temp

  return triangleStrip
}


},{"vectory":2}]},{},[1]);
