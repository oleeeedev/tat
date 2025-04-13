// Import der lokalen CookieConsent-Datei
import '/assets/vendor/cookieconsent/cookieconsent.umd.js';

// Dark Mode aktivieren
document.documentElement.classList.add('cc--darkmode');

// Funktion zum Prüfen des Cookie-Status
function checkCookieConsent() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith('cc_cookie=')) {
            try {
                const value = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
                return value.categories && value.categories.includes('maps');
            } catch (e) {
                return false;
            }
        }
    }
    return false;
}

// Funktion zum Verwalten der Google Maps Anzeige
function handleGoogleMaps(consent) {
    const mapElements = document.querySelectorAll('iframe[data-src*="google.com/maps"], iframe[src*="google.com/maps"]');
    
    mapElements.forEach(map => {
        const container = map.parentElement;
        
        // Stelle sicher, dass wir data-src haben
        if (!map.hasAttribute('data-src')) {
            map.setAttribute('data-src', map.src);
            map.removeAttribute('src');
        }
        
        if (!consent) {
            // Wenn keine Einwilligung, Platzhalter anzeigen
            if (!container.querySelector('.maps-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'maps-placeholder';
                placeholder.style.cssText = `
                    background: #f0f0f0;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    height: 300px;
                    max-height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 10px;
                    margin: 0;
                `;
                
                placeholder.innerHTML = `
                    <i class="bi bi-geo-alt" style="font-size: 2rem; color: #666;"></i>
                    <p style="margin: 0;">Um Google Maps anzuzeigen, stimmen Sie bitte der Verwendung von Google Maps Cookies zu.</p>
                    <button onclick="CookieConsent.showPreferences()" style="
                        background: #2e79ab;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 10px;
                    ">Cookie-Einstellungen öffnen</button>
                `;
                
                map.style.display = 'none';
                container.appendChild(placeholder);
            }
        } else {
            // Wenn Einwilligung vorhanden, Maps laden und anzeigen
            const placeholder = container.querySelector('.maps-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            if (!map.src || map.src === 'about:blank') {
                map.src = map.getAttribute('data-src');
            }
            map.style.display = 'block';
        }
    });
}

// Funktion zum Neuladen der Seite
function reloadPage() {
    // Setze ein Flag, dass die Seite neu geladen werden soll
    sessionStorage.setItem('reload_after_consent', 'true');
    window.location.reload();
}

// Funktion zum Überprüfen und Anwenden der Cookie-Einstellungen
function applyCookieSettings() {
    const mapsConsent = CookieConsent.acceptedCategory('maps');
    handleGoogleMaps(mapsConsent);
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    const consent = checkCookieConsent();
    handleGoogleMaps(consent);
});

// Beobachte DOM-Änderungen für dynamisch geladene Maps
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            const consent = checkCookieConsent();
            handleGoogleMaps(consent);
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Cookie Consent Konfiguration
CookieConsent.run({
    guiOptions: {
        consentModal: {
            layout: "box",
            position: "bottom left",
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: "box",
            position: "right",
            equalWeightButtons: true,
            flipButtons: false
        }
    },
    categories: {
        necessary: {
            readOnly: true
        },
        analytics: {},
        maps: {
            autoClear: false
        }
    },
    cookie: {
        name: 'cc_cookie',
        domain: '',
        expiresAfter: 365,
        path: '/',
        sameSite: 'Lax'
    },
    language: {
        default: "de",
        translations: {
            de: {
                consentModal: {
                    title: "Wir verwenden Cookies",
                    description: "Wir nutzen Cookies auf unserer Website, um Ihnen die bestmögliche Erfahrung zu bieten. Einige sind notwendig für den Betrieb der Seite, während andere uns helfen, die Website zu optimieren und den Standort besser darzustellen.",
                    acceptAllBtn: "Alle akzeptieren",
                    acceptNecessaryBtn: "Alle ablehnen",
                    showPreferencesBtn: "Einstellungen verwalten",
                    footer: "<a href=\"datenschutz.html\">Datenschutzerklärung</a>\n<a href=\"impressum.html\">Impressum</a>"
                },
                preferencesModal: {
                    title: "Cookie-Einstellungen",
                    acceptAllBtn: "Alle akzeptieren",
                    acceptNecessaryBtn: "Alle ablehnen",
                    savePreferencesBtn: "Auswahl speichern",
                    closeIconLabel: "Modal schließen",
                    serviceCounterLabel: "Dienst|Dienste",
                    sections: [
                        {
                            title: "Cookie-Nutzung",
                            description: "Wir verwenden Cookies, um Ihnen die bestmögliche Nutzung unserer Website zu ermöglichen und unsere Dienste zu verbessern."
                        },
                        {
                            title: "Technisch notwendige Cookies <span class=\"pm__badge\">Immer aktiv</span>",
                            description: "Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.",
                            linkedCategory: "necessary"
                        },
                        {
                            title: "Google Maps Cookies",
                            description: "Diese Cookies werden von Google Maps gesetzt, um Ihnen die Kartenansicht und Wegbeschreibung zu unserem Standort anzuzeigen. Wenn Sie diese Cookies nicht akzeptieren, können wir Ihnen die Karte nicht anzeigen.",
                            linkedCategory: "maps"
                        },
                        {
                            title: "Weitere Informationen",
                            description: "Bei Fragen zu unserer Cookie-Richtlinie und Ihren Wahlmöglichkeiten kontaktieren Sie uns bitte über unsere <a class=\"cc__link\" href=\"contact.html\">Kontaktseite</a>."
                        }
                    ]
                }
            }
        }
    },
    onFirstConsent: () => {
        applyCookieSettings();
        reloadPage();
    },
    onChange: ({changedCategories}) => {
        if (changedCategories.includes('maps')) {
            reloadPage();
        }
    }
});

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    // Prüfe, ob ein Reload nach Cookie-Änderung nötig ist
    if (sessionStorage.getItem('reload_after_consent') === 'true') {
        sessionStorage.removeItem('reload_after_consent');
        applyCookieSettings();
    } else {
        // Normale Initialisierung
        applyCookieSettings();
    }
});