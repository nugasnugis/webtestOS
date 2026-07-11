// ? SCREENSHOT IMAGE ARRAY LIST
const screenshots = [
    "daily-desktop-interface.png",
    "gaming_proton_dashboard.jpg",
    "pentesting-terminal-shell.webp"
];

const downloadUrl = "https://github.com";
let currentIndex = 0;
let autoSwipeTimer;

// Dynamic Header Text Cleaner
function cleanImageTitle(filename) {
    return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
}

function updateCarouselIndicators() {
    const track = document.getElementById('slider-track');
    if (!track || track.clientWidth === 0) return;
    currentIndex = Math.round(track.scrollLeft / track.clientWidth);
    if (screenshots[currentIndex]) {
        document.getElementById('screen-title').innerText = cleanImageTitle(screenshots[currentIndex]);
    }
    document.querySelectorAll('.ind-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

if (document.getElementById('slider-track')) {
    document.getElementById('slider-track').addEventListener('scroll', updateCarouselIndicators);
}

function slideCarousel(direction) {
    currentIndex += direction;
    if (currentIndex >= screenshots.length) currentIndex = 0;
    else if (currentIndex < 0) currentIndex = screenshots.length - 1;
    jumpToSlide(currentIndex);
    resetAutoSwipeTimer();
}

function jumpToSlide(index) { 
    const track = document.getElementById('slider-track');
    if (track) track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' }); 
    currentIndex = index;
}

function startAutoSwipe() { autoSwipeTimer = setInterval(() => { slideCarousel(1); }, 4000); }
function resetAutoSwipeTimer() { clearInterval(autoSwipeTimer); startAutoSwipe(); }

if (document.getElementById('slider-track')) {
    document.getElementById('slider-track').addEventListener('touchstart', () => clearInterval(autoSwipeTimer));
    document.getElementById('slider-track').addEventListener('touchend', resetAutoSwipeTimer);
}

// Smooth Accordion FAQ Dropdowns
function toggleFaq(button) {
    const panel = button.nextElementSibling;
    const span = button.querySelector('span');
    if (panel.style.maxHeight && panel.style.maxHeight !== '0px') {
        panel.style.maxHeight = '0px';
        panel.style.paddingBottom = '0px';
        span.innerText = '+';
    } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.style.paddingBottom = '15px';
        span.innerText = '?';
    }
}

function hideAllViews() {
    document.getElementById('main-homepage-content').style.display = 'none';
    document.getElementById('main-guide-content').style.display = 'none';
    document.getElementById('main-releases-content').style.display = 'none';
}
function showGuide() { hideAllViews(); document.getElementById('main-guide-content').style.display = 'block'; window.scrollTo({top:0}); history.pushState(null, "", "#guide"); }
function showReleases() { hideAllViews(); document.getElementById('main-releases-content').style.display = 'block'; window.scrollTo({top:0}); history.pushState(null, "", "#releases"); }
function showHome(anchor = null) {
    hideAllViews(); document.getElementById('main-homepage-content').style.display = 'block'; history.pushState(null, "", " ");
    if(anchor) { setTimeout(() => { const target = document.querySelector(anchor); if(target) target.scrollIntoView({ behavior: 'smooth' }); }, 50); } else { window.scrollTo({top:0}); }
    setTimeout(updateCarouselIndicators, 100);
}

function toggleTheme() {
    const body = document.body; body.classList.toggle('dark-mode');
    const icon = document.getElementById('theme-icon');
    if(body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
    } else {
        localStorage.setItem('theme', 'light');
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>`;
    }
}
if(localStorage.getItem('theme') === 'dark') toggleTheme();

window.onscroll = function() {
    const btn = document.getElementById('scroll-top-arrow');
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) { btn.style.display = "flex"; } else { btn.style.display = "none"; }
};

window.addEventListener("popstate", () => {
    if(window.location.hash === "#guide") showGuide(); else if(window.location.hash === "#releases") showReleases(); else showHome();
});

document.addEventListener("DOMContentLoaded", () => {
    const dlBtn = document.getElementById('hero-dl-btn');
    if(dlBtn) dlBtn.href = downloadUrl;
    
    const track = document.getElementById('slider-track');
    const dotsContainer = document.getElementById('dots-container');
    if(track && dotsContainer) {
        track.innerHTML = ''; dotsContainer.innerHTML = '';
        screenshots.forEach((filename, index) => {
            track.innerHTML += `<div class="slide-pane"><img src="./webss/${filename}" alt="${filename}"></div>`;
            let activeClass = index === 0 ? 'active' : '';
            dotsContainer.innerHTML += `<span class="ind-dot ${activeClass}" onclick="jumpToSlide(${index}); resetAutoSwipeTimer();"></span>`;
        });
    }
    
    const titleEl = document.getElementById('screen-title');
    if(titleEl && screenshots[0]) titleEl.innerText = cleanImageTitle(screenshots[0]);
    
    if(window.location.hash === "#guide") showGuide();
    if(window.location.hash === "#releases") showReleases();
    startAutoSwipe();
});
