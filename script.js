let slideTitles = [];

function updateCarouselIndicators() {
    const track = document.getElementById('slider-track');
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (slideTitles[index]) document.getElementById('screen-title').innerText = slideTitles[index];
    const dots = document.querySelectorAll('.ind-dot');
    dots.forEach((dot, i) => { if(i === index) dot.classList.add('active'); else dot.classList.remove('active'); });
}

if (document.getElementById('slider-track')) {
    document.getElementById('slider-track').addEventListener('scroll', updateCarouselIndicators);
}

function slideCarousel(direction) { 
    const track = document.getElementById('slider-track'); 
    track.scrollBy({ left: track.clientWidth * direction, behavior: 'smooth' }); 
}

function jumpToSlide(index) { 
    const track = document.getElementById('slider-track'); 
    track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' }); 
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
if(window.location.hash === "#guide") showGuide();
if(window.location.hash === "#releases") showReleases();

// ? Unified Configuration & Screenshot Loader Engine
fetch('./config.json')
    .then(res => res.json())
    .then(data => {
        // 1. Update text metadata & versions
        document.querySelectorAll('.main-dl-btn').forEach(b => { b.href = data.download_url; b.innerText = `Download AxelOS ${data.latest_version}`; });
        document.querySelectorAll('.nav-dl-btn').forEach(b => b.href = data.download_url);
        document.getElementById('tag-ver').innerText = `Introducing AxelOS ${data.latest_version}`;
        
        // 2. Inject system requirements card properties
        document.getElementById('spec-cpu').innerText = data.requirements.cpu;
        document.getElementById('spec-ram').innerText = data.requirements.ram;
        document.getElementById('spec-storage').innerText = data.requirements.storage;
        document.getElementById('spec-gpu').innerText = data.requirements.gpu;

        // 3. Automatically build image tracks using original filenames
        const track = document.getElementById('slider-track');
        const dotsContainer = document.getElementById('dots-container');
        if (track && dotsContainer && data.webss) {
            track.innerHTML = ''; dotsContainer.innerHTML = ''; slideTitles = [];
            
            data.webss.forEach((filename, index) => {
                // Displays the original raw file name as the carousel title bar header string
                slideTitles.push(filename);
                track.innerHTML += `<div class="slide-pane"><img src="./webss/${filename}" alt="${filename}"></div>`;
                
                let activeClass = index === 0 ? 'active' : '';
                dotsContainer.innerHTML += `<span class="ind-dot ${activeClass}" onclick="jumpToSlide(${index})"></span>`;
            });
            document.getElementById('screen-title').innerText = slideTitles[0] || "Gallery";
        }

        // 4. Populate release changelogs
        const container = document.getElementById('history-rows');
        if (!container) return;
        container.innerHTML = '';
        data.history.forEach(item => {
            let badgeClass = 'badge-legacy'; if (item.status === 'active') badgeClass = 'badge-active'; if (item.status === 'supported') badgeClass = 'badge-supported';
            container.innerHTML += `<tr><td style="font-weight:700;">${item.version}</td><td>${item.date}</td><td style="font-style:italic;">"${item.codename}"</td><td>${item.updates}</td><td><span class="badge ${badgeClass}">${item.status}</span></td></tr>`;
        });
    }).catch(err => console.error("Pipeline failure:", err));
