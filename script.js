const initialVocabulary = [
    { id: 1, word: "Vocabulary", ipa: "/vəˈkæb.jə.lər.i/", meaning: "Từ vựng", level: "A1-A2" },
    { id: 2, word: "Developer", ipa: "/dɪˈvel.ə.pər/", meaning: "Lập trình viên", level: "B1-B2" },
    { id: 3, word: "Algorithm", ipa: "/ˈæl.ɡə.rɪ.ðəm/", meaning: "Thuật toán", level: "C1-C2" },
    { id: 4, word: "Innovation", ipa: "/ˌɪn.əˈveɪ.ʃən/", meaning: "Sự đổi mới", level: "B1-B2" },
    { id: 5, word: "Database", ipa: "/ˈdeɪ.tə.beɪs/", meaning: "Cơ sở dữ liệu", level: "B1-B2" }
];

const groupMembers = [
    { name: "Vương Hồng Trí (Trưởng Nhóm)", xp: 1250, petLevel: "Cấp 4: Cyber Dragon 🐉" },
    { name: "Thành Viên 2", xp: 950, petLevel: "Cấp 3: Cyber Robot 🤖" },
    { name: "Thành Viên 3", xp: 800, petLevel: "Cấp 2: Quái Vật Nhỏ 👾" },
    { name: "Thành Viên 4", xp: 650, petLevel: "Cấp 2: Quái Vật Nhỏ 👾" },
    { name: "Thành Viên 5", xp: 500, petLevel: "Cấp 1: Trứng Cyber 🥚" },
    { name: "Thành Viên 6", xp: 420, petLevel: "Cấp 1: Trứng Cyber 🥚" },
    { name: "Thành Viên 7", xp: 350, petLevel: "Cấp 1: Trứng Cyber 🥚" }
];

let vocabularyList = [];
let userXp = 150;
let bossHp = 100;
let currentFlashcardIndex = 0;
let currentBossQuiz = null;
let selectedPlanName = "";

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);

        if (type === 'hit') {
            osc.frequency.setValueAtTime(160, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'win') {
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        }
    } catch (e) { }
}

function loadData() {
    const stored = localStorage.getItem('vocab_cyber_data');
    vocabularyList = stored ? JSON.parse(stored) : [...initialVocabulary];
    renderLeaderboard();
    updateStats();
    startCountdown();
    init3DTilt();
}

function updateStats() {
    document.getElementById('userXp').textContent = `${userXp} XP`;
    updatePetEvolution();
}

function updatePetEvolution() {
    const avatar = document.getElementById('petAvatar');
    const name = document.getElementById('petName');
    const desc = document.getElementById('petDesc');
    const bar = document.getElementById('petProgressBar');

    if (userXp < 300) {
        avatar.textContent = "🥚";
        name.textContent = "Trứng Cyber (Cấp 1)";
        desc.textContent = `Cần ${300 - userXp} XP nữa để Ấp Trứng Tiến Hóa!`;
        bar.style.width = `${(userXp / 300) * 100}%`;
    } else if (userXp < 800) {
        avatar.textContent = "👾";
        name.textContent = "Quái Vật Cyber (Cấp 2)";
        desc.textContent = `Cần ${800 - userXp} XP nữa để Tiến Hóa Robot!`;
        bar.style.width = `${((userXp - 300) / 500) * 100}%`;
    } else {
        avatar.textContent = "🐉";
        name.textContent = "Rồng Huyền Thoại Cyber (Cấp Max)";
        desc.textContent = "Linh vật đạt cấp độ tối thượng!";
        bar.style.width = "100%";
    }
}

function switchPage(pageId, element) {
    document.querySelectorAll('main > div').forEach(page => page.style.display = 'none');
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');

    if (pageId === 'bossPage') initBossBattle();
    if (pageId === 'flashcardPage') initFlashcard();
}

function init3DTilt() {
    const card = document.getElementById('flashcard3D');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = `rotateY(${x / 15}deg) rotateX(${-y / 15}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
}

function initFlashcard() {
    currentFlashcardIndex = 0;
    showFlashcard();
}

function showFlashcard() {
    const item = vocabularyList[currentFlashcardIndex];
    if (!item) return;

    document.getElementById('flashLevel').textContent = `LEVEL: ${item.level}`;
    document.getElementById('flashWordFront').textContent = item.word;
    document.getElementById('flashWordBack').textContent = item.word;
    document.getElementById('flashIpa').textContent = item.ipa;
    document.getElementById('flashMeaning').textContent = item.meaning;
    document.getElementById('flashcard3D').classList.remove('flipped');

    document.getElementById('cyberProgressBar').style.width = `${((currentFlashcardIndex + 1) / vocabularyList.length) * 100}%`;
}

function flipCard() { document.getElementById('flashcard3D').classList.toggle('flipped'); }
function nextCard() { currentFlashcardIndex = (currentFlashcardIndex + 1) % vocabularyList.length; showFlashcard(); }
function prevCard() { currentFlashcardIndex = (currentFlashcardIndex - 1 + vocabularyList.length) % vocabularyList.length; showFlashcard(); }

function markMastered() {
    userXp += 50;
    updateStats();
    playSound('win');
    confetti({ particleCount: 100, spread: 70 });
    nextCard();
}

function initBossBattle() {
    bossHp = 100;
    document.getElementById('bossHpBar').style.width = '100%';
    nextBossQuiz();
}

function nextBossQuiz() {
    if (vocabularyList.length === 0) return;
    const randomWord = vocabularyList[Math.floor(Math.random() * vocabularyList.length)];
    currentBossQuiz = randomWord;

    document.getElementById('quizWord').textContent = randomWord.word;

    let options = [randomWord.meaning];
    while (options.length < 4 && options.length < vocabularyList.length) {
        let randMeaning = vocabularyList[Math.floor(Math.random() * vocabularyList.length)].meaning;
        if (!options.includes(randMeaning)) options.push(randMeaning);
    }
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('quizOptions');
    container.innerHTML = options.map(opt => `
        <button class="btn-option" onclick="checkBossAnswer('${opt}')">${opt}</button>
    `).join('');
}

function checkBossAnswer(selectedMeaning) {
    const bossSprite = document.getElementById('bossSprite');
    if (selectedMeaning === currentBossQuiz.meaning) {
        playSound('hit');
        bossHp -= 25;
        if (bossHp < 0) bossHp = 0;
        document.getElementById('bossHpBar').style.width = `${bossHp}%`;

        bossSprite.style.transform = 'scale(1.3) rotate(15deg)';
        setTimeout(() => bossSprite.style.transform = 'none', 200);

        userXp += 30;
        updateStats();

        if (bossHp === 0) {
            playSound('win');
            confetti({ particleCount: 150, spread: 100 });
            alert("🎉 XUẤT SẮC! Bạn đã tiêu diệt Trùm Từ Vựng! (+100 XP Bonus)");
            userXp += 100;
            updateStats();
            initBossBattle();
        } else {
            nextBossQuiz();
        }
    } else {
        alert(`❌ SAI RỒI! Đáp án đúng của "${currentBossQuiz.word}" là: ${currentBossQuiz.meaning}`);
        nextBossQuiz();
    }
}

let currentAngle = 0;
function spinWheel() {
    const wheel = document.getElementById('wheel');
    currentAngle += Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${currentAngle}deg)`;

    setTimeout(() => {
        const item = vocabularyList[Math.floor(Math.random() * vocabularyList.length)];
        document.getElementById('resWord').textContent = item.word;
        document.getElementById('resIpa').textContent = item.ipa;
        document.getElementById('resMeaning').textContent = item.meaning;
        document.getElementById('wheelResult').style.display = 'block';
        playSound('win');
        confetti({ particleCount: 80, spread: 60 });
    }, 3000);
}

function speakText(text) {
    if ('speechSynthesis' in window && text) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    }
}
function speakCurrentWord() { speakText(vocabularyList[currentFlashcardIndex]?.word); }

function openPayment(planName, price) {
    selectedPlanName = planName;
    document.getElementById('modalPlanName').textContent = `Đang Đăng Ký: ${planName} (${price})`;
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePayment() {
    document.getElementById('paymentModal').style.display = 'none';
}

function confirmPayment(event) {
    event.preventDefault();
    const name = document.getElementById('buyerName').value.trim();
    const email = document.getElementById('buyerEmail').value.trim();
    const method = document.getElementById('payMethod').value;
    const btn = document.getElementById('btnPaySubmit');

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ĐANG GỬI MÃ VIP QUA EMAIL...`;

    setTimeout(() => {
        playSound('win');
        confetti({ particleCount: 150, spread: 90 });
        alert(`🎉 THÀNH CÔNG!\nCảm ơn ${name} đã kích hoạt gói: ${selectedPlanName}!\n\n📧 Mã kích hoạt VIP đã gửi tới hòm thư: ${email}\n💳 Phương thức: ${method}`);

        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-lock"></i> XÁC NHẬN VÀ GỬI EMAIL TỰ ĐỘNG`;
        closePayment();
    }, 1200);
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;
    tbody.innerHTML = groupMembers.map((m, index) => `
        <tr>
            <td><b>#${index + 1}</b></td>
            <td>${m.name}</td>
            <td>${m.petLevel}</td>
            <td><b style="color:#00f0ff">${m.xp} XP</b></td>
        </tr>
    `).join('');
}

function startCountdown() {
    let duration = 15 * 60;
    const timerElem = document.getElementById('cyberTimer');
    setInterval(() => {
        let mins = Math.floor(duration / 60);
        let secs = duration % 60;
        if (timerElem) timerElem.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (duration > 0) duration--;
    }, 1000);
}

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

for (let i = 0; i < 45; i++) {
    particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 });
}

function animateBg() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f0ff';
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(animateBg);
}
animateBg();

document.addEventListener('DOMContentLoaded', loadData);