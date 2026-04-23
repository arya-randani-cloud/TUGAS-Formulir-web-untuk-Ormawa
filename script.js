const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Konfigurasi Partikel
const config = {
    particleCount: 100, // Jumlah partikel yang cukup agar tidak berat
    particleRadius: 2, // Ukuran titik sirkuit
    lineDistance: 130, // Jarak maksimal untuk menarik garis
    color: 'rgba(59, 91, 219, 0.5)', // Warna biru elektrik sesuai tema (Royal Blue)
    lineColor: '59, 91, 219', // RGB untuk garis agar bisa diatur opacity-nya
    mouseRadius: 120, // Jarak interaksi dengan mouse
    baseSpeed: 0.6 // Kecepatan gerak normal
};

let mouse = {
    x: null,
    y: null
};

// Mengatur ukuran canvas sesuai layar
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * config.baseSpeed;
        this.vy = (Math.random() - 0.5) * config.baseSpeed;
    }

    update() {
        // Gerakan dasar
        this.x += this.vx;
        this.y += this.vy;

        // Memantul saat menyentuh tepi layar
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Interaksi mouse (menghindar)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.mouseRadius) {
                // Menghitung sudut untuk menghindar
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                
                // Kekuatan dorongan semakin besar jika semakin dekat
                let repelDistance = config.mouseRadius - distance;
                
                this.x -= forceDirectionX * (repelDistance / 10);
                this.y -= forceDirectionY * (repelDistance / 10);
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, config.particleRadius, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();
    }
}

// Inisialisasi awal
function init() {
    resize();
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
}

// Looping animasi
function animate() {
    // Membersihkan frame sebelumnya
    ctx.clearRect(0, 0, width, height);
    
    // Update dan gambar semua partikel
    particles.forEach(p => p.update());
    
    // Menggambar garis penghubung (constellation effect)
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.lineDistance) {
                ctx.beginPath();
                // Semakin dekat, garis semakin tebal/jelas
                let opacity = 1 - (distance / config.lineDistance);
                ctx.strokeStyle = `rgba(${config.lineColor}, ${opacity * 0.4})`; // Maksimal opacity garis 0.4
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    // Menggambar titik setelah garis agar titik berada di atas garis
    particles.forEach(p => p.draw());
    
    requestAnimationFrame(animate);
}

// Mulai animasi
init();
animate();

// Menghilangkan Loading Screen saat halaman selesai dimuat
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        // Sedikit delay agar animasi loading sempat terlihat (0.8 detik)
        setTimeout(() => {
            loader.classList.add('loaded');
        }, 800);
    }
});

// Suara Klik Digital (Cyber Click)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCyberClick() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Suara "tik" digital bernada tinggi yang cepat hilang
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05); 

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}

// Pasang efek suara ke semua tombol yang memiliki class glow-button
document.querySelectorAll('.glow-button').forEach(button => {
    button.addEventListener('mousedown', playCyberClick);
});
