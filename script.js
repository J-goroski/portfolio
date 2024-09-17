document.addEventListener("DOMContentLoaded", function() {
    // Get modal elements
    var modal = document.getElementById("email-modal");
    var emailButton = document.getElementById("email-button");
    var closeButton = document.getElementsByClassName("close-button")[0];
    var copyButton = document.getElementById("copy-button");
    var emailAddress = document.getElementById("email-address").innerText;

    // Open the modal when the email button is clicked
    emailButton.onclick = function() {
        modal.style.display = "block";
    }

    // Close the modal when the close button is clicked
    closeButton.onclick = function() {
        modal.style.display = "none";
    }

    // Close the modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Copy the email address to clipboard when the copy button is clicked
    copyButton.onclick = function() {
        // Use the Clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            // navigator.clipboard.writeText returns a Promise
            navigator.clipboard.writeText(emailAddress).then(function() {
                alert("Email address copied to clipboard!");
            }, function(err) {
                console.error('Could not copy text: ', err);
            });
        } else {
            // Fallback method
            var tempInput = document.createElement("textarea");
            tempInput.value = emailAddress;
            document.body.appendChild(tempInput);
            tempInput.select();
            tempInput.setSelectionRange(0, 99999); // For mobile devices
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'Email address copied to clipboard!' : 'Unable to copy';
                alert(msg);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(tempInput);
        }
    }

    // Theme Toggle Functionality
    const toggleSwitch = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggleSwitch.checked = true;
    }

    toggleSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
});
