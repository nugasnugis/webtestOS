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
    document.querySelectorAll('.faq-item').forEach(el => { 
        el.classList.remove('active'); 
        el.querySelector('.faq-panel').style.maxHeight = '0px'; 
    });
    if (isOpening) { 
        item.classList.add('active'); 
        panel.style.maxHeight = panel.scrollHeight + "px"; 
    }
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
    if (btn) {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) btn.style.display = "flex"; else btn.style.display = "none";
    }
};

window.addEventListener("popstate", () => {
    if(window.location.hash === "#guide") showGuide(); else if(window.location.hash === "#releases") showReleases(); else showHome();
});
function drawReleaseRows(historyArray, customUrl) {
    const targetContainer = document.getElementById('history-rows');
    if (!targetContainer) return;
    
    let htmlOutput = '';
    const themeMap = {
        'latest':   { text: '#166534', bg: '#bbf7d0', cls: 'badge-active' },
        'active':   { text: '#166534', bg: '#bbf7d0', cls: 'badge-active' },
        'nightly':  { text: '#1e40af', bg: '#93c5fd', cls: 'badge-supported' },
        'test':     { text: '#1e40af', bg: '#93c5fd', cls: 'badge-supported' },
        'legacy':   { text: '#1e293b', bg: '#cbd5e1', cls: 'badge-legacy' }
    };

    if (Array.isArray(historyArray)) {
        historyArray.forEach(item => {
            let rawStatus = item.status || 'legacy';
            let currentStatus = String(rawStatus).toLowerCase().trim();
            let config = themeMap[currentStatus] || themeMap['legacy'];
            let badgeStyles = `color: ${config.text} !important; background-color: ${config.bg} !important; font-weight: 800; padding: 4px 12px; border-radius: 9999px; display: inline-block !important; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px;`;
            let directLink = item.download_link || customUrl || '#';
            
            htmlOutput += `
                <tr style="border-bottom: 1px solid #e2e8f0 !important; color: #1e293b !important; display: table-row !important;">
                    <td style="padding: 16px 12px; font-weight:700; color: #1e293b !important; display: table-cell !important;">${item.version || 'Unknown'}</td>
                    <td style="padding: 16px 12px; color: #334155 !important; display: table-cell !important;">${item.date || ''}</td>
                    <td style="padding: 16px 12px; font-style:italic; color: #475569 !important; display: table-cell !important;">"${item.codename || ''}"</td>
                    <td style="padding: 16px 12px; line-height:1.6; color: #334155 !important; display: table-cell !important;">${item.updates || ''}</td>
                    <td style="padding: 16px 12px; display: table-cell !important;"><span class="${config.cls}" style="${badgeStyles}">${rawStatus}</span></td>
                    <td style="padding: 16px 12px; text-align:center; display: table-cell !important;">
                        <a href="${directLink}" class="btn" style="padding:6px 14px; font-size:13px; font-weight:600; border-radius:6px; display:inline-block !important; text-decoration:none; background: #2563eb !important; color: #ffffff !important;" target="_blank">
                            <i class="fas fa-compact-disc" style="margin-right:6px; color: #ffffff !important;"></i>Download ISO
                        </a>
                    </td>
                </tr>`;
        });
    }
    targetContainer.innerHTML = htmlOutput;
}

fetch('./config.json')
    .then(res => res.json())
    .then(data => {
        document.querySelectorAll('.main-dl-btn, #hero-dl-btn, .nav-dl-btn').forEach(b => { 
            b.removeAttribute('href'); b.setAttribute('onclick', 'showReleases()');
            if(b.id === 'hero-dl-btn') b.innerText = `Download AxelOS ${data.latest_version || 'v1.0'}`;
        });
        
        const tagVer = document.getElementById('tag-ver'); if(tagVer) tagVer.innerText = `Introducing AxelOS ${data.latest_version}`;
        const sCpu = document.getElementById('spec-cpu'); if(sCpu) sCpu.innerText = data.requirements.cpu;
        const sRam = document.getElementById('spec-ram'); if(sRam) sRam.innerText = data.requirements.ram;
        const sStore = document.getElementById('spec-storage'); if(sStore) sStore.innerText = data.requirements.storage;
        const sGpu = document.getElementById('spec-gpu'); if(sGpu) sGpu.innerText = data.requirements.gpu;

        screenshots = data.webss || [];
        const track = document.getElementById('slider-track'), dots = document.getElementById('dots-container');
        if(track && dots && screenshots.length > 0) {
            track.innerHTML = ''; dots.innerHTML = '';
            screenshots.forEach((f, idx) => {
                track.innerHTML += `<div class="slide-pane"><img src="webss/${f}" alt="${f}"></div>`;
                dots.innerHTML += `<span class="ind-dot ${idx===0?'active':''}" onclick="jumpToSlide(${idx}); resetAutoSwipeTimer();"></span>`;
            });
            const sTitle = document.getElementById('screen-title'); if(sTitle) sTitle.innerText = cleanImageTitle(screenshots);
        }

        // ? DYNAMICALLY BUILD INSTALL GUIDE FROM CONFIG.JSON
        const guideSub = document.querySelector('#main-guide-content p');
        if(guideSub && data.install_guide.subtitle) guideSub.innerText = data.install_guide.subtitle;

        const timelineContainer = document.querySelector('#main-guide-content div[style*="border-left: 3px solid"]');
        if(timelineContainer && data.install_guide.steps) {
            let guideHtml = '';
            data.install_guide.steps.forEach(step => {
                let bgCircle = step.is_success ? '#10b981' : '#2563eb';
                let titleColor = step.is_success ? '#10b981' : '#0f172a';
                let warningHtml = step.warning ? `<div style="background: #fffbeb; border-left: 4px solid #d97706; padding: 10px 14px; border-radius: 4px; font-size: 13px; color: #92400e; margin-top: 8px;">${step.warning}</div>` : '';
                
                guideHtml += `
                    <div style="position: relative; margin-bottom: 32px;">
                        <div style="position: absolute; left: -37px; top: 0; width: 24px; height: 24px; background: ${bgCircle}; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 4px solid #fff;">${step.num}</div>
                        <h3 style="font-size: 16px; font-weight: 700; color: ${titleColor}; margin-bottom: 6px;">${step.title}</h3>
                        <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">${step.description}</p>
                        ${warningHtml}
                    </div>`;
            });
            timelineContainer.innerHTML = guideHtml;
        }

        // ? DYNAMICALLY BUILD BEAUTIFUL FAQ ACCORDIONS FROM CONFIG.JSON
        const faqContainer = document.querySelector('#main-guide-content div[style*="display: flex; flex-direction: column; gap: 12px"]');
        if(faqContainer && data.faq) {
            faqContainer.innerHTML = '';
            data.faq.forEach(item => {
                faqContainer.innerHTML += `
                    <div class="faq-item" style="border: 1px solid #e2e8f0; border-radius: 8px; transition: all 0.2s ease; overflow: hidden; background: #f8fafc;">
                        <button onclick="toggleFaq(this)" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: none; border: none; font-size: 15px; font-weight: 700; color: #1e293b; text-align: left; cursor: pointer; outline: none;">
                            <span>${item.question}</span>
                            <i class="fas fa-chevron-down faq-arrow" style="font-size: 12px; color: #64748b; transition: transform 0.2s ease;"></i>
                        </button>
                        <div class="faq-panel" style="max-height: 0px; overflow: hidden; transition: max-height 0.25s ease-out; background: #ffffff;">
                            <div style="padding: 20px; font-size: 14px; color: #475569; line-height: 1.6; border-top: 1px solid #e2e8f0;">
                                ${item.answer}
                            </div>
                        </div>
                    </div>`;
            });
        }

        if (data.history) { drawReleaseRows(data.history, data.download_url); }
        startAutoSwipe();
    })
    .catch(err => console.error("Config processing tracker crash:", err));

if(window.location.hash === "#guide") showGuide();
if(window.location.hash === "#releases") showReleases();
