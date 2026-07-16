let screenshots = [], slideTitles = [], currentIndex = 0, autoSwipeTimer;
const username = "nugasnugis", repo = "AxelOS";             

function cleanImageTitle(f) { return f.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "); }

function updateCarouselIndicators() {
    const t = document.getElementById('slider-track');
    if (!t || t.clientWidth === 0 || screenshots.length === 0) return;
    currentIndex = Math.round(t.scrollLeft / t.clientWidth);
    if (screenshots[currentIndex]) document.getElementById('screen-title').innerText = cleanImageTitle(screenshots[currentIndex]);
    document.querySelectorAll('.ind-dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
}

if (document.getElementById('slider-track')) document.getElementById('slider-track').addEventListener('scroll', updateCarouselIndicators);

function slideCarousel(d) {
    if (screenshots.length === 0) return;
    currentIndex += d;
    if (currentIndex >= screenshots.length) currentIndex = 0;
    else if (currentIndex < 0) currentIndex = screenshots.length - 1;
    jumpToSlide(currentIndex);
    resetAutoSwipeTimer();
}

function jumpToSlide(i) { 
    const t = document.getElementById('slider-track');
    if (t) t.scrollTo({ left: t.clientWidth * i, behavior: 'smooth' }); 
    currentIndex = i;
}

function startAutoSwipe() { autoSwipeTimer = setInterval(() => { slideCarousel(1); }, 4000); }
function resetAutoSwipeTimer() { clearInterval(autoSwipeTimer); startAutoSwipe(); }

if (document.getElementById('slider-track')) {
    document.getElementById('slider-track').addEventListener('touchstart', () => clearInterval(autoSwipeTimer));
    document.getElementById('slider-track').addEventListener('touchend', resetAutoSwipeTimer);
}

function toggleFaq(b) {
    const item = b.parentElement, panel = b.nextElementSibling, isOpening = !item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(el => { el.classList.remove('active'); el.querySelector('.faq-panel').style.maxHeight = '0px'; });
    if (isOpening) { item.classList.add('active'); panel.style.maxHeight = panel.scrollHeight + "px"; }
}

function hideAllViews() {
    document.getElementById('main-homepage-content').style.display = 'none';
    document.getElementById('main-guide-content').style.display = 'none';
    document.getElementById('main-releases-content').style.display = 'none';
}
function showGuide() { hideAllViews(); document.getElementById('main-guide-content').style.display = 'block'; window.scrollTo({top:0}); history.pushState(null, "", "#guide"); }
function showReleases() { hideAllViews(); document.getElementById('main-releases-content').style.display = 'block'; window.scrollTo({top:0}); history.pushState(null, "", "#releases"); }
function showHome(a = null) {
    hideAllViews(); document.getElementById('main-homepage-content').style.display = 'block'; history.pushState(null, "", " ");
    if(a) { setTimeout(() => { const t = document.querySelector(a); if(t) t.scrollIntoView({ behavior: 'smooth' }); }, 50); } else { window.scrollTo({top:0}); }
    setTimeout(updateCarouselIndicators, 100);
}

function toggleTheme() {
    const b = document.body; b.classList.toggle('dark-mode');
    const icon = document.getElementById('theme-icon');
    if(b.classList.contains('dark-mode')) {
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
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) btn.style.display = "flex"; else btn.style.display = "none";
};

window.addEventListener("popstate", () => {
    if(window.location.hash === "#guide") showGuide(); else if(window.location.hash === "#releases") showReleases(); else showHome();
});

// ? IMMEDIATE EXECUTION PIPELINE: Bypasses the dead event listener trap
fetch('./config.json')
    .then(res => res.json())
    .then(data => {
        document.querySelectorAll('.main-dl-btn, #hero-dl-btn, .nav-dl-btn').forEach(b => { 
            b.removeAttribute('href'); b.setAttribute('onclick', 'showReleases()');
            if(b.id === 'hero-dl-btn') b.innerText = `Download AxelOS ${data.latest_version}`;
        });
        document.getElementById('tag-ver').innerText = `Introducing AxelOS ${data.latest_version}`;
        document.getElementById('spec-cpu').innerText = data.requirements.cpu;
        document.getElementById('spec-ram').innerText = data.requirements.ram;
        document.getElementById('spec-storage').innerText = data.requirements.storage;
        document.getElementById('spec-gpu').innerText = data.requirements.gpu;

        screenshots = data.webss || [];
        const track = document.getElementById('slider-track'), dots = document.getElementById('dots-container');
        if(track && dots && screenshots.length > 0) {
            track.innerHTML = ''; dots.innerHTML = '';
            screenshots.forEach((f, idx) => {
                track.innerHTML += `<div class="slide-pane"><img src="webss/${f}" alt="${f}"></div>`;
                dots.innerHTML += `<span class="ind-dot ${idx===0?'active':''}" onclick="jumpToSlide(${idx}); resetAutoSwipeTimer();"></span>`;
            });
            document.getElementById('screen-title').innerText = cleanImageTitle(screenshots);
        }

        // ? 100% RELIABLE PURE CONFIG LOOP INJECTION
        const container = document.getElementById('history-rows');
        if (container && data.history) {
            container.innerHTML = '';
            data.history.forEach(item => {
                let badgeClass = 'badge-legacy';
                let currentStatus = String(item.status).toLowerCase();
                if (currentStatus.includes('latest') || currentStatus === 'active') badgeClass = 'badge-active';
                else if (currentStatus.includes('nightly') || currentStatus.includes('pre-release')) badgeClass = 'badge-supported';
                
                let directLink = item.download_link || data.download_url || '#';
                
                container.innerHTML += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 16px 12px; font-weight:700; color:inherit;">${item.version}</td>
                        <td style="padding: 16px 12px;">${item.date}</td>
                        <td style="padding: 16px 12px; font-style:italic;">"${item.codename}"</td>
                        <td style="padding: 16px 12px; line-height:1.6;">${item.updates}</td>
                        <td style="padding: 16px 12px;"><span class="badge ${badgeClass}">${item.status}</span></td>
                        <td style="padding: 16px 12px; text-align:center;">
                            <a href="${directLink}" class="btn" style="padding:6px 14px; font-size:13px; font-weight:600; border-radius:6px; display:inline-block; text-decoration:none;" target="_blank">
                                <i class="fas fa-compact-disc" style="margin-right:6px;"></i>Download ISO
                            </a>
                        </td>
                    </tr>`;
            });
        }
        startAutoSwipe();
    }).catch(err => console.error("Config reading error tracking:", err));

// Initial route routing sync on immediate load
if(window.location.hash === "#guide") showGuide();
if(window.location.hash === "#releases") showReleases();
