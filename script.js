let screenshots = [], slideTitles = [], currentIndex = 0, autoSwipeTimer;
let username = "nugasnugis", repo = "webtestOS";             

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
    document.getElementById('main-downloads-content').style.display = 'none';
}
function showGuide() { hideAllViews(); document.getElementById('main-guide-content').style.display = 'block'; window.scrollTo({top:0}); history.pushState(null, "", "#guide"); }
function showReleases() { hideAllViews(); document.getElementById('main-releases-content').style.display = 'block'; window.scrollTo({top:0}); history.pushState(null, "", "#releases"); }
function showDownloads() { hideAllViews(); document.getElementById('main-downloads-content').style.display = 'block'; window.scrollTo({top:0}); history.pushState(null, "", "#downloads"); }
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
    if(window.location.hash === "#guide") showGuide(); else if(window.location.hash === "#releases") showReleases(); else if(window.location.hash === "#downloads") showDownloads(); else showHome();
});

fetch('config.json')
    .then(res => res.json())
    .then(data => {
        document.querySelectorAll('.main-dl-btn, #hero-dl-btn, .nav-dl-btn').forEach(b => { 
            b.removeAttribute('href'); b.setAttribute('onclick', 'showDownloads()');
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

      // ? UPDATED TABLE ROW BUILDER MATRIX
        const container = document.getElementById('history-rows');
        if (container) {
            container.innerHTML = '';
            data.history.forEach(item => {
                // Determine clean badge color configurations based on status
                let badgeClass = 'badge-legacy';
                const currentStatus = item.status.toLowerCase();
                if (currentStatus.includes('latest') || currentStatus === 'active') badgeClass = 'badge-active';
                else if (currentStatus.includes('nightly') || currentStatus.includes('pre-release')) badgeClass = 'badge-supported';
                
                // Formulates a clean clean ID string from the version tag (e.g., "v2-0")
                let cleanId = item.version.split(' ')[0].replace(/\./g, '-');
                let fallbackUrl = `https://github.com{username}/${repo}/releases/tag/${item.version.split(' ')[0]}`;
                
                container.innerHTML += `
                    <tr id="row-${cleanId}">
                        <td style="font-weight:700; color:inherit;">${item.version}</td>
                        <td>${item.date}</td>
                        <td style="font-style:italic;">"${item.codename}"</td>
                        <td>${item.updates}</td>
                        <td><span class="badge ${badgeClass}">${item.status}</span></td>
                        <td style="text-align:center;">
                            <a href="${fallbackUrl}" id="dl-link-${cleanId}" class="btn" style="padding:6px 12px; font-size:13px; font-weight:600; border-radius:6px;" target="_blank">
                                <i class="fas fa-download" style="margin-right:6px;"></i>Download ISO
                            </a>
                        </td>
                    </tr>`;
            });
        }
        
        startAutoSwipe();
        // ? Add this exact trigger call right here:
        loadLiveGitHubAssets();
     }).catch(err => console.error("Config structure initialization failure:", err));

        
        // ? Fixed Absolute Array Mapping: Explicit parameters extracted out of your download config URL
        const parts = data.download_url.split('/');
        username = parts[3] || "nugasnugis";
        repo = parts[4] || "axelos";
        
        // Streams all releases into the separation engine
        loadDualDownloadSections();
    }).catch(err => console.error(err));

function createAssetCard(asset, versionTag, isLatest) {
    let isIso = asset.name.endsWith('.iso');
    let cardIcon = isIso ? 'fa-compact-disc' : 'fa-file-archive';
    let buttonStyle = isLatest ? 'background:#2563eb; color:white;' : 'background:#e2e8f0; color:#334155;';
    let fileSize = (asset.size / (1024 * 1024)).toFixed(1) + " MB";

    return `
        <div style="background:var(--bg-fallback,#ffffff); padding:24px; border:1px solid #e2e8f0; border-radius:12px; display:flex; flex-direction:column; justify-content:space-between; color:inherit;">
            <div>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                    <div style="background:#eff6ff; color:#2563eb; width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">
                        <i class="fas ${cardIcon}"></i>
                    </div>
                    <div>
                        <h4 style="font-size:14px; font-weight:700; word-break:break-all;">${asset.name}</h4>
                        <p style="font-size:12px; opacity:0.65; margin-top:2px;">Build: ${versionTag} ? Size: ${fileSize} ? Hits: ${asset.download_count}</p>
                    </div>
                </div>
            </div>
            <a href="${asset.browser_download_url}" class="btn" style="text-align:center; margin-top:16px; font-size:13px; font-weight:600; padding:10px 0; width:100%; display:block; border-radius:8px; ${buttonStyle}">
                <i class="fas fa-download" style="margin-right:8px;"></i>Download Build
            </a>
        </div>`;
}

// ? MULTI-RELEASE ISO TRACKER ENGINE
function loadLiveGitHubAssets() {
    if (!username || !repo) return;
    
    fetch(`https://github.com{username}/${repo}/releases`)
        .then(res => { if(!res.ok) throw new Error(); return res.json(); })
        .then(releases => {
            if(!releases || releases.length === 0) return;
            
            releases.forEach(release => {
                // Generate a clean target key matching our HTML elements (e.g., "v2-0")
                let cleanTagKey = release.tag_name.replace(/\./g, '-');
                let targetButton = document.getElementById(`dl-link-${cleanTagKey}`);
                
                if (targetButton && release.assets) {
                    // Search inside this release channel for a file ending in .iso
                    let isoFile = release.assets.find(asset => asset.name.endsWith('.iso'));
                    
                    if (isoFile) {
                        // Upgrade the row button link directly to the direct package mirror download url
                        targetButton.href = isoFile.browser_download_url;
                        let sizeMb = (isoFile.size / (1024 * 1024)).toFixed(0);
                        targetButton.innerHTML = `<i class="fas fa-compact-disc" style="margin-right:6px;"></i>ISO (${sizeMb} MB)`;
                    }
                }
            });
        })
        .catch(err => console.warn("GitHub API rate limits or connection restrictions blocked live assets check:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    if(window.location.hash === "#guide") showGuide();
    if(window.location.hash === "#releases") showReleases();
    if(window.location.hash === "#downloads") showDownloads();
});
