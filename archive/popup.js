/* popup.js */

document.addEventListener("DOMContentLoaded", function() {
    
    // --- CONFIGURATION ---
    const POPUP_DELAY = 15000;       // 15 seconds
    const KIT_UID = '7cfab03e55';    // Your NEW Kit Form ID
    const KIT_SCRIPT_URL = `https://berlindaily.kit.com/${KIT_UID}/index.js`;

    // --- 1. INJECT POPUP HTML ---
    // We create the HTML structure dynamically so you don't have to paste it on every page.
    const popupHTML = `
    <div id="cta-popup" class="popup-overlay">
        <div class="popup-content">
            <button class="popup-close">&times;</button>
            <div id="kit-form-placeholder"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // --- 2. SELECT ELEMENTS ---
    const popup = document.getElementById('cta-popup');
    const closeBtn = popup.querySelector('.popup-close');
    const placeholder = document.getElementById('kit-form-placeholder');
    let formLoaded = false;

    // --- 3. FUNCTIONS ---
    
    // Load the Kit script dynamically (Fixes issues where forms don't show up in popups)
    function loadKitForm() {
        if (formLoaded) return;
        
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-uid', KIT_UID);
        script.src = KIT_SCRIPT_URL;
        
        placeholder.appendChild(script);
        formLoaded = true;
    }

    function showPopup() {
        // UNCOMMENT the line below to ensure it only shows once per user session
        // if (localStorage.getItem('berlin_daily_popup_seen')) return;

        popup.style.display = 'flex';
        loadKitForm(); // Load the form data only when the popup opens
    }

    function closePopup() {
        popup.style.display = 'none';
        // UNCOMMENT the line below to save that the user closed it
        // localStorage.setItem('berlin_daily_popup_seen', 'true');
    }

    // --- 4. EVENT LISTENERS ---
    
    // Close on "X" button click
    closeBtn.addEventListener('click', closePopup);

    // Close on background click (clicking outside the white box)
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });

    // --- 5. START TIMER ---
    setTimeout(showPopup, POPUP_DELAY);
});