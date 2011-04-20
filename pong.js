const PI = 3.1415926;
var size = 150;

function Pong(ctx) {
  this.ctx = ctx;
  this.ball = {x: 0.5, y: 0.5, a: PI + 1};
  this.p1 = 0.5;
  this.p2 = 0.5;
  this.step = 0.05
  this.ctx.strokeStyle = "white";
  this.ctx.lineWidth = 5;
};

Pong.prototype.paint = function() {
  this.ctx.clearRect(0, 0, size, size);
  this.ctx.fillStyle = "black";

  this.ctx.fillRect(0, 0, size / 2 - 1, size);
  this.ctx.fillRect(size / 2 + 1, 0, size / 2 - 1, size);

  this.ctx.strokeCircle(size / 2, size / 2, 25);

  this.ctx.fillStyle = "#0f0";
  this.ctx.fillCircle(this.ball.x * size, this.ball.y * size, 12);
  this.ctx.fillStyle = "#f00";
  this.ctx.fillRect(size - 17, size * this.p1 - 10, 6, 20);
  this.ctx.fillRect(11, size * this.p2 - 10, 6, 20);
};

Pong.prototype.update = function() {
  this.ball.x += this.step * Math.cos(this.ball.a);
  this.ball.y += this.step * Math.sin(this.ball.a);

  if (this.ball.y < 0) {
    this.ball.a *= -1;
  }

  if (this.ball.y > 1) {
    this.ball.a *= -1;
  }

  if (this.ball.x < 0.1) {
    this.ball.a -= PI;
    this.ball.a *= -1;
  }

  if (this.ball.x > 0.9) {
    this.ball.a *= -1;
    this.ball.a -= PI;
  }

  if (this.ball.x > 0.5) {
    if (this.p1 > this.ball.y + 0.1) {
      this.p1 -= 0.05;
    } else {
      if (this.p1 < this.ball.y - 0.1) {
        this.p1 += 0.05;
      }
    }
    if (this.p2 != 0.5) {
      if (this.p2 > 0.5)
        this.p2 -= 0.05;
      else
        this.p2 += 0.05;
    }
  } else {
    if (this.p2 > this.ball.y + 0.1) {
      this.p2 -= 0.05;
    } else {
      if (this.p2 < this.ball.y - 0.1) {
        this.p2 += 0.05;
      }
    }
    if (this.p1 != 0.5) {
      if (this.p1 > 0.5)
        this.p1 -= 0.05;
      else
        this.p1 += 0.05;
    }
  }

  this.paint();
  var self = this;
  window.requestAnimFrame(function() {self.update()});
};

// http://webreflection.blogspot.com/2009/01/ellipse-and-circle-for-canvas-2d.html
(function(){
  // Andrea Giammarchi - Mit Style License
  var extend = {
    // Circle methods
    circle:function(aX, aY, aDiameter){
      this.ellipse(aX, aY, aDiameter, aDiameter);
    },
    fillCircle:function(aX, aY, aDiameter){
      this.beginPath();
      this.circle(aX, aY, aDiameter);
      this.fill();
    },
    strokeCircle:function(aX, aY, aDiameter){
      this.beginPath();
      this.circle(aX, aY, aDiameter);
      this.stroke();
    },
    // Ellipse methods
    ellipse:function(aX, aY, aWidth, aHeight){
      aX -= aWidth / 2;
      aY -= aHeight / 2;
      var hB = (aWidth / 2) * .5522848,
      vB = (aHeight / 2) * .5522848,
      eX = aX + aWidth,
      eY = aY + aHeight,
      mX = aX + aWidth / 2,
      mY = aY + aHeight / 2;
      this.moveTo(aX, mY);
      this.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
      this.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
      this.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
      this.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
      this.closePath();
    },
    fillEllipse:function(aX, aY, aWidth, aHeight){
      this.beginPath();
      this.ellipse(aX, aY, aWidth, aHeight);
      this.fill();
    },
    strokeEllipse:function(aX, aY, aWidth, aHeight){
      this.beginPath();
      this.ellipse(aX, aY, aWidth, aHeight);
      this.stroke();
    }
  };

  for(var key in extend)
    CanvasRenderingContext2D.prototype[key] = extend[key];
})();

window.addEventListener("load", function() {
    var pongCtx = document.getElementById("pong").getContext("2d");
    var pong = new Pong(pongCtx);
    pong.update();
}, true);
