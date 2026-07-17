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

const languageMatrix = {
    en: {
        feat: "Features", about: "About", guide: "Install Guide", rel: "Releases & Downloads", dl: "Download",
        gSub: "Everything you need to step away from Windows and power up your machine safely, even if you have never installed an operating system before.",
        s1T: "Download & Get a USB Drive", s1D: "Grab the official AxelOS ISO file from our Releases Tab. Find a blank USB thumb drive with at least <b>8 GB</b> of storage capacity.",
        s1W: "<strong>?? Warning:</strong> Plugging in the USB will erase its contents. Back up any personal files inside it first!",
        s2T: "Flash the USB Installer", s2D: "Download a free program called <b>Rufus</b> (for Windows) or <b>BalenaEtcher</b> (for Mac/Linux). Open it, select your downloaded AxelOS ISO file, select your USB flash drive target, and hit <b>Flash / Start</b>.",
        s3T: "Boot from your USB Drive", s3D: "Shut down your computer completely. Leave the USB plugged in. Turn it back on and start repeatedly pressing your system's <b>Boot Menu Key</b> (usually <b>F12, F11, F8, or Esc</b>). Select your USB drive.",
        s4T: "Follow the Installer Wizard", s4D: "AxelOS will boot into preview. Click <b>'Install AxelOS'</b>. Follow the graphical menu options to choose your hard drive, setup your account password, and click deploy.",
        faqs: [
            { q: "Can I use AxelOS without erasing my Windows operating system?", a: "<b>Yes, absolutely!</b> Choose <b>'Install Alongside Windows'</b> (Dual Boot) on the partition setup window to run both systems safely on boot selection. Or run it risk-free in VirtualBox." },
            { q: "Will AxelOS run cleanly on my old laptop from 2012?", a: "<b>Yes!</b> AxelOS is engineered lightweight. Old setups that lag on Windows feel fast again here. It requires a 64-bit CPU and at least 4 GB of RAM memory layout." },
            { q: "Can I run Windows games and apps (.exe) on AxelOS?", a: "Yes. Use abstraction layer utilities like <b>Proton (via Steam)</b>, <b>Wine</b>, or <b>Bottles</b> to smoothly translate Windows applications." },
            { q: "Do I need to be connected to the internet to run the installer?", a: "<b>No.</b> The setup image works offline. Wi-Fi setup is recommended during boot to fetch graphic updates, but it is not mandatory." }
        ]
    },
    id: {
        feat: "Fitur", about: "Tentang", guide: "Panduan Instal", rel: "Rilis & Unduhan", dl: "Unduh",
        gSub: "Semua yang Anda butuhkan untuk meninggalkan Windows dan menyalakan mesin Anda dengan aman, bahkan jika Anda belum pernah menginstal sistem operasi sebelumnya.",
        s1T: "Unduh & Siapkan USB Drive", s1D: "Ambil file ISO resmi AxelOS dari Tab Rilis kami. Cari USB flashdisk kosong dengan kapasitas minimal <b>8 GB</b>.",
        s1W: "<strong>?? Peringatan:</strong> Memasukkan USB akan menghapus semua isinya. Cadangkan file pribadi Anda di dalamnya terlebih dahulu!",
        s2T: "Flash Pemasang USB", s2D: "Unduh program gratis bernama <b>Rufus</b> (untuk Windows) or <b>BalenaEtcher</b> (untuk Mac/Linux). Buka aplikasinya, pilih file ISO AxelOS yang diunduh, pilih USB drive Anda, lalu klik <b>Flash / Mulai</b>.",
        s3T: "Boot dari USB Drive Anda", s3D: "Matikan komputer Anda sepenuhnya. Biarkan USB terpasang. Nyalakan kembali komputer dan segera tekan berulang kali <b>Tombol Menu Booting</b> sistem Anda (biasanya <b>F12, F11, F8, atau Esc</b>). Pilih USB drive Anda.",
        s4T: "Ikuti Wizard Pemasangan", s4D: "AxelOS akan masuk ke mode pratinjau desktop. Klik ikon berlabel <b>'Install AxelOS'</b>. Ikuti opsi menu grafis untuk memilih hard drive Anda, atur kata sandi akun Anda, lalu klik pasang.",
        faqs: [
            { q: "Apakah saya bisa menggunakan AxelOS tanpa menghapus sistem operasi Windows saya?", a: "<b>Ya, tentu saja!</b> Pilih opsi <b>'Instal Berdampingan dengan Windows'</b> (Dual Boot) di layar partisi untuk memilih OS saat komputer dinyalakan. Atau gunakan VirtualBox tanpa risiko." },
            { q: "Apakah AxelOS dapat berjalan dengan lancar di laptop lama saya dari tahun 2012?", a: "<b>Ya!</b> AxelOS sangat ringan. Komputer lama dari tahun 2012 yang lambat di Windows akan terasa cepat kembali. Memerlukan CPU 64-bit dan RAM minimal 4 GB." },
            { q: "Apakah saya bisa menjalankan game dan aplikasi Windows (.exe) di AxelOS?", a: "Ya. Gunakan alat kompatibilitas seperti <b>Proton (via Steam)</b>, <b>Wine</b>, atau <b>Bottles</b> untuk menjalankan game dan aplikasi Windows dengan lancar." },
            { q: "Apakah saya harus terhubung ke internet untuk menjalankan pemasang?", a: "<b>Tidak.</b> Gambar setup USB AxelOS membawa semua file penting secara offline. Koneksi internet direkomendasikan untuk update otomatis tetapi tidak wajib." }
        ]
    }
};
function changeLanguage(langCode) {
    const textData = languageMatrix[langCode] || languageMatrix['en'];
    localStorage.setItem('selectedLanguage', langCode);

    const nFeat = document.getElementById('nav-feat'); if(nFeat) nFeat.innerText = textData.feat;
    const nAbout = document.getElementById('nav-about'); if(nAbout) nAbout.innerText = textData.about;
    const nGuide = document.getElementById('nav-guide'); if(nGuide) nGuide.innerText = textData.guide;
    const nRel = document.getElementById('nav-rel'); if(nRel) nRel.innerText = textData.rel;
    const nDl = document.getElementById('nav-dl'); if(nDl) nDl.innerText = textData.dl;

    const gSub = document.querySelector('#main-guide-content p'); if(gSub) gSub.innerText = textData.gSub;

    const stepHeaders = document.querySelectorAll('#main-guide-content h3');
    const stepParagraphs = document.querySelectorAll('#main-guide-content p');
    if (stepHeaders.length >= 4 && stepParagraphs.length >= 5) {
        stepHeaders[0].innerText = textData.s1T; stepParagraphs[1].innerHTML = textData.s1D;
        stepHeaders[1].innerText = textData.s2T; stepParagraphs[2].innerHTML = textData.s2D;
        stepHeaders[2].innerText = textData.s3T; stepParagraphs[3].innerHTML = textData.s3D;
        stepHeaders[3].innerText = textData.s4T; stepParagraphs[4].innerHTML = textData.s4D;
    }
    const warnBox = document.querySelector('#main-guide-content div[style*="background: #fffbeb"]');
    if(warnBox) warnBox.innerHTML = textData.s1W;

    const faqContainer = document.querySelector('#main-guide-content div[style*="display: flex; flex-direction: column; gap: 12px"]');
    if(faqContainer && textData.faqs) {
        faqContainer.innerHTML = '';
        textData.faqs.forEach(faqItem => {
            faqContainer.innerHTML += `
                <div class="faq-item" style="border: 1px solid #e2e8f0; border-radius: 8px; transition: all 0.2s ease; overflow: hidden; background: #f8fafc;">
                    <button onclick="toggleFaq(this)" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: none; border: none; font-size: 15px; font-weight: 700; color: #1e293b; text-align: left; cursor: pointer; outline: none;">
                        <span>${faqItem.q}</span>
                        <i class="fas fa-chevron-down faq-arrow" style="font-size: 12px; color: #64748b; transition: transform 0.2s ease;"></i>
                    </button>
                    <div class="faq-panel" style="max-height: 0px; overflow: hidden; transition: max-height 0.25s ease-out; background: #ffffff;">
                        <div style="padding: 20px; font-size: 14px; color: #475569; line-height: 1.6; border-top: 1px solid #e2e8f0;">
                            ${faqItem.a}
                        </div>
                    </div>
                </div>`;
        });
    }
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

        if (data.history) { drawReleaseRows(data.history, data.download_url); }
        startAutoSwipe();
    })
    .catch(err => {
        console.error("Config missing tracking, running fallback:", err);
        const fallbackHistory = [{ "version": "v1.0 (Latest)", "date": "July 2026", "codename": "Zena", "updates": "First Release.", "status": "Nightly", "download_link": "https://github.com" }];
        drawReleaseRows(fallbackHistory, "https://github.com");
    });

const savedLang = localStorage.getItem('selectedLanguage') || 'en';
document.getElementById('lang-selector').value = savedLang;
setTimeout(() => { changeLanguage(savedLang); }, 150);

if(window.location.hash === "#guide") showGuide();
if(window.location.hash === "#releases") showReleases();
