/* ============================================================
   Jared Goroski — portfolio
   - Theme toggle (light / dark), persisted, OS-aware.
   - Hero: an ambient particle network. Dots of varied sizes
     drift and gently bounce; when two dots fall within range a
     line connects them — thicker and brighter the closer they
     are, thinning and fading out toward the range edge.
   - Shared email modal.
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {

  /* ---------- theme toggle (all pages) ---------- */
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  var toggle = document.createElement("button");
  toggle.className = "theme-toggle";
  toggle.setAttribute("aria-label", "Toggle light / dark mode");
  toggle.setAttribute("title", "Toggle light / dark mode");

  function paintToggle() {
    // show the icon for the mode you'd switch TO
    toggle.innerHTML = currentTheme() === "light"
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
  }
  paintToggle();
  document.body.appendChild(toggle);

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    paintToggle();
    if (typeof refreshFieldColors === "function") refreshFieldColors();
  });

  /* ---------- email modal (shared across pages) ---------- */
  var modal = document.getElementById("email-modal");
  if (modal) {
    var emailButton = document.getElementById("email-button");
    var closeButton = document.querySelector(".close-button");
    var copyButton  = document.getElementById("copy-button");
    var emailText   = document.getElementById("email-address").innerText;

    emailButton.onclick = function () { modal.style.display = "block"; };
    closeButton.onclick = function () { modal.style.display = "none"; };
    window.addEventListener("click", function (e) {
      if (e.target === modal) modal.style.display = "none";
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") modal.style.display = "none";
    });

    copyButton.onclick = function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(emailText).then(
          function () { copyButton.textContent = "Copied"; },
          function () { copyButton.textContent = "Copy failed"; }
        );
      } else {
        var t = document.createElement("textarea");
        t.value = emailText; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); copyButton.textContent = "Copied"; }
        catch (err) { copyButton.textContent = "Copy failed"; }
        document.body.removeChild(t);
      }
      setTimeout(function () { copyButton.textContent = "Copy email"; }, 1600);
    };
  }

  /* ---------- particle network (home hero only) ---------- */
  var canvas = document.getElementById("indexCanvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var points = [];
  var COUNT = 0;
  var MAX_DIST = 140;       // px at which a connecting line fades out

  // colors are read from the active theme so the field follows light/dark
  var accentRGB = "224,169,59";
  function refreshFieldColors() {
    var raw = getComputedStyle(root).getPropertyValue("--accent").trim();
    var rgb = hexToRgb(raw);
    if (rgb) accentRGB = rgb.r + "," + rgb.g + "," + rgb.b;
  }
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    if (hex.length !== 6) return null;
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }
  // expose so the toggle handler can recolor on theme change
  window.refreshFieldColors = refreshFieldColors;
  refreshFieldColors();

  function size() {
    var header = document.querySelector(".hero");
    W = window.innerWidth;
    H = header ? header.offsetHeight : window.innerHeight;
    canvas.width  = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    COUNT = Math.min(150, Math.max(55, Math.floor((W * H) / 14000)));
    seed();
  }

  function seed() {
    points = [];
    for (var i = 0; i < COUNT; i++) {
      points.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r:  1.1 + Math.random() * 2.8        // varied dot sizes
      });
    }
  }

  function step() {
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      // gentle bounce off the edges keeps the field populated
      if (p.x < 0)  { p.x = 0;  p.vx = Math.abs(p.vx); }
      if (p.x > W)  { p.x = W;  p.vx = -Math.abs(p.vx); }
      if (p.y < 0)  { p.y = 0;  p.vy = Math.abs(p.vy); }
      if (p.y > H)  { p.y = H;  p.vy = -Math.abs(p.vy); }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // connecting lines: thicker + brighter when dots are close,
    // thinning and fading out as they approach MAX_DIST apart
    for (var i = 0; i < points.length; i++) {
      var a = points[i];
      for (var j = i + 1; j < points.length; j++) {
        var b = points[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d >= MAX_DIST) continue;
        var t = 1 - d / MAX_DIST;            // 1 = touching, 0 = at range edge
        ctx.strokeStyle = "rgba(" + accentRGB + "," + (t * 0.55).toFixed(3) + ")";
        ctx.lineWidth = 0.15 + t * 1.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // dots
    for (var k = 0; k < points.length; k++) {
      var p = points[k];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + accentRGB + "," + (0.45 + (p.r / 3.9) * 0.5).toFixed(3) + ")";
      ctx.fill();
    }
  }

  function loop() { step(); draw(); requestAnimationFrame(loop); }

  size();
  window.addEventListener("resize", size);

  if (reduceMotion) {
    draw();           // single static frame, no animation
  } else {
    loop();
  }
});
