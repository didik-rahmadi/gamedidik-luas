/* ===========================================================
   GAME ENGINE - PETUALANGAN LUAS BANGUN DATAR
   Berisi: Scaling System, Map Logic, Credits, & Navigation
   =========================================================== */

// --- 1. GLOBAL VARIABLES ---
const totalLevels = 8;
let maxUnlocked = parseInt(localStorage.getItem('mathAdventure_maxLevel')) || 1;

// --- 2. SISTEM SCALING & LOADING (Jantung Aplikasi) ---

document.addEventListener('DOMContentLoaded', () => {
    // A. Jalankan Scaling
    scaleContainer();
    
    // B. Cek Halaman: Apakah ini Peta (Index)?
    if (document.getElementById('view-map')) {
        updateMapVisuals(); // Update gembok
    }

    // C. Cek Halaman: Apakah ini Level Game?
    // Jika ada fungsi randomizeLabels (milik Level 1), jalankan.
    if (typeof randomizeLabels === 'function') {
        randomizeLabels();
    }

    // D. Munculkan Game (Anti-Glitch)
    setTimeout(() => {
        const container = document.getElementById('game-container');
        if(container) container.classList.add('loaded');
    }, 100);
});

// Event Listeners untuk Kestabilan Tampilan
window.addEventListener('load', scaleContainer);

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scaleContainer, 100);
});

function scaleContainer() {
    const container = document.getElementById('game-container');
    if (!container) return;

    const targetWidth = 1920;
    const targetHeight = 1080;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const targetRatio = targetWidth / targetHeight;
    const windowRatio = windowWidth / windowHeight;
    let scale;

    // Logika Letterbox
    if (windowRatio < targetRatio) {
        scale = windowWidth / targetWidth;
    } else {
        scale = windowHeight / targetHeight;
    }

    container.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

// --- 3. LOGIKA PETA (INDEX) ---

function updateMapVisuals() {
    for (let i = 1; i <= totalLevels; i++) {
        const node = document.getElementById(`node-${i}`);
        if (!node) continue; // Lewati jika node tidak ditemukan (misal di halaman level)

        node.className = 'map-node';
        if (i < maxUnlocked) { node.classList.add('completed'); } 
        else if (i === maxUnlocked) { node.classList.add('active'); } 
        else { node.classList.add('locked'); }
    }
}

function enterLevel(levelNum) {
    // Ambil ulang data terbaru untuk memastikan sinkronisasi
    let currentMax = parseInt(localStorage.getItem('mathAdventure_maxLevel')) || 1;
    
    if (levelNum > currentMax) { 
        alert("Selesaikan level sebelumnya dulu! 🔒"); 
        return; 
    }
    
    // Navigasi ke file HTML Level
    // Pastikan file level dinamai: level-1.html, level-2.html, dst.
    window.location.href = `level-${levelNum}.html`;
}

function resetProgress() {
    if(confirm("Yakin ingin mereset progres permainan dari awal?")) {
        localStorage.removeItem('mathAdventure_maxLevel');
        maxUnlocked = 1; 
        updateMapVisuals();
        alert("Progres berhasil di-reset.");
    }
}

// --- 4. LOGIKA KREDIT (POP-UP) ---

function openCredits() {
    const viewDev = document.getElementById('view-dev');
    if(viewDev) {
        viewDev.classList.remove('hidden');
        switchDevSlide(1); 
    }
}

function closeCredits() {
    const viewDev = document.getElementById('view-dev');
    if(viewDev) viewDev.classList.add('hidden');
}

function switchDevSlide(n) {
    for(let i=1; i<=3; i++) {
        const slide = document.getElementById(`dev-slide-${i}`);
        if(slide) slide.classList.add('hidden');
    }
    const target = document.getElementById(`dev-slide-${n}`);
    if(target) target.classList.remove('hidden');
}

// --- 5. LOGIKA NAVIGASI LEVEL (SHARED) ---

// Fungsi keluar paksa ke index
function forceExit() {
    window.location.href = 'index.html';
}

// Fungsi Simpan & Keluar (Dipakai di akhir setiap level)
function saveAndExit(nextLevelTarget) {
    // nextLevelTarget opsional, jika tidak diisi defaultnya unlock level berikutnya
    let currentMax = parseInt(localStorage.getItem('mathAdventure_maxLevel')) || 1;
    
    // Logika unlock: Jika level yang baru selesai >= maxUnlocked, maka buka level baru
    // Tapi karena kita di file terpisah, kita asumsikan fungsi ini dipanggil saat LULUS level.
    
    // Cara cerdas mendeteksi level berapa ini:
    // Ambil angka dari nama file (misal level-1.html -> 1)
    const path = window.location.pathname;
    const levelMatch = path.match(/level-(\d+)/);
    
    if (levelMatch) {
        const currentLevel = parseInt(levelMatch[1]);
        if (currentLevel === currentMax && currentLevel < totalLevels) {
            localStorage.setItem('mathAdventure_maxLevel', currentLevel + 1);
        }
    }

    window.location.href = 'index.html';
}