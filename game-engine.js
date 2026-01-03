/* ===========================================================
   GAME ENGINE - PETUALANGAN LUAS BANGUN DATAR
   Berisi: Scaling System, Map Logic, Credits, & Navigation
   =========================================================== */

// --- 1. GLOBAL VARIABLES ---
const totalLevels = 8;
let maxUnlocked = parseInt(localStorage.getItem('mathAdventure_maxLevel')) || 1;

// --- 2. SISTEM SCALING & LOADING (Jantung Aplikasi) ---

document.addEventListener('DOMContentLoaded', () => {
    scaleContainer(); // Hitung skala awal
    
    // Logika visual map & level tetap sama...
    if (document.getElementById('view-map')) {
        updateMapVisuals();
    }
    if (typeof randomizeLabels === 'function') {
        randomizeLabels();
    }

    // Munculkan container setelah scaling selesai agar tidak "glitch"
    setTimeout(() => {
        const container = document.getElementById('game-container');
        if(container) container.classList.add('loaded');
    }, 100);
});

// Event Listener yang LEBIH KUAT untuk HP
window.addEventListener('resize', scaleContainer);
window.addEventListener('orientationchange', () => {
    // Beri jeda sedikit saat memutar HP agar browser selesai merender layout baru
    setTimeout(scaleContainer, 200);
});

// Support modern untuk mendeteksi zoom/keyboard di HP
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scaleContainer);
}

function scaleContainer() {
    const container = document.getElementById('game-container');
    if (!container) return;

    const targetWidth = 1920;
    const targetHeight = 1080;

    // Gunakan visualViewport jika ada (lebih akurat untuk HP), kalau tidak ada pakai window biasa
    const winW = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const winH = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    // Hitung rasio untuk Lebar dan Tinggi
    const scaleX = winW / targetWidth;
    const scaleY = winH / targetHeight;

    // KUNCI UTAMA: Gunakan Math.min
    // Ini memastikan game selalu masuk ke layar (Letterbox), tidak akan pernah terpotong.
    // Skala diambil dari sisi yang "paling sempit".
    const scale = Math.min(scaleX, scaleY);

    // Terapkan Transformasi
    container.style.transform = `translate(-50%, -50%) scale(${scale})`;
    
    // Opsional: Pastikan container tetap di tengah layar visual
    // (Kadang perlu jika keyboard HP muncul)
    if (window.visualViewport) {
        container.style.left = `${window.visualViewport.offsetLeft + winW / 2}px`;
        container.style.top = `${window.visualViewport.offsetTop + winH / 2}px`;
    }
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
