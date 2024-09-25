document.addEventListener("DOMContentLoaded", function() {
    // Modal and email clipboard functionality (unchanged)
    var modal = document.getElementById("email-modal");
    var emailButton = document.getElementById("email-button");
    var closeButton = document.getElementsByClassName("close-button")[0];
    var copyButton = document.getElementById("copy-button");
    var emailAddress = document.getElementById("email-address").innerText;

    emailButton.onclick = function() {
        modal.style.display = "block";
    };

    closeButton.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    copyButton.onclick = function() {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(emailAddress).then(function() {
                alert("Email address copied to clipboard!");
            }, function(err) {
                console.error('Could not copy text: ', err);
            });
        } else {
            var tempInput = document.createElement("textarea");
            tempInput.value = emailAddress;
            document.body.appendChild(tempInput);
            tempInput.select();
            tempInput.setSelectionRange(0, 99999);
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'Email address copied to clipboard!' : 'Unable to copy';
                alert(msg);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(tempInput);
        }
    };

    // Canvas for the floating dots
    const canvas = document.getElementById('dotCanvas');
    const ctx = canvas.getContext('2d');
    let dots = [];
    const mouse = { x: null, y: null };
    let dotCount = 100; // Default number of dots
    let repelMode = true; // Start with "Push" mode (drift away)

    // Resize canvas to fill the header
    canvas.width = window.innerWidth;
    canvas.height = document.querySelector('header').offsetHeight;

    window.addEventListener('resize', function () {
        canvas.width = window.innerWidth;
        canvas.height = document.querySelector('header').offsetHeight;
    });

    // Track mouse position
    window.addEventListener('mousemove', function (event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    window.addEventListener('mouseout', function () {
        mouse.x = null;
        mouse.y = null;
    });

    // Create dots
    function createDots(count) {
        dots = [];
        for (let i = 0; i < count; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 3 + 1,
            });
        }
    }
    createDots(dotCount); // Initialize with default dot count

    function drawDots() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];

            // Draw each dot
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = 'black';
            ctx.fill();

            // Move the dots
            dot.x += dot.dx;
            dot.y += dot.dy;

            // Bounce off the walls
            if (dot.x + dot.radius > canvas.width || dot.x - dot.radius < 0) {
                dot.dx = -dot.dx;
            }

            if (dot.y + dot.radius > canvas.height || dot.y - dot.radius < 0) {
                dot.dy = -dot.dy;
            }

            // Repel or attract dots to/from the mouse
            if (mouse.x && mouse.y) {
                const dx = mouse.x - dot.x;
                const dy = mouse.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const angle = Math.atan2(dy, dx);
                    const moveX = Math.cos(angle) * 2;
                    const moveY = Math.sin(angle) * 2;

                    if (repelMode) {
                        // Drift away from the mouse
                        dot.x -= moveX;
                        dot.y -= moveY;
                    } else {
                        // Move toward the mouse
                        dot.x += moveX;
                        dot.y += moveY;
                    }
                }
            }
        }

        requestAnimationFrame(drawDots);  // Keep drawing the dots
    }

    // Start the animation
    drawDots();

    // Toggle drift behavior when button is clicked
    const toggleButton = document.getElementById("toggle-drift");
    toggleButton.onclick = function() {
        repelMode = !repelMode;
        toggleButton.textContent = repelMode ? "Push" : "Pull";
    };

    function setDotCount(newCount) {
        dotCount = newCount;
        createDots(dotCount);  // Recreate dots with new count
    }

    setDotCount(256);
});
