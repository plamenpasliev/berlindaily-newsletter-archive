/* popup.js */

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. CONFIGURATION ---
    const POPUP_DELAY = 25000; // 25 seconds

    // --- 2. INJECT CSS (Required for the popup to function) ---
    const popupStyles = `
    <style>
        .popup-overlay {
            display: none; 
            position: fixed; 
            top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.7); 
            z-index: 10000; 
            justify-content: center; align-items: center;
        }
        .popup-content {
            background: white; 
            padding: 20px; 
            position: relative; 
            width: 90%; 
            max-width: 600px; 
            border-radius: 8px;
        }
        .popup-close {
            position: absolute; 
            top: 10px; right: 10px; 
            background: none; border: none; font-size: 24px; cursor: pointer;
            z-index: 10001;
        }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', popupStyles);

    // --- 3. INJECT BEEHIIV POPUP HTML ---
    const popupHTML = `
    <div id="cta-popup" class="popup-overlay">
        <div class="popup-content">
            <button class="popup-close">&times;</button>
            <div id="beehiiv-form-placeholder">
                <iframe src="https://subscribe-forms.beehiiv.com/5f887776-02ef-4e98-8a29-cfd752f17441" 
                        class="beehiiv-embed" 
                        data-test-id="beehiiv-embed" 
                        frameborder="0" 
                        scrolling="no" 
                        style="width: 100%; height: 339px; margin: 0; border-radius: 0px !important; background-color: transparent; box-shadow: 0 0 #0000;">
                </iframe>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // --- 4. LOAD BEEHIIV SCRIPTS ---
    function loadBeehiivScripts() {
        // Embed Script (Handling iframe resizing)
        const embedScript = document.createElement('script');
        embedScript.async = true;
        embedScript.src = "https://subscribe-forms.beehiiv.com/embed.js";
        document.body.appendChild(embedScript);

        // Attribution Script (Tracking UTM parameters)
        const attrScript = document.createElement('script');
        attrScript.async = true;
        attrScript.src = "https://subscribe-forms.beehiiv.com/attribution.js";
        document.body.appendChild(attrScript);
    }

    // --- 5. SELECT ELEMENTS & FUNCTIONS ---
    const popup = document.getElementById('cta-popup');
    const closeBtn = popup.querySelector('.popup-close');

    function showPopup() {
        // Check if user has already seen it (optional)
        if (localStorage.getItem('berlin_daily_popup_seen')) return;

        popup.style.display = 'flex';
        loadBeehiivScripts();
    }

    function closePopup() {
        popup.style.display = 'none';
        localStorage.setItem('berlin_daily_popup_seen', 'true');
    }

    // --- 6. EVENT LISTENERS ---
    closeBtn.addEventListener('click', closePopup);

    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });

    // --- 7. START TIMER ---
    setTimeout(showPopup, POPUP_DELAY);
});