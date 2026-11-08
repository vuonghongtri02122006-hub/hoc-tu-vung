// 1. DANH SÁCH TỪ VỰNG MẪU BAN ĐẦU
const initialVocabulary = [
    { id: 1, word: "Vocabulary", ipa: "/vəˈkæb.jə.lər.i/", meaning: "Từ vựng", example: "Reading improves your vocabulary.", category: "Giao tiếp", level: "A1-A2" },
    { id: 2, word: "Developer", ipa: "/dɪˈvel.ə.pər/", meaning: "Lập trình viên", example: "She is a senior web developer.", category: "Công nghệ", level: "B1-B2" },
    { id: 3, word: "Algorithm", ipa: "/ˈæl.ɡə.rɪ.ðəm/", meaning: "Thuật toán", example: "Complex algorithms process big data.", category: "Công nghệ", level: "C1-C2" },
    { id: 4, word: "Negotiation", ipa: "/nəˌɡəʊ.ʃiˈeɪ.ʃən/", meaning: "Đàm phán", example: "The negotiation was successful.", category: "Công sở", level: "B1-B2" },
    { id: 5, word: "Perseverance", ipa: "/ˌpɜː.sɪˈvɪə.rəns/", meaning: "Sự kiên trì", example: "Success requires hard work and perseverance.", category: "Giao tiếp", level: "C1-C2" },
    { id: 6, word: "Knowledge", ipa: "/ˈnɒl.ɪdʒ/", meaning: "Kiến thức", example: "Books are a great source of knowledge.", category: "Học tập", level: "A1-A2" },
    { id: 7, word: "Database", ipa: "/ˈdeɪ.tə.beɪs/", meaning: "Cơ sở dữ liệu", example: "Data is stored safely in the database.", category: "Công nghệ", level: "B1-B2" },
    { id: 8, word: "Efficiency", ipa: "/ɪˈfɪʃ.ən.si/", meaning: "Hiệu suất", example: "Automation improves work efficiency.", category: "Công sở", level: "C1-C2" },
    { id: 9, word: "Schedule", ipa: "/ˈʃed.juːl/", meaning: "Lịch trình", example: "Check your daily schedule carefully.", category: "Học tập", level: "A1-A2" },
    { id: 10, word: "Innovation", ipa: "/ˌɪn.əˈveɪ.ʃən/", meaning: "Sự đổi mới", example: "Innovation drives growth in business.", category: "Công nghệ", level: "C1-C2" }
];

let vocabularyList = [];

// 2. TẢI DỮ LIỆU TỪ LOCALSTORAGE
function loadData() {
    const storedData = localStorage.getItem('vocab_master_data');
    if (storedData) {
        vocabularyList = JSON.parse(storedData);
    } else {
        vocabularyList = [...initialVocabulary];
        saveData();
    }
}

function saveData() {
    localStorage.setItem('vocab_master_data', JSON.stringify(vocabularyList));
}

// 3. LOGIC CHUYỂN TRANG MƯỢT MÀ
function switchPage(pageId, element) {
    const pages = document.querySelectorAll('main > div');
    pages.forEach(page => page.style.display = 'none');

    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.style.display = 'block';
    }

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    if (element) {
        element.classList.add('active');
    } else {
        const targetBtn = Array.from(navBtns).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(pageId));
        if (targetBtn) targetBtn.classList.add('active');
    }

    if (pageId === 'vocabPage') {
        renderVocabList();
    } else if (pageId === 'flashcardPage') {
        initFlashcard();
    }
}

// 4. LỌC VÀ HIỂN THỊ KHO TỪ VỰNG
let currentLevelFilter = 'all';
let currentCategoryFilter = 'all';

function renderVocabList() {
    const gridContainer = document.getElementById('vocabGrid');
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    if (!gridContainer) return;

    const filteredList = vocabularyList.filter(item => {
        const matchSearch = item.word.toLowerCase().includes(searchTerm) ||
            item.meaning.toLowerCase().includes(searchTerm) ||
            item.ipa.toLowerCase().includes(searchTerm);
        const matchLevel = (currentLevelFilter === 'all') || (item.level === currentLevelFilter);
        const matchCategory = (currentCategoryFilter === 'all') || (item.category === currentCategoryFilter);
        return matchSearch && matchLevel && matchCategory;
    });

    updateStats();

    if (filteredList.length === 0) {
        gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">Không tìm thấy từ vựng phù hợp.</p>`;
        return;
    }

    gridContainer.innerHTML = filteredList.map(item => `
        <div class="vocab-card">
            <div class="card-header">
                <span class="badge category-badge">${item.category}</span>
                <span class="badge level-badge ${getLevelClass(item.level)}">${item.level}</span>
                <button class="delete-btn" onclick="deleteWord(${item.id})" title="Xóa từ"><i class="fa-solid fa-trash"></i></button>
            </div>
            <h3 class="word-title">${item.word}</h3>
            <p class="word-ipa">${item.ipa}</p>
            <p class="word-meaning"><b>Nghĩa:</b> ${item.meaning}</p>
            <p class="word-example"><i>Ví dụ:</i> ${item.example}</p>
            <button class="audio-btn" onclick="speakWord('${item.word}')">
                <i class="fa-solid fa-volume-high"></i>
            </button>
        </div>
    `).join('');
}

function getLevelClass(level) {
    if (level === 'A1-A2') return 'level-a';
    if (level === 'B1-B2') return 'level-b';
    if (level === 'C1-C2') return 'level-c';
    return '';
}

function updateStats() {
    const totalElem = document.getElementById('totalCount');
    const countA = document.getElementById('countA');
    const countB = document.getElementById('countB');
    const countC = document.getElementById('countC');

    if (totalElem) totalElem.textContent = vocabularyList.length;
    if (countA) countA.textContent = vocabularyList.filter(i => i.level === 'A1-A2').length;
    if (countB) countB.textContent = vocabularyList.filter(i => i.level === 'B1-B2').length;
    if (countC) countC.textContent = vocabularyList.filter(i => i.level === 'C1-C2').length;
}

function filterByLevel(level, btnElement) {
    currentLevelFilter = level;
    document.querySelectorAll('.level-filter-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    renderVocabList();
}

function filterByCategory(category, btnElement) {
    currentCategoryFilter = category;
    document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    renderVocabList();
}

function deleteWord(id) {
    if (confirm("Bạn có chắc chắn muốn xóa từ này khỏi kho từ vựng?")) {
        vocabularyList = vocabularyList.filter(item => item.id !== id);
        saveData();
        renderVocabList();
    }
}

// 5. THÊM TỪ MỚI
function handleAddWord(event) {
    event.preventDefault();

    const wordInput = document.getElementById('inputWord');
    const ipaInput = document.getElementById('inputIpa');
    const meaningInput = document.getElementById('inputMeaning');
    const levelSelect = document.getElementById('selectLevel');
    const categorySelect = document.getElementById('selectCategory');
    const exampleInput = document.getElementById('inputExample');

    const newWord = {
        id: Date.now(),
        word: wordInput.value.trim(),
        ipa: ipaInput.value.trim() || '/.../',
        meaning: meaningInput.value.trim(),
        level: levelSelect.value,
        category: categorySelect.value,
        example: exampleInput.value.trim() || 'No example available.'
    };

    vocabularyList.unshift(newWord);
    saveData();

    alert("🎉 Đã thêm từ mới vào kho từ vựng thành công!");
    document.getElementById('addWordForm').reset();
    switchPage('vocabPage', null);
}

// 6. FLASHCARD 3D
let currentFlashcardIndex = 0;
let isFlipped = false;

function initFlashcard() {
    if (vocabularyList.length === 0) return;
    currentFlashcardIndex = 0;
    isFlipped = false;
    showFlashcard();
}

function showFlashcard() {
    const card = document.getElementById('flashcard3D');
    if (!card || vocabularyList.length === 0) return;

    card.classList.remove('flipped');
    isFlipped = false;

    const currentItem = vocabularyList[currentFlashcardIndex];

    document.getElementById('flashLevel').textContent = currentItem.level;
    document.getElementById('flashWordFront').textContent = currentItem.word;
    document.getElementById('flashWordBack').textContent = currentItem.word;
    document.getElementById('flashIpa').textContent = currentItem.ipa;
    document.getElementById('flashMeaning').textContent = currentItem.meaning;
    document.getElementById('flashExample').textContent = currentItem.example;
}

function flipCard() {
    const card = document.getElementById('flashcard3D');
    if (card) {
        card.classList.toggle('flipped');
        isFlipped = !isFlipped;
    }
}

function nextCard() {
    if (vocabularyList.length === 0) return;
    currentFlashcardIndex = (currentFlashcardIndex + 1) % vocabularyList.length;
    showFlashcard();
}

function prevCard() {
    if (vocabularyList.length === 0) return;
    currentFlashcardIndex = (currentFlashcardIndex - 1 + vocabularyList.length) % vocabularyList.length;
    showFlashcard();
}

// 7. PHÁT ÂM AUDIO CHUẨN MỸ
function speakWord(text) {
    const wordToSpeak = text || (vocabularyList[currentFlashcardIndex] ? vocabularyList[currentFlashcardIndex].word : '');
    if ('speechSynthesis' in window && wordToSpeak) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Trình duyệt không hỗ trợ phát âm.");
    }
}

// 8. ĐĂNG KÝ BẢNG GIÁ PRO & MODAL THANH TOÁN
let selectedPlanData = { name: '', price: '' };

function selectPlan(planName, price) {
    selectedPlanData = { name: planName, price: price };
    document.getElementById('modalPlanName').textContent = `Bạn đã chọn: ${planName}`;
    document.getElementById('modalPlanPrice').textContent = price;
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function handleConfirmPayment(event) {
    event.preventDefault();

    const name = document.getElementById('buyerName').value.trim();
    const email = document.getElementById('buyerEmail').value.trim();
    const method = document.querySelector('input[name="paymentMethod"]:checked').value;

    const payBtn = document.querySelector('.btn-pay');
    payBtn.disabled = true;
    payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý giao dịch...`;

    setTimeout(() => {
        alert(`🎉 THÀNH CÔNG!\nCảm ơn ${name} đã đăng ký thành công ${selectedPlanData.name}!\n\n📧 Mã kích hoạt đã được gửi tới: ${email}\n💳 Phương thức thanh toán: ${method}`);

        document.getElementById('paymentForm').reset();
        payBtn.disabled = false;
        payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Xác Nhận Thanh Toán`;
        closePaymentModal();
    }, 1200);
}

// DOM LOADED
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderVocabList();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', renderVocabList);

    const addForm = document.getElementById('addWordForm');
    if (addForm) addForm.addEventListener('submit', handleAddWord);
});