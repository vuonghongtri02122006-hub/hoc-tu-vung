// Dữ liệu từ vựng ban đầu
const initialVocab = [
    { id: 1, word: 'Vocabulary', phonetic: '/vəˈkæb.jə.lər.i/', meaning: 'Từ vựng', level: 'A1-A2', topic: 'daily', example: 'Reading improves your vocabulary.' },
    { id: 2, word: 'Developer', phonetic: '/dɪˈvel.ə.pər/', meaning: 'Lập trình viên', level: 'B1-B2', topic: 'technology', example: 'She is a senior web developer.' },
    { id: 3, word: 'Algorithm', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', meaning: 'Thuật toán', level: 'C1-C2', topic: 'technology', example: 'Complex algorithms process big data.' },
    { id: 4, word: 'Negotiation', phonetic: '/nəˌɡəʊ.ʃiˈeɪ.ʃən/', meaning: 'Cuộc đàm phán', level: 'B1-B2', topic: 'business', example: 'The contract is under negotiation.' },
    { id: 5, word: 'Perseverance', phonetic: '/ˌpɜː.sɪˈvɪə.rəns/', meaning: 'Sự kiên trì', level: 'C1-C2', topic: 'daily', example: 'Success requires perseverance.' },
    { id: 6, word: 'Knowledge', phonetic: '/ˈnɒl.ɪdʒ/', meaning: 'Kiến thức', level: 'A1-A2', topic: 'education', example: 'Knowledge is key to freedom.' }
];

let vocabList = JSON.parse(localStorage.getItem('myVocabData')) || initialVocab;
let currentLevel = 'all';
let currentTopic = 'all';
let currentFlashcardIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    renderVocabGrid();
    updateStats();
    updateFlashcardUI();
});

// Chuyển đổi trang thông qua Navbar
function switchPage(pageId, element) {
    document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active-page'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(pageId).classList.add('active-page');
    element.classList.add('active');
}

// Điều hướng từ nút bấm ở Hero Section
function navigateToPage(pageId) {
    const navBtnMap = {
        'vocabPage': 1,
        'flashcardPage': 2
    };
    const navBtns = document.querySelectorAll('.nav-btn');
    switchPage(pageId, navBtns[navBtnMap[pageId]]);
}

// Phát âm từ vựng
function speakWord(word) {
    let utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}

// Hiển thị danh sách từ
function renderVocabGrid() {
    const grid = document.getElementById('vocabGrid');
    grid.innerHTML = '';
    const topicNames = { technology: 'Công nghệ', daily: 'Giao tiếp', business: 'Công sở', education: 'Học tập' };

    vocabList.forEach(item => {
        let levelClass = item.level === 'A1-A2' ? 'a1' : item.level === 'B1-B2' ? 'b1' : 'c1';

        let cardHTML = `
            <div class="vocab-card" data-level="${item.level}" data-topic="${item.topic}">
                <button class="delete-btn" onclick="deleteWord(${item.id})" title="Xóa từ này"><i class="fa-solid fa-trash"></i></button>
                <div class="badge-container">
                    <span class="badge topic-tag ${item.topic}">${topicNames[item.topic] || 'Chủ đề'}</span>
                    <span class="badge level-tag ${levelClass}">${item.level}</span>
                </div>
                <div class="card-header">
                    <span class="word">${item.word}</span>
                    <button class="audio-btn" onclick="speakWord('${item.word}')"><i class="fa-solid fa-volume-high"></i></button>
                </div>
                <span class="phonetic">${item.phonetic}</span>
                <p class="meaning"><b>Nghĩa:</b> ${item.meaning}</p>
                <p class="example"><i>Ví dụ:</i> ${item.example}</p>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    filterVocab();
}

// Bộ lọc Cấp độ & Chủ đề
function selectLevel(level) {
    currentLevel = level;
    updateActiveButton('.level-btn', event.target);
    filterVocab();
}

function selectTopic(topic) {
    currentTopic = topic;
    updateActiveButton('.topic-btn', event.target);
    filterVocab();
}

function updateActiveButton(selector, targetButton) {
    document.querySelectorAll(selector).forEach(btn => btn.classList.remove('active'));
    targetButton.classList.add('active');
}

function filterVocab() {
    let searchInput = document.getElementById('searchInput').value.toLowerCase();
    let cards = document.getElementsByClassName('vocab-card');

    for (let card of cards) {
        let cardLevel = card.getAttribute('data-level');
        let cardTopic = card.getAttribute('data-topic');
        let cardText = card.innerText.toLowerCase();

        let matchLevel = (currentLevel === 'all' || cardLevel === currentLevel);
        let matchTopic = (currentTopic === 'all' || cardTopic === currentTopic);
        let matchSearch = cardText.includes(searchInput);

        card.style.display = (matchLevel && matchTopic && matchSearch) ? "block" : "none";
    }
}

// Thêm từ mới & lưu vĩnh viễn
function addNewWord(event) {
    event.preventDefault();

    let newEntry = {
        id: Date.now(),
        word: document.getElementById('newWord').value,
        phonetic: document.getElementById('newPhonetic').value,
        meaning: document.getElementById('newMeaning').value,
        level: document.getElementById('newLevel').value,
        topic: document.getElementById('newTopic').value,
        example: document.getElementById('newExample').value
    };

    vocabList.push(newEntry);
    localStorage.setItem('myVocabData', JSON.stringify(vocabList));

    renderVocabGrid();
    updateStats();
    updateFlashcardUI();

    document.getElementById('vocabForm').reset();
    alert('Đã thêm từ mới vào kho thành công!');
}

// Xóa từ vựng
function deleteWord(id) {
    if (confirm('Bạn có chắc muốn xóa từ này không?')) {
        vocabList = vocabList.filter(item => item.id !== id);
        localStorage.setItem('myVocabData', JSON.stringify(vocabList));
        renderVocabGrid();
        updateStats();
        updateFlashcardUI();
    }
}

// Thống kê
function updateStats() {
    document.getElementById('totalCount').innerText = vocabList.length;
    document.getElementById('a1Count').innerText = vocabList.filter(i => i.level === 'A1-A2').length;
    document.getElementById('b1Count').innerText = vocabList.filter(i => i.level === 'B1-B2').length;
    document.getElementById('c1Count').innerText = vocabList.filter(i => i.level === 'C1-C2').length;
}

// Flashcard 3D
function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

function updateFlashcardUI() {
    if (vocabList.length === 0) return;
    let item = vocabList[currentFlashcardIndex];

    document.getElementById('fcLevel').innerText = item.level;
    document.getElementById('fcWord').innerText = item.word;
    document.getElementById('fcMeaning').innerText = item.meaning;
    document.getElementById('fcPhonetic').innerText = item.phonetic;
    document.getElementById('fcExample').innerText = item.example || '';

    document.getElementById('flashcard').classList.remove('flipped');
}

function nextCard() {
    currentFlashcardIndex = (currentFlashcardIndex + 1) % vocabList.length;
    updateFlashcardUI();
}

function prevCard() {
    currentFlashcardIndex = (currentFlashcardIndex - 1 + vocabList.length) % vocabList.length;
    updateFlashcardUI();
}

function speakCurrentFlashcard() {
    let item = vocabList[currentFlashcardIndex];
    speakWord(item.word);
}
