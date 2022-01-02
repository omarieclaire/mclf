console.log("hi");
var zoom = (function () {
  function z() {
    k = p.getContext("2d");
    l();
    A();
    s();
    t();
    setTimeout(function () {
      m || $("#status").css({ opacity: "0.6" });
    }, 1e3);
  }
  function s() {
    m
      ? (u(), $("#status").animate({ opacity: 0 }, 1e3))
      : setTimeout(function () {
          s();
        }, 10);
  }
  function l(a) {
    c = $(window).width();
    d = $(window).height();
    v = c / 2;
    w = d / 2;
    c > 1.5 * d ? ((q = c), (r = 0.75 * c)) : ((q = 1.5 * d), (r = d));
    $("#zc").attr("width", c);
    $("#zc").attr("height", d);
  }
  function B() {
    n = 0;
    var a = steps.every(function (a) {
      a.ready && (n += 100 / steps.length);
      return a.ready;
    });
    $("#loadbar").css("width", Math.floor(n) + "%");
    return a;
  }
  function C(a) {
    var b = this;
    this.ready = !1;
    this.img = new Image();
    this.img.onload = function () {
      b.ready = !0;
      B() && (m = !0);
    };
    this.img.src = a;
  }
  function A() {
    steps = [];
    for (var a = 0; 46 > a; a++)
      steps.push(new C("https://marieflanagan.com/imgZoom/img" + D[(20 + a) % 46] + ".png"));
  }
  function t() {
    k.clearRect(0, 0, p.width, p.height);
    for (var a = [], e = 0; e < E; e++)
      a.push(steps[(Math.floor(b) + e) % steps.length]);
    for (var c = Math.pow(2, b % 1), e = 0; e < a.length; e++) {
      var d = v - (q / 2) * c,
        f = w - (r / 2) * c,
        g = q * c,
        l = r * c;
      a[e].ready
        ? k.drawImage(a[e].img, d, f, g, l)
        : ((k.fillStyle = 0 === (Math.floor(b) + e) % 2 ? F : G),
          k.fillRect(d, f, g, l));
      c *= 0.5;
    }
    x ||
      (a.every(function (a) {
        return a.ready;
      }) && (y = n),
      h < y && (h += 0.5),
      $("#zc").css("opacity", h / 100),
      (b = H + h / 2e3),
      m && ($("#zc").animate({ opacity: 1 }, 5 * (100 - h)), (x = !0)));
    setTimeout(function () {
      t();
    }, 1e3 / 60);
  }
  function u() {
    m &&
      (f < I && (f += 1e-4),
      (b = g.up ? b + 4 * f : g.down ? b - 4 * f : b + f),
      0 > b && (b += steps.length),
      b > steps.length && (b -= steps.length));
    setTimeout(function () {
      u();
    }, 10);
  }
  var p = document.getElementById("zc"),
    k,
    c,
    d,
    v,
    w,
    q,
    r,
    H = 1,
    b = 1,
    g = { up: !1, down: !1 },
    I = 0.005,
    f = 0,
    E = 3,
    F = "#222",
    G = "#444",
    m = !1,
    n = 0,
    x = !1,
    h = 0,
    y = 0,
    D = "1 2 3 4 5 6 7".split(
      " "
    );
  $(window).resize(function () {
    l();
  });
  $(document).keydown(function (a) {
    38 === a.which && ((g.up = !0), a.preventDefault());
    40 === a.which && ((g.down = !0), a.preventDefault());
  });
  $(document).keyup(function (a) {
    38 === a.which && ((g.up = !1), a.preventDefault());
    40 === a.which && ((g.down = !1), a.preventDefault());
  });
  p.getContext && z();
})();
/* SLIMSCROLL */
(function (f) {
  jQuery.fn.extend({
    slimScroll: function (h) {
      var a = f.extend(
        {
          width: "auto",
          height: "250px",
          size: "7px",
          color: "#000",
          position: "right",
          distance: "1px",
          start: "top",
          opacity: 0.4,
          alwaysVisible: !1,
          disableFadeOut: !1,
          railVisible: !1,
          railColor: "#333",
          railOpacity: 0.2,
          railDraggable: !0,
          railClass: "slimScrollRail",
          barClass: "slimScrollBar",
          wrapperClass: "slimScrollDiv",
          allowPageScroll: !1,
          wheelStep: 20,
          touchScrollStep: 200,
          borderRadius: "7px",
          railBorderRadius: "7px"
        },
        h
      );
      this.each(function () {
        function r(d) {
          if (s) {
            d = d || window.event;
            var c = 0;
            d.wheelDelta && (c = -d.wheelDelta / 120);
            d.detail && (c = d.detail / 3);
            f(d.target || d.srcTarget || d.srcElement)
              .closest("." + a.wrapperClass)
              .is(b.parent()) && m(c, !0);
            d.preventDefault && !k && d.preventDefault();
            k || (d.returnValue = !1);
          }
        }
        function m(d, f, h) {
          k = !1;
          var e = d,
            g = b.outerHeight() - c.outerHeight();
          f &&
            ((e =
              parseInt(c.css("top")) +
              ((d * parseInt(a.wheelStep)) / 100) * c.outerHeight()),
            (e = Math.min(Math.max(e, 0), g)),
            (e = 0 < d ? Math.ceil(e) : Math.floor(e)),
            c.css({ top: e + "px" }));
          l = parseInt(c.css("top")) / (b.outerHeight() - c.outerHeight());
          e = l * (b[0].scrollHeight - b.outerHeight());
          h &&
            ((e = d),
            (d = (e / b[0].scrollHeight) * b.outerHeight()),
            (d = Math.min(Math.max(d, 0), g)),
            c.css({ top: d + "px" }));
          b.scrollTop(e);
          b.trigger("slimscrolling", ~~e);
          v();
          p();
        }
        function C() {
          window.addEventListener
            ? (this.addEventListener("DOMMouseScroll", r, !1),
              this.addEventListener("mousewheel", r, !1),
              this.addEventListener("MozMousePixelScroll", r, !1))
            : document.attachEvent("onmousewheel", r);
        }
        function w() {
          u = Math.max(
            (b.outerHeight() / b[0].scrollHeight) * b.outerHeight(),
            D
          );
          c.css({ height: u + "px" });
          var a = u == b.outerHeight() ? "none" : "block";
          c.css({ display: a });
        }
        function v() {
          w();
          clearTimeout(A);
          l == ~~l
            ? ((k = a.allowPageScroll),
              B != l && b.trigger("slimscroll", 0 == ~~l ? "top" : "bottom"))
            : (k = !1);
          B = l;
          u >= b.outerHeight()
            ? (k = !0)
            : (c.stop(!0, !0).fadeIn("fast"),
              a.railVisible && g.stop(!0, !0).fadeIn("fast"));
        }
        function p() {
          a.alwaysVisible ||
            (A = setTimeout(function () {
              (a.disableFadeOut && s) ||
                x ||
                y ||
                (c.fadeOut("slow"), g.fadeOut("slow"));
            }, 1e3));
        }
        var s,
          x,
          y,
          A,
          z,
          u,
          l,
          B,
          D = 30,
          k = !1,
          b = f(this);
        if (b.parent().hasClass(a.wrapperClass)) {
          var n = b.scrollTop(),
            c = b.parent().find("." + a.barClass),
            g = b.parent().find("." + a.railClass);
          w();
          if (f.isPlainObject(h)) {
            if ("height" in h && "auto" == h.height) {
              b.parent().css("height", "auto");
              b.css("height", "auto");
              var q = b.parent().parent().height();
              b.parent().css("height", q);
              b.css("height", q);
            }
            if ("scrollTo" in h) n = parseInt(a.scrollTo);
            else if ("scrollBy" in h) n += parseInt(a.scrollBy);
            else if ("destroy" in h) {
              c.remove();
              g.remove();
              b.unwrap();
              return;
            }
            m(n, !1, !0);
          }
        } else {
          a.height = "auto" == a.height ? b.parent().height() : a.height;
          n = f("<div></div>")
            .addClass(a.wrapperClass)
            .css({
              position: "relative",
              overflow: "hidden",
              width: a.width,
              height: a.height
            });
          b.css({ overflow: "hidden", width: a.width, height: a.height });
          var g = f("<div></div>")
              .addClass(a.railClass)
              .css({
                width: a.size,
                height: "100%",
                position: "absolute",
                top: 0,
                display: a.alwaysVisible && a.railVisible ? "block" : "none",
                "border-radius": a.railBorderRadius,
                background: a.railColor,
                opacity: a.railOpacity,
                zIndex: 90
              }),
            c = f("<div></div>")
              .addClass(a.barClass)
              .css({
                background: a.color,
                width: a.size,
                position: "absolute",
                top: 0,
                opacity: a.opacity,
                display: a.alwaysVisible ? "block" : "none",
                "border-radius": a.borderRadius,
                BorderRadius: a.borderRadius,
                MozBorderRadius: a.borderRadius,
                WebkitBorderRadius: a.borderRadius,
                zIndex: 99
              }),
            q =
              "right" == a.position
                ? { right: a.distance }
                : { left: a.distance };
          g.css(q);
          c.css(q);
          b.wrap(n);
          b.parent().append(c);
          b.parent().append(g);
          a.railDraggable &&
            c
              .bind("mousedown", function (a) {
                var b = f(document);
                y = !0;
                t = parseFloat(c.css("top"));
                pageY = a.pageY;
                b.bind("mousemove.slimscroll", function (a) {
                  currTop = t + a.pageY - pageY;
                  c.css("top", currTop);
                  m(0, c.position().top, !1);
                });
                b.bind("mouseup.slimscroll", function (a) {
                  y = !1;
                  p();
                  b.unbind(".slimscroll");
                });
                return !1;
              })
              .bind("selectstart.slimscroll", function (a) {
                a.stopPropagation();
                a.preventDefault();
                return !1;
              });
          g.hover(
            function () {
              v();
            },
            function () {
              p();
            }
          );
          c.hover(
            function () {
              x = !0;
            },
            function () {
              x = !1;
            }
          );
          b.hover(
            function () {
              s = !0;
              v();
              p();
            },
            function () {
              s = !1;
              p();
            }
          );
          b.bind("touchstart", function (a, b) {
            a.originalEvent.touches.length &&
              (z = a.originalEvent.touches[0].pageY);
          });
          b.bind("touchmove", function (b) {
            k || b.originalEvent.preventDefault();
            b.originalEvent.touches.length &&
              (m(
                (z - b.originalEvent.touches[0].pageY) / a.touchScrollStep,
                !0
              ),
              (z = b.originalEvent.touches[0].pageY));
          });
          w();
          "bottom" === a.start
            ? (c.css({ top: b.outerHeight() - c.outerHeight() }), m(0, !0))
            : "top" !== a.start &&
              (m(f(a.start).position().top, null, !0),
              a.alwaysVisible || c.hide());
          C();
        }
      });
      return this;
    }
  });
  jQuery.fn.extend({ slimscroll: jQuery.fn.slimScroll });
})(jQuery);
var seencredits = false;
$("#zc, #infotoggle").mousedown(function () {
  var video = $(".video").get(0);

  if ($("#info").hasClass("closed")) {
    video.play();
    $("#info").removeClass("closed");
    $("#infotoggle").removeClass("closed");
    $("#infotoggle").html("&laquo;");
  } else {
    video.pause();
    $("#info").addClass("closed");
    $("#infotoggle").addClass("closed");
    $("#infotoggle").html("&raquo;");
  }
  // window.clearTimeout(timer);
  $("#topinfo").hide();
});
// var timer = window.setTimeout(function () {
// 	$('#topinfo a').animate({left:"-150%"},5000);
// }, 8000)
$(function () {
  $("#inner-content-div").slimScroll({
    height: "100%",
    color: "#aaa",
    alwaysVisible: true
  });
});
