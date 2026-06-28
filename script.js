let timerInterval;
let breathInterval;
let breathSubTimer;
let totalTrainSeconds = 0;
let testHoldSeconds = 0;

// فەنکشنی پیشاندانی ئاگادارکردنەوەی لۆکس
function showAlert(message) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    
    alertMessage.innerText = message;
    alertBox.classList.add('active');

    setTimeout(() => {
        alertBox.classList.remove('active');
    }, 3000);
}

// کردنەوەی ئەپەکە
function openApp(appId) {
    document.getElementById('main-homepage').style.display = 'none';
    document.getElementById(appId).style.display = 'flex';
    
    // ئەگەر ئەپەکە Breath بوو، مێنۆی سەرەکی چالاک دەکەین و دۆخەکە ڕێکدەخەینەوە
    if (appId === 'breath-app') {
        showBreathView('breath-menu');
    }
    
    window.scrollTo(0, 0);
}

// داخستنی ئەپەکە
function closeApp() {
    if (timerInterval) clearInterval(timerInterval);
    stopBreathApp(); // وەستاندنی کاتژمێرەکانی هەناسەدان
    
    // شاردنەوەی هەموو ئەپەکان
    document.getElementById('age-calc-app').style.display = 'none';
    document.getElementById('bmi-app').style.display = 'none';
    document.getElementById('signature-app').style.display = 'none';
    document.getElementById('iv-drip-app').style.display = 'none';
    document.getElementById('breath-app').style.display = 'none';

    // پاککردنەوەی داتاکانی BMI و IV ئەگەر پێویست بکات
    document.getElementById('bmi-result-box').style.display = 'none';
    document.getElementById('iv-result').style.display = 'none';

    // نیشاندانەوەی پەیجی سەرەکی
    document.getElementById('main-homepage').style.display = 'block';
    
    window.scrollTo(0, 0);
}

// ─── لۆجیکی ئەپی حیسابکردنی تەمەن ───
function startAgeCalculation() {
    const day = parseInt(document.getElementById('birth-day').value);
    const month = parseInt(document.getElementById('birth-month').value);
    const year = parseInt(document.getElementById('birth-year').value);

    if (!day || !month || !year) {
        showAlert("تکایە تەواوی خانەکان (ڕۆژ، مانگ، ساڵ) پڕبکەرەوە!");
        return;
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2026) {
        showAlert("تکایە بەروارێکی ڕاستەقینە و دروست بنووسە!");
        return;
    }

    const birthDate = new Date(year, month - 1, day);
    const now = new Date();

    if (now - birthDate < 0) {
        showAlert("ڕێکەوتی لەدایکبوون ناتوانێت لە کاتی ئێستا گەورەتر بێت!");
        return;
    }

    document.getElementById('age-result').style.display = 'grid';

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const currentDate = new Date();
        
        let years = currentDate.getFullYear() - birthDate.getFullYear();
        let months = currentDate.getMonth() - birthDate.getMonth();
        let days = currentDate.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            days += previousMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const seconds = currentDate.getSeconds();

        document.getElementById('res-years').innerText = years;
        document.getElementById('res-months').innerText = months;
        document.getElementById('res-days').innerText = days;
        document.getElementById('res-hours').innerText = hours;
        document.getElementById('res-minutes').innerText = minutes;
        document.getElementById('res-seconds').innerText = seconds;

    }, 1000);
}

// ─── لۆجیکی ئەپی واژۆی دیجیتاڵی ───
const canvas = document.getElementById('signature-canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let isEraser = false;
let currentPenColor = '#ffffff';
let currentPenSize = 3;

if (canvas) {
    ctx.strokeStyle = currentPenColor;
    ctx.lineWidth = currentPenSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    canvas.style.transition = 'background 0.4s ease, border-color 0.4s ease';

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);

    canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        ctx.beginPath();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    });
    canvas.addEventListener('touchmove', (e) => {
        if (isDrawing) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
        }
    });
    canvas.addEventListener('touchend', () => isDrawing = false);
}

function setPenColor(color, element) {
    isEraser = false;
    document.getElementById('eraser-btn').classList.remove('active-tool');
    currentPenColor = color;
    ctx.strokeStyle = currentPenColor;
    ctx.globalCompositeOperation = 'source-over'; 

    document.getElementById('size-preview-circle').style.backgroundColor = color;

    if (color === '#111827') {
        canvas.style.background = 'rgba(255, 255, 255, 0.9)';
        canvas.style.borderColor = '#111827';
    } else {
        canvas.style.background = 'rgba(255, 255, 255, 0.03)';
        canvas.style.borderColor = 'rgba(0, 210, 255, 0.3)';
    }

    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
}

function setPenSize(size) {
    currentPenSize = size;
    ctx.lineWidth = currentPenSize;
    const previewCircle = document.getElementById('size-preview-circle');
    previewCircle.style.width = size + 'px';
    previewCircle.style.height = size + 'px';
}

function toggleEraser() {
    isEraser = !isEraser;
    const eraserBtn = document.getElementById('eraser-btn');
    const previewCircle = document.getElementById('size-preview-circle');
    
    if (isEraser) {
        eraserBtn.classList.add('active-tool');
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        ctx.globalCompositeOperation = 'destination-out'; 
        previewCircle.style.backgroundColor = '#ef4444';
    } else {
        eraserBtn.classList.remove('active-tool');
        ctx.globalCompositeOperation = 'source-over';
        const firstColorOpt = document.querySelector('.color-option');
        setPenColor(currentPenColor, firstColorOpt);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function downloadSignature() {
    const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    if (!buffer.some(color => color !== 0)) {
        showAlert("تکایە سەرەتا واژۆکەت بکە، پاشان دایبەزێنە!");
        return;
    }
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'signature.png';
    link.click();
}

// ─── لۆجیکی ئەپی حاسیبەی کێش و باڵ (BMI) ───
function calculateBMI() {
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const heightCm = parseFloat(document.getElementById('bmi-height').value);

    if (!weight || !heightCm) {
        showAlert("تکایە کێش و باڵەکەت بە دروستی بنووسە!");
        return;
    }

    if (weight < 10 || weight > 300 || heightCm < 50 || heightCm > 250) {
        showAlert("تکایە ژمارەکان لە نێوان مەودای ڕاستەقینەدا بنووسە!");
        return;
    }

    const heightM = heightCm / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    document.getElementById('bmi-score-value').innerText = bmi;
    
    const resultBox = document.getElementById('bmi-result-box');
    const statusBadge = document.getElementById('bmi-status-badge');
    const adviceText = document.getElementById('bmi-advice');
    const needle = document.getElementById('gauge-needle');
    
    resultBox.style.display = 'block';
    statusBadge.className = 'bmi-status';

    let angle = -90; 
    if (bmi < 18.5) {
        angle = -90 + ((bmi / 18.5) * 45);
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        angle = -45 + (((bmi - 18.5) / 6.4) * 45);
    } else if (bmi >= 25 && bmi <= 29.9) {
        angle = 0 + (((bmi - 25) / 4.9) * 45);
    } else {
        let tempObese = Math.min(bmi, 40);
        angle = 45 + (((tempObese - 30) / 10) * 45);
    }

    setTimeout(() => {
        needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }, 100);

    if (bmi < 18.5) {
        statusBadge.innerText = "کێش کەم";
        statusBadge.classList.add('status-underweight');
        adviceText.innerText = "کێشت لە خوار ڕێژەی ئاساییەوەیە. پێویستە گرنگی بە خواردنی دەوڵەمەند بە پرۆتین و کالۆری بدەیت.";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        statusBadge.innerText = "ئاسایی";
        statusBadge.classList.add('status-normal');
        adviceText.innerText = "دەستخۆش! کێشت یەکجار گونجاو و تەندروستە. بەردەوام بە لەسەر پاراستنی ئەم ئاستە.";
    } else if (bmi >= 25 && bmi <= 29.9) {
        statusBadge.innerText = "کێش زیادە";
        statusBadge.classList.add('status-overweight');
        adviceText.innerText = "تۆزێک کێشت زیادە. پێشنیار دەکرێت خواردنی شیرینی کەم بکەیتەوە و ڕۆژانە بە پێ بڕۆیت.";
    } else {
        statusBadge.innerText = "قەڵەو";
        statusBadge.classList.add('status-obese');
        adviceText.innerText = "کێشت لە ئاستی قەڵەویدایە کە مەترسی بۆ سەر تەندروستی دروست دەکات. پێویستە سیستەمێکی خۆراکی تەندروست بگریتەبەر.";
    }
}

// ─── لۆجیکی ئەپی حاسیبەی موغەزی (IV Drip) ───
function calculateIV() {
    const vol = parseFloat(document.getElementById('iv-volume').value);
    const time = parseFloat(document.getElementById('iv-time').value);
    const factor = parseFloat(document.getElementById('iv-factor').value);
    
    if (!vol || !time) return showAlert("تکایە داتا بنووسە!");

    const dpm = Math.round((vol * factor) / (time * 60));
    document.getElementById('iv-speed').innerText = dpm;
    document.getElementById('iv-result').style.display = 'block';

    const container = document.getElementById('drip-container');
    container.innerHTML = ''; 
    
    const dripInterval = (60 / dpm) * 1000;

    setInterval(() => {
        const drop = document.createElement('div');
        drop.className = 'drop';
        container.appendChild(drop);
        setTimeout(() => drop.remove(), 1000);
    }, dripInterval);
}

// ─── لۆجیکی نوێ و یەکگرتووی ئەپی هەناسەدان (Breath Bubble) ───
function showBreathView(viewId) {
    stopBreathApp(); // پااکردنەوەی کاتژمێرەکان پێش گۆڕینی ڕووکار
    
    // شاردنەوەی کارتەکانی ناو ئەپی هەناسەدان و نیشاندانی کارتی مەبەست
    document.getElementById('breath-menu').style.display = 'none';
    document.getElementById('training-view').style.display = 'none';
    document.getElementById('test-view').style.display = 'none';
    
    document.getElementById(viewId).style.display = 'flex';
}

function stopBreathApp() {
    clearInterval(breathInterval);
    clearTimeout(breathSubTimer);
    
    // پیشاندانەوەی دوگمەکانی دەستپێکردن و شاردنەوەی وەستاندن
    if(document.getElementById('start-train-btn')) document.getElementById('start-train-btn').style.display = 'block';
    if(document.getElementById('stop-train-btn')) document.getElementById('stop-train-btn').style.display = 'none';
    if(document.getElementById('start-test-btn')) document.getElementById('start-test-btn').style.display = 'block';
    if(document.getElementById('stop-test-btn')) document.getElementById('stop-test-btn').style.display = 'none';

    // گەڕاندنەوەی بڵقەکە بۆ دۆخی سەرەتایی
    const trainCircle = document.getElementById('train-circle');
    if (trainCircle) trainCircle.className = 'premium-bubble';
    
    if(document.getElementById('train-text')) document.getElementById('train-text').innerText = "ئامادەی بۆ راهێنان؟";
    if(document.getElementById('train-timer')) document.getElementById('train-timer').innerText = "کاتی ڕاهێنان: 00:00";
    if(document.getElementById('test-text')) document.getElementById('test-text').innerText = "0 چرکە";
    if(document.getElementById('gauge-line')) document.getElementById('gauge-line').style.width = "0%";
    
    const badge = document.getElementById('test-level-badge');
    if (badge) {
        badge.innerText = "ئامادەبە";
        badge.style.background = "#ffa502";
    }
}

function formatBreathTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `کاتی ڕاهێنان: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTraining() {
    stopBreathApp();
    document.getElementById('start-train-btn').style.display = 'none';
    document.getElementById('stop-train-btn').style.display = 'block';

    const circle = document.getElementById('train-circle');
    const statusText = document.getElementById('train-text');
    const timerText = document.getElementById('train-timer');
    
    totalTrainSeconds = 0;
    timerText.innerText = formatBreathTime(totalTrainSeconds);
    
    // کاتژمێری چرکەژمێر بۆ کاتی گشتی ڕاهێنان
    breathInterval = setInterval(() => {
        totalTrainSeconds++;
        timerText.innerText = formatBreathTime(totalTrainSeconds);
        
        // نوێکردنەوەی قۆناغەکانی هەناسەدان لە هەر خولێکی ١٢ چرکەییدا
        let cycleTime = totalTrainSeconds % 12;
        if (cycleTime === 0) {
            statusText.innerText = "هەناسە هەڵمژە... 🧘‍♂️";
            circle.className = 'premium-bubble inhale-state';
        } else if (cycleTime === 4) {
            statusText.innerText = "ڕایبگرە... ✋";
            circle.className = 'premium-bubble';
        } else if (cycleTime === 8) {
            statusText.innerText = "هەناسە بدەرەوە... 💨";
            circle.className = 'premium-bubble exhale-state';
        }
    }, 1000);

    // دەستپێکردنی قۆناغی یەکەم یەکسەر لە کاتی داگرتنی دوگمەکە
    statusText.innerText = "هەناسە هەڵمژە... 🧘‍♂️";
    circle.className = 'premium-bubble inhale-state';
}

function startHoldTest() {
    stopBreathApp();
    document.getElementById('start-test-btn').style.display = 'none';
    document.getElementById('stop-test-btn').style.display = 'block';

    const textDisplay = document.getElementById('test-text');
    const gaugeFill = document.getElementById('gauge-line');
    const levelBadge = document.getElementById('test-level-badge');
    
    testHoldSeconds = 0;
    textDisplay.innerText = "٣";
    levelBadge.innerText = "ئامادەبە...";
    levelBadge.style.background = "#ffa502";

    // ٣ چرکە ئەژمێرێت پێش دەستپێکردنی ڕاگرتنی هەناسە
    let countdown = 3;
    breathInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            textDisplay.innerText = countdown;
        } else if (countdown === 0) {
            clearInterval(breathInterval);
            textDisplay.innerText = "هەناسەت ڕابگرە!";
            levelBadge.innerText = "دەستپێکردن";
            levelBadge.style.background = "#2ed573";
            
            // دەستپێکردنی تاقیکردنەوەی ڕاستەقینە
            breathInterval = setInterval(() => {
                testHoldSeconds++;
                textDisplay.innerText = testHoldSeconds + " چرکە";
                
                let percentage = Math.min((testHoldSeconds / 60) * 100, 100);
                gaugeFill.style.width = percentage + "%";
                
                if (testHoldSeconds <= 15) {
                    levelBadge.innerText = "سەرەتایی (Beginner)";
                    levelBadge.style.background = "#ffa502";
                } else if (testHoldSeconds > 15 && testHoldSeconds <= 30) {
                    levelBadge.innerText = "ئاسایی (Normal)";
                    levelBadge.style.background = "#1e90ff";
                } else if (testHoldSeconds > 30 && testHoldSeconds <= 45) {
                    levelBadge.innerText = "باش (Good)";
                    levelBadge.style.background = "#20bf6b";
                } else {
                    levelBadge.innerText = "نایاب (Excellent)";
                    levelBadge.style.background = "#eb4d4b";
                }
            }, 1000);
        }
    }, 1000);
}
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const toggleBtn = document.querySelector('.theme-toggle-btn');
    
    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        toggleBtn.innerHTML = '🌙 دۆخی تاریک';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleBtn.innerHTML = '☀️ دۆخی ڕووناک';
    }
}
// فەنکشنی گەڕانەوە بۆ لاپەڕەی سەرەکی بە کلیک کردن لە لۆگۆ
function goToHome() {
    // ئەگەر بەکارهێنەر لە ناو لاپەڕەی ئەپێکدا بوو، دایدەخات
    if (typeof closeApp === "function") {
        closeApp();
    }
    // سکڕۆڵکردن بۆ سەرەتای پەیجی سەرەکی بە شێوازێکی نەرم (Smooth)
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}