/* ============================================================
   Jared Goroski — portfolio
   Signature: an ambient "index constituent" field.
   Points carry a score (vertical position). A threshold drifts
   slowly; a buffer BAND around it gives membership hysteresis —
   a point must clear the UPPER edge to enter the index and fall
   below the LOWER edge to leave. Amber = in index, dim = out.
   This is the banding/buffer rule from index_engine, made visible.
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {

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

  /* ---------- constituent field (home hero only) ---------- */
  var canvas = document.getElementById("indexCanvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var COLORS = {
    in:   "#E0A93B",
    out:  "#5A6478",
    band: "rgba(224,169,59,0.10)",
    line: "rgba(224,169,59,0.35)"
  };

  var BAND = 0.07;            // half-width of the buffer band (in score units)
  var points = [];
  var COUNT = 0;
  var threshold = 0.5;
  var tPhase = Math.random() * Math.PI * 2;
  var W = 0, H = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function size() {
    var header = document.querySelector(".hero");
    W = canvas.width = window.innerWidth;
    H = canvas.height = header ? header.offsetHeight : window.innerHeight;
    COUNT = Math.min(260, Math.max(90, Math.floor(W / 7)));
    seed();
  }

  function seed() {
    points = [];
    for (var i = 0; i < COUNT; i++) {
      var score = Math.random();
      points.push({
        x: Math.random() * W,
        vx: (Math.random() - 0.5) * 0.25,
        score: score,
        vs: (Math.random() - 0.5) * 0.0016,
        inIndex: score > threshold,
        flash: 0
      });
    }
  }

  function step() {
    // threshold drifts slowly (a slow "reconstitution" cycle)
    tPhase += 0.0016;
    threshold = 0.5 + Math.sin(tPhase) * 0.12;

    var upper = threshold + BAND;
    var lower = threshold - BAND;

    for (var i = 0; i < points.length; i++) {
      var p = points[i];

      // horizontal drift, wrap around
      p.x += p.vx;
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;

      // score random walk, gently reflected at edges
      p.score += p.vs;
      if (p.score < 0.02) { p.score = 0.02; p.vs = Math.abs(p.vs); }
      if (p.score > 0.98) { p.score = 0.98; p.vs = -Math.abs(p.vs); }
      if (Math.random() < 0.01) p.vs += (Math.random() - 0.5) * 0.0008;
      p.vs = Math.max(-0.0026, Math.min(0.0026, p.vs));

      // hysteresis: enter only above upper edge, exit only below lower edge
      if (!p.inIndex && p.score > upper) { p.inIndex = true;  p.flash = 1; }
      else if (p.inIndex && p.score < lower) { p.inIndex = false; p.flash = 1; }

      if (p.flash > 0) p.flash -= 0.02;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    var yUpper = (1 - (threshold + BAND)) * H;
    var yLower = (1 - (threshold - BAND)) * H;

    // buffer band
    ctx.fillStyle = COLORS.band;
    ctx.fillRect(0, yUpper, W, yLower - yUpper);
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, yUpper); ctx.lineTo(W, yUpper); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, yLower); ctx.lineTo(W, yLower); ctx.stroke();

    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var y = (1 - p.score) * H;
      var base = p.inIndex ? 2.4 : 1.4;
      var r = base + (p.flash > 0 ? p.flash * 2.4 : 0);

      ctx.beginPath();
      ctx.arc(p.x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.inIndex ? COLORS.in : COLORS.out;
      ctx.globalAlpha = p.inIndex ? 0.9 : 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
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
