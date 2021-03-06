const PI4 = 0.785398;

/* Ugly code from when I was young */

var processor = {
  doLoad: function() {
    this.displayBackground = true;
    this.video = document.getElementById("video");
    this.mirrorVideo = document.getElementById("mirrorVideo");
    var self = this;

    // Update the text while typing for the "your text" pattern
    var message = document.getElementById("message");
    message.value = "foobar";
    message.addEventListener("keyup", function() {
      this.updateText();
    }, true);
    this.updateText();

    // Init the "your drawing" pattern
    this.initPainter();

    // ... some stuffs
    this.oldShape1 = null;
    this.oldShape2 = null;

    // Set the events listeners for the main video (update button)
    this.video.addEventListener("pause", function() {
      self.updateButtons(false);
    }, false);

    this.pageLoaded = true;

    this.updateButtons(false);

    this.drawPlayer();
    this.computeFrame();
    this.updateButtons(false);
  },
  videoIsPlaying: function() {
      this.updateButtons(true);
      this.timerCallback();
  },
  drawPlayer: function() {
    this.width = this.video.videoWidth;
    this.height = this.video.videoHeight;
    this.mirrorVideo.width = this.width;
    this.mirrorVideo.height =  this.height;
    this.mirrorVideoCtx = this.mirrorVideo.getContext("2d");
    this.mirrorVideoCtx.fillStyle = "white";
    this.mirrorVideoCtx.strokeStyle = "black";
  },
  // Videos control
  playVideo: function() {
    this.video.play();
    this.videoIsPlaying();
  },
  stopVideo: function() {
    this.video.pause();
    clearTimeout(this.timeout);
  },

  // Handle the click on patterns
  updatePattern: function(elt, bg) {
    this.pattern = null;
    var old = document.querySelector("*[pattern='true']");
    if (old) {
      old.removeAttribute("pattern");
    }
    if (old === elt.parentNode && elt.id != "yourdrawing") return;
    elt.parentNode.setAttribute("pattern", "true");
    this.pattern = elt;
    this.displayBackground = bg;
    try {
        elt.play();
    } catch(e){};
  },
  // Main loop
  timerCallback: function() {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    var self = this;
    window.requestAnimFrame(function() { self.timerCallback(); });
  },

  // Update the SVG button
  updateButtons: function(play) {
    if (play) {
      document.body.classList.add("playing");
    } else {
      document.body.classList.remove("playing");
    }
  },
  // Handling some patterns (text, drawing)
  updateText: function() {
    var txt = document.getElementById("message").value;
    var ctx = document.getElementById("yourtext").getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.font = "50px bold";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.clearRect(0, 0, 150, 150);
    ctx.save();
    ctx.translate(75, 75);
    ctx.rotate(PI4);
    ctx.translate(-75, -75);
    ctx.fillText(txt, 75, 75, 150);
    ctx.restore();
  },
  clearPainter: function() {
    var elt = document.getElementById("yourdrawing");
    var ctx = elt.getContext("2d");
    ctx.clearRect(0, 0, 150, 150);
    this.oldCoord = {};
  },
  initPainter: function() {
    var drawing = false;
    var elt = document.getElementById("yourdrawing");
    var ctx = elt.getContext("2d");
    this.oldCoord = {};
    ctx.fillStyle = ctx.createPattern(document.getElementById("ff"), "repeat");

    var self = this;
    elt.addEventListener("mousedown", function() {
      drawing = true;
    }, true);
    elt.addEventListener("mouseup", function() {
      drawing = false;
      elt.removeAttribute("pattern");
    }, true);
    elt.addEventListener("mousemove", function(e) {
      if (!drawing) return;
      var x = e.clientX - elt.parentNode.parentNode.offsetLeft - elt.parentNode.offsetLeft + window.pageXOffset;
      var y = e.clientY - elt.parentNode.parentNode.offsetTop  - elt.parentNode.offsetTop + window.pageYOffset;

      x = x * 1.5;
      y = y * 1.5;

      var r = 28;
      if (self.oldCoord.x) {
        ctx.fillStyle = "rgba(250, 0, 0, 1)";
        ctx.fillCircle(self.oldCoord.x - (r+2)/2, self.oldCoord.y - (r+2)/2, r + 2);
      }
      self.oldCoord.x = x;
      self.oldCoord.y = y;
      ctx.drawImage(document.getElementById("ff"), x - r, y - r, r, r);
    }, true);
  },

  // Compute William's movements
  dist: function(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  },
  computeFrame: function() {
    this.mirrorVideoCtx.clearRect(0, 0, this.width, this.height);
    try {
      this.mirrorVideoCtx.drawImage(this.video, 0, 0, this.width, this.height);
    } catch(e) {
      return;
    }
    var frame = this.mirrorVideoCtx.getImageData(0, 0, this.width, this.height);

    var cx = null;
    var cy = null;

    var x, y;

    var weight = 0;

    var shape1 = null;
    var shape2 = null;
    var currentPoint = null;

    var r, g, b, x, y;

    var D = 25;

    var l = frame.data.length / 4;

    // We dont' need to compute each pixels
    var step = 6;
    for (var i = 0; i < l; i += step) {
      r = frame.data[i * 4 + 0];
      g = frame.data[i * 4 + 1];
      b = frame.data[i * 4 + 2];

      x = i % this.width;
      y = Math.round(i / this.width);

      // Is it a white pixel ?
      if (r > 240 && b > 240 && g > 240) {
        if (!shape1) {
          // no shape yet, create the first one
          shape1 = {};
          shape1.x = x;
          shape1.y = y;
          shape1.weight = 1;
        } else {
          // This pixel is in the first or in the second shape ?
          var d = this.dist(x, y, shape1.x, shape1.y);
          if (d < D) {
            shape1.x += 1/(shape1.weight + 1) * (x - shape1.x);
            shape1.y += 1/(shape1.weight + 1) * (y - shape1.y);
            shape1.weight++;
          } else {
            if (!shape2) {
              shape2 = {};
              shape2.x = x;
              shape2.y = y;
              shape2.weight = 1;
            } else {
              var d = this.dist(x, y, shape2.x, shape2.y);
              if (d < D) {
                shape2.x += 1/(shape2.weight + 1) * (x - shape2.x);
                shape2.y += 1/(shape2.weight + 1) * (y - shape2.y);
                shape2.weight++;
              }
            }
          }
        }
      }
      if (x >= (this.width - step)) i+= step * this.width;
    }
    // We didn't find any shape
    if (!shape1 || !shape2) return;

    // Ok, we've got all the needed shapes
    // Find the correct shape (to avoid a flip)
    if (this.oldShape1) {
      var dist1 = this.dist(shape1.x, shape1.y, this.oldShape1.x, this.oldShape1.y);
      var dist2 = this.dist(shape1.x, shape1.y, this.oldShape2.x, this.oldShape2.y);

      if (dist2 < dist1) {
        var tmp = shape2;
        shape2 = shape1;
        shape1 = tmp;
      }
    }

    // Save the shape positions
    this.oldShape1 = shape1;
    this.oldShape2 = shape2;

    // A set of transformations
    this.mirrorVideoCtx.save();

    var d = this.dist(shape2.x, shape2.y, shape1.x, shape1.y);
    var a = Math.acos((shape1.x - shape2.x) / d);
    var delta = d / 141;
    this.mirrorVideoCtx.translate(shape2.x, shape2.y);
    if (shape2.y > shape1.y)
      this.mirrorVideoCtx.rotate(-a - PI4);
    else
      this.mirrorVideoCtx.rotate(a - PI4);
    this.mirrorVideoCtx.scale(delta, delta);

    // Paint the pattern
    if (this.pattern) {
      if (this.displayBackground) {
        this.mirrorVideoCtx.fillRect(-2, -2, 104, 104);
        this.mirrorVideoCtx.strokeRect(-2, -2, 104, 104);
      }
      try {
        this.mirrorVideoCtx.drawImage(this.pattern, 0, 0, 100, 100);
      } catch(e){};
    }
    this.mirrorVideoCtx.restore();

    return;
  }
};

window.onload = function() { processor.doLoad(); }

// shim layer with setTimeout fallback
// by @paul_irish
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
            };
})();
