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
// کردنەوەی ئەپەکە
function openApp(appId) {
    // ١. شاردنەوەی لاپەڕەی سەرەکی
    document.getElementById('main-homepage').style.display = 'none';
    
    // ٢. شاردنەوەی هەموو ئەپەکانی تر بە یەکجاری
    const apps = document.querySelectorAll('.app-page');
    apps.forEach(app => app.style.display = 'none');
    
    // ٣. چارەسەری ئایدییەکان ئەگەر بە ناوی کۆن بانگ کرابێت
    let targetId = appId;
    if (appId === 'burn-app' || appId === 'calorie-app') {
        targetId = 'advanced-burn-app';
    }
    
    // ٤. پیشاندانی ئەپە مەبەستەکە
    const targetApp = document.getElementById(targetId);
    if (targetApp) {
        targetApp.style.display = 'flex'; // لێرەدا دەبێتەوە بە flex و هەموو دیزاینەکەت پیشان دەداتەوە
    }
    
    if (targetId === 'breath-app') {
        showBreathView('breath-menu');
    }
    
    window.scrollTo(0, 0);
}

// داخستنی ئەپەکە و گەڕانەوە بۆ لاپەڕەی سەرەکی
function closeApp() {
    if (timerInterval) clearInterval(timerInterval);
    if (typeof stopBreathApp === "function") stopBreathApp(); // وەستاندنی هەناسەدان ئەگەر هەبێت
    
    // شاردنەوەی سەرجەم ئەپەکان
    const apps = document.querySelectorAll('.app-page');
    apps.forEach(app => app.style.display = 'none');
    
    // پیشاندانەوەی لاپەڕەی سەرەکی بە دروستی
    document.getElementById('main-homepage').style.display = 'block';
    
    // بردنەوەی شاشەکە بۆ سەرەوە
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
// داتای سەرەکی بەشەکانی جەستە و لۆجیکی گۆڕانی ڕێژە بەپێی تەمەن
let selectedBurnParts = new Set();
let globalTBSA = 0;

// لۆجیکی زۆر وردی دابەشکاری جەستە (سەری سەرەوە، دەموچاو، سنگ، سک، قۆڵ، قەپۆک، هتد)
function getFinerBodyParts(age) {
    let headHalf = age <= 1 ? 9 : (age < 15 ? (18 - (age * 0.5)) / 2 : 4.5);
    let legHalf = age <= 1 ? 7 : (age < 15 ? (14 + (age * 0.25)) / 2 : 9);

    // دابەشکاری زۆر وردتر بۆ بەدەستهێنانی بەرزترین دیقە
    return {
        front: [
            { id: "face", name: "دەموچاو و سەر (پێشەوە)", pct: parseFloat((headHalf * 0.7).toFixed(1)) },
            { id: "neck_ant", name: "مل (پێشەوە)", pct: parseFloat((headHalf * 0.3).toFixed(1)) },
            { id: "chest", name: "سنگ (Chest)", pct: 9 },
            { id: "abdomen", name: "سک (Abdomen)", pct: 9 },
            { id: "r_u_arm_ant", name: "قۆڵی سەرەوەی ڕاست (پێشەوە)", pct: 2 },
            { id: "r_f_arm_ant", name: "قۆڵی خوارەوەی ڕاست (پێشەوە)", pct: 1.5 },
            { id: "r_hand_ant", name: "دەستی ڕاست (پێشەوە)", pct: 1 },
            { id: "l_u_arm_ant", name: "قۆڵی سەرەوەی چەپ (پێشەوە)", pct: 2 },
            { id: "l_f_arm_ant", name: "قۆڵی خوارەوەی چەپ (پێشەوە)", pct: 1.5 },
            { id: "l_hand_ant", name: "دەستی چەپ (پێشەوە)", pct: 1 },
            { id: "r_thigh_ant", name: "ڕانی ڕاست (پێشەوە)", pct: parseFloat((legHalf * 0.5).toFixed(1)) },
            { id: "r_calf_ant", name: "ژێرچۆکی ڕاست (پێشەوە)", pct: parseFloat((legHalf * 0.4).toFixed(1)) },
            { id: "r_foot_ant", name: "پێی ڕاست (پێشەوە)", pct: parseFloat((legHalf * 0.1).toFixed(1)) },
            { id: "l_thigh_ant", name: "ڕانی چەپ (پێشەوە)", pct: parseFloat((legHalf * 0.5).toFixed(1)) },
            { id: "l_calf_ant", name: "ژێرچۆکی چەپ (پێشەوە)", pct: parseFloat((legHalf * 0.4).toFixed(1)) },
            { id: "l_foot_ant", name: "پێی چەپ (پێشەوە)", pct: parseFloat((legHalf * 0.1).toFixed(1)) },
            { id: "perineum", name: "کۆئەندامی زاوزێ", pct: 1 }
        ],
        back: [
            { id: "head_post", name: "پشتی سەر و سەرین", pct: parseFloat((headHalf * 0.7).toFixed(1)) },
            { id: "neck_post", name: "مل (دواوە)", pct: parseFloat((headHalf * 0.3).toFixed(1)) },
            { id: "u_back", name: "پشتی سەرەوە (Upper Back)", pct: 9 },
            { id: "l_back", name: "کەمەر و سمت (Lower Back/Gluteal)", pct: 9 },
            { id: "r_u_arm_post", name: "قۆڵی سەرەوەی ڕاست (دواوە)", pct: 2 },
            { id: "r_f_arm_post", name: "قۆڵی خوارەوەی ڕاست (دواوە)", pct: 1.5 },
            { id: "r_hand_post", name: "دەستی ڕاست (دواوە)", pct: 1 },
            { id: "l_u_arm_post", name: "قۆڵی سەرەوەی چەپ (دواوە)", pct: 2 },
            { id: "l_f_arm_post", name: "قۆڵی خوارەوەی چەپ (دواوە)", pct: 1.5 },
            { id: "l_hand_post", name: "دەستی چەپ (دواوە)", pct: 1 },
            { id: "r_thigh_post", name: "ڕانی ڕاست (دواوە)", pct: parseFloat((legHalf * 0.5).toFixed(1)) },
            { id: "r_calf_post", name: "ژێرچۆکی ڕاست (دواوە)", pct: parseFloat((legHalf * 0.4).toFixed(1)) },
            { id: "r_foot_post", name: "پێی ڕاست (دواوە)", pct: parseFloat((legHalf * 0.1).toFixed(1)) },
            { id: "l_thigh_post", name: "ڕانی چەپ (دواوە)", pct: parseFloat((legHalf * 0.5).toFixed(1)) },
            { id: "l_calf_post", name: "ژێرچۆکی چەپ (دواوە)", pct: parseFloat((legHalf * 0.4).toFixed(1)) },
            { id: "l_foot_post", name: "پێی چەپ (دواوە)", pct: parseFloat((legHalf * 0.1).toFixed(1)) }
        ]
    };
}

function initFinerApp() {
    const age = parseInt(document.getElementById('patient-age').value) || 25;
    const data = getFinerBodyParts(age);
    
    renderPartsList('parts-front', data.front);
    renderPartsList('parts-back', data.back);
}

function renderPartsList(containerId, arrayParts) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    arrayParts.forEach(part => {
        const div = document.createElement('div');
        div.className = `finer-part ${selectedBurnParts.has(part.id) ? 'active-burned' : ''}`;
        div.innerHTML = `<span>${part.name}</span> <strong>${part.pct}%</strong>`;
        
        div.onclick = () => {
            if (selectedBurnParts.has(part.id)) selectedBurnParts.delete(part.id);
            else selectedBurnParts.add(part.id);
            div.classList.toggle('active-burned');
        };
        container.appendChild(div);
    });
}

// 🧮 فەنکشنی سەرەکی دوگمەی هەژمارکردن
function performFinalCalculation() {
    const age = parseInt(document.getElementById('patient-age').value) || 25;
    const data = getFinerBodyParts(age);
    let total = 0;

    [...data.front, ...data.back].forEach(part => {
        if (selectedBurnParts.has(part.id)) total += part.pct;
    });

    globalTBSA = total;
    document.getElementById('total-tbsa').innerText = total.toFixed(1) + '%';
    
    // پیشاندانی زۆنی داگرتنی فایلەکان دوای کلیک کردن لە دوگمەکە
    document.getElementById('download-zone').style.style.display = 'block';
}

// 📄 ١. داگرتن وەک فایلی دەق (TXT)
function downloadAsTXT() {
    const name = document.getElementById('patient-name').value || "دیاری نەکراو";
    const age = document.getElementById('patient-age').value;
    const weight = document.getElementById('patient-weight').value;
    const gender = document.getElementById('patient-gender').value;
    
    const inh = document.querySelector('input[name="q-inhalation"]:checked').value;
    const qtype = document.querySelector('input[name="q-type"]:checked').value;
    const qsens = document.querySelector('input[name="q-sensitive"]:checked').value;

    let textData = `🏥 ڕاپۆرتی پزیشکی سووتاوی MedByte\n`;
    textData += `====================================\n`;
    textData += `👤 ناوی نەخۆش: ${name}\n`;
    textData += `👶 تەمەن: ${age} ساڵ\n`;
    textData += `⚖️ کێش: ${weight} کیلۆگرام\n`;
    textData += `🧬 ڕەگەز: ${gender}\n`;
    textData += `====================================\n`;
    textData += `🩺 هەڵسەنگاندنی هۆکارەکان:\n`;
    textData += `- هەڵمژینی دووکەڵ: ${inh}\n`;
    textData += `- سووتانی کارەبایی/کیمیایی: ${qtype}\n`;
    textData += `- سووتانی ناوچەی هەستیار: ${qsens}\n`;
    textData += `====================================\n`;
    textData += `📊 کۆی گشتی ڕێژەی سووتاوی (TBSA): ${globalTBSA.toFixed(1)}%\n`;

    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ڕاپۆرتی_${name}.txt`;
    link.click();
}

// 🖼️ ٢. داگرتن وەک وێنە (PNG) بە بەکارهێنانی مۆدێرنی وێنەکێشانی لۆکاڵی Canvas
function downloadAsImage() {
    const name = document.getElementById('patient-name').value || "Unknown Patient";
    const age = document.getElementById('patient-age').value;
    const weight = document.getElementById('patient-weight').value;
    const gender = document.getElementById('patient-gender').value;
    
    // دروستکردنی کەنڤاسێکی داینامیکی بە دیزاینێکی شیک
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');

    // باکگراوندێکی تاریک و پزیشکی مۆدێرن
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // هێڵکاری و ستایل
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    // نووسینی ناوەکان و دەقەکان
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Tahoma';
    ctx.textAlign = 'right';
    ctx.fillText('🏥 MedByte Burn Analysis Report', canvas.width - 40, 50);

    ctx.font = '16px Tahoma';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Patient Name / ناوی نەخۆش: ${name}`, canvas.width - 40, 110);
    ctx.fillText(`Age / تەمەن: ${age} Years`, canvas.width - 40, 150);
    ctx.fillText(`Weight / کێش: ${weight} KG`, canvas.width - 40, 190);
    ctx.fillText(`Gender / ڕەگەز: ${gender}`, canvas.width - 40, 230);

    // هێڵی جیاکەرەوە
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 270); ctx.lineTo(canvas.width - 40, 270); ctx.stroke();

    // ئەنجامەکە بە گەورەیی و ڕەنگی سووری گەشاوە
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 32px Tahoma';
    ctx.fillText(`Total TBSA: ${globalTBSA.toFixed(1)}%`, canvas.width - 40, 330);

    ctx.fillStyle = '#10b981';
    ctx.font = '14px Tahoma';
    ctx.fillText('✔️ فۆرمی فەرمی جێگیرکراو بە لۆجیکی Lund-Browder', canvas.width - 40, 390);

    // دابەزاندنی کەنڤاسەکە وەک وێنەی ڕاستەقینە
    const imgURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgURL;
    link.download = `MedByte_Report_${name}.png`;
    link.click();
}

// لودکردنی سەرەتایی ئەپەکە
document.addEventListener("DOMContentLoaded", () => {
    initFinerApp();
    document.getElementById('patient-age').addEventListener('change', initFinerApp);
});
// ==========================================================================
// 💊 لۆجیکی نوێکراوەی Pill Wizard & Multi-Language Clinical Prompt
// ==========================================================================

// ==========================================================================
// 💊 لۆجیکی فەرمی Pill Wizard بە کلیلە نوێیەکەوە
// ==========================================================================

const WIZARD_GEMINI_KEY = "AQ.Ab8RN6LbMh7_XtpGtJjsEQH0JeBRCkS2uJKLQmRMZEKhxJoEfg"; 

let wizardRole = 'patient'; 
let wizardInputMethod = 'text';
let wizardBase64Image = '';
let mainPillDetectedName = ''; 
let localStream = null;

function selectWizardRole(role) {
    wizardRole = role;
    document.getElementById('step-role').style.display = 'none';
    document.getElementById('step-input-method').style.display = 'block';
}

function selectWizardInput(method) {
    wizardInputMethod = method;
    document.getElementById('step-input-method').style.display = 'none';
    
    if (method === 'camera') {
        document.getElementById('step-media-input').style.display = 'block';
    } else {
        document.getElementById('step-text-input').style.display = 'block';
    }
}

function goBackToStep(stepId) {
    stopLiveCamera();
    document.getElementById('step-role').style.display = 'none';
    document.getElementById('step-input-method').style.display = 'none';
    document.getElementById('step-media-input').style.display = 'none';
    document.getElementById('step-text-input').style.display = 'none';
    
    document.getElementById(stepId).style.display = 'block';
}

// 🛠️ چاککردنی تەواوی دوگمەی گەڕانەوەی سەرەکی فۆرمەکە بۆ گەڕانەوە بۆ مێنۆ
function resetPillWizard() {
    stopLiveCamera();
    wizardBase64Image = '';
    mainPillDetectedName = '';
    document.getElementById('wizard-pill-name-input').value = '';
    document.getElementById('wizard-secondary-drugs').value = '';
    document.getElementById('pill-captured-image').src = '';
    document.getElementById('pill-preview-box').style.display = 'none';
    document.getElementById('step-interaction-query').style.display = 'none';
    document.getElementById('wizard-bento-results').style.display = 'none';
    document.getElementById('wizard-placeholder').style.display = 'block';
    
    // شاردنەوەی لاپەڕەی ئەپەکە و نیشاندانی لاپەڕەی سەرەکی
    document.getElementById('ai-pill-app').style.display = 'none';
    const mainHome = document.getElementById('main-homepage');
    if (mainHome) {
        mainHome.style.display = 'block';
    }
    goBackToStep('step-role');
}

// ❌ فەنکشنی سڕینەوەی وێنە
function clearCapturedPhoto() {
    wizardBase64Image = '';
    document.getElementById('pill-captured-image').src = '';
    document.getElementById('pill-preview-box').style.display = 'none';
    document.getElementById('pill-file-hidden').value = '';
}

// کامێرای زیندوو
async function startLiveCamera() {
    document.getElementById('camera-preview-container').style.display = 'block';
    document.getElementById('pill-preview-box').style.display = 'none';
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        document.getElementById('pill-video').srcObject = localStream;
    } catch (err) {
        console.error(err);
        showAlert("نەتوانرا کامێرا بکرێتەوە.");
    }
}

function capturePillPhoto() {
    const video = document.getElementById('pill-video');
    if (!video.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    wizardBase64Image = canvas.toDataURL('image/jpeg');
    document.getElementById('pill-captured-image').src = wizardBase64Image;
    document.getElementById('pill-preview-box').style.display = 'block';
    
    stopLiveCamera();
    document.getElementById('camera-preview-container').style.display = 'none';
}

function stopLiveCamera() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
}

function handleWizardImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        wizardBase64Image = e.target.result;
        document.getElementById('pill-captured-image').src = wizardBase64Image;
        document.getElementById('pill-preview-box').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// ١. ناردنی داواکاری سەرەکی بۆ Gemini API
async function sendPillWizardToAI() {
    const textInput = document.getElementById('wizard-pill-name-input').value.trim();
    if (wizardInputMethod === 'text' && !textInput) {
        showAlert('تکایە ناوی دەرمانەکە بنووسە!');
        return;
    }
    if (wizardInputMethod === 'camera' && !wizardBase64Image) {
        showAlert('تکایە سەرەتا وێنەیەک بگرە یان باربکە!');
        return;
    }

    document.getElementById('wizard-placeholder').style.display = 'none';
    document.getElementById('wizard-bento-results').style.display = 'none';
    document.getElementById('wizard-loading').style.display = 'block';

    const promptText = `
    You are MedByte Pill AI Expert. Analyze this input:
    Text query: "${textInput}"
    Current View Mode Selected: "${wizardRole}".
    
    CRITICAL LANGUAGE RULES BASED ON MODE:
    - If mode is "patient": Write EVERYTHING in simple Sorani Kurdish.
    - If mode is "clinical": Write in a MIXED layout. Provide descriptions in BOTH Kurdish and professional Clinical English side-by-side or sectioned. For 'mechanism', 'interactions', and 'overdoseProtocol', write a helpful summary in Kurdish first, and then include advanced clinical details, nursing considerations, and drug class specifications in English.
    
    Return strict JSON structure:
    {
      "pillName": "Name of drug",
      "genericName": "Generic Chemical Name",
      "type": "Drug Class / Category",
      "brands": "Local market alternatives",
      "mechanism": "How it works description (following the language rules)",
      "fdaCategory": "A/B/C/D/X",
      "pregnancyText": "Pregnancy advice text",
      "interactions": "General warnings and food interactions text",
      "overdoseProtocol": "Emergency steps for overdose"
    }
    `;

    let parts = [{ text: promptText }];
    if (wizardInputMethod === 'camera' && wizardBase64Image) {
        const base64Data = wizardBase64Image.split(',')[1];
        const mimeType = wizardBase64Image.split(';')[0].split(':')[1];
        parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
    }

    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${WIZARD_GEMINI_KEY}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });

        const data = await response.json();
        let jsonText = data.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const resObj = JSON.parse(jsonText);

        mainPillDetectedName = resObj.genericName || resObj.pillName;

        document.getElementById('w-pill-name').innerText = resObj.pillName;
        document.getElementById('w-generic-name').innerText = resObj.genericName;
        document.getElementById('w-pill-type').innerText = resObj.type;
        document.getElementById('w-brands').innerText = resObj.brands;
        document.getElementById('w-mechanism').innerText = resObj.mechanism;
        document.getElementById('w-preg-badge').innerText = resObj.fdaCategory;
        document.getElementById('w-preg-text').innerText = resObj.pregnancyText;
        document.getElementById('w-interactions').innerText = resObj.interactions;
        document.getElementById('w-overdose').innerText = resObj.overdoseProtocol;

        document.getElementById('w-mechanism-title').innerText = 
            wizardRole === 'clinical' ? '🩺 Mechanism of Action & Clinical Guide' : '💡 ڕێنمایی بەکارهێنان';

        const pregCard = document.getElementById('w-preg-card');
        if (resObj.fdaCategory === 'X' || resObj.fdaCategory === 'D') {
            pregCard.classList.add('red-neon-alert');
        } else {
            pregCard.classList.remove('red-neon-alert');
        }

        document.getElementById('wizard-loading').style.display = 'none';
        document.getElementById('wizard-bento-results').style.display = 'grid';
        document.getElementById('step-interaction-query').style.display = 'block';

    } catch (err) {
        console.error(err);
        document.getElementById('wizard-loading').style.display = 'none';
        showAlert('هەڵەیەک لە شیکردنەوەکەدا ڕوویدا.');
    }
}

// ٢. پشکنینی کارلێکی دەرمانی دووەم
async function checkSecondaryInteractions() {
    const secondaryDrugs = document.getElementById('wizard-secondary-drugs').value.trim();
    if (!secondaryDrugs) {
        showAlert('تکایە ناوی دەرمانی دووەم بنووسە!');
        return;
    }

    document.getElementById('wizard-loading').style.display = 'block';

    const checkPrompt = `
    Analyze drug-drug interaction between: "${mainPillDetectedName}" and "${secondaryDrugs}".
    Current view mode is "${wizardRole}". If patient, explain simply in Kurdish. If clinical, provide a professional analysis using both Kurdish and English medical terms side-by-side.
    `;

    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${WIZARD_GEMINI_KEY}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: checkPrompt }] }] })
        });
        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;

        document.getElementById('w-interactions').innerHTML = `<strong>⚠️ ئەنجامی کارلێکی تێکەڵە:</strong><br>${resultText}`;
        document.getElementById('w-interact-card').classList.add('red-neon-alert');
        
        document.getElementById('wizard-loading').style.display = 'none';
    } catch (err) {
        console.error(err);
        document.getElementById('wizard-loading').style.display = 'none';
    }
}
// ==========================================================================
// 📝 لۆجیکی نایابی AI Rx Decoder (خوێندنەوەی خەتی پزیشک)
// ==========================================================================

const RX_GEMINI_KEY = "AQ.Ab8RN6LbMh7_XtpGtJjsEQH0JeBRCkS2uJKLQmRMZEKhxJoEfg"; 

let rxBase64Image = '';
let rxLocalStream = null;

function selectRxInput(method) {
    document.getElementById('rx-step-input-method').style.display = 'none';
    document.getElementById('rx-step-media').style.display = 'block';
    
    if (method === 'camera') {
        startRxLiveCamera();
    }
}

function goBackToRxStep(stepId) {
    stopRxLiveCamera();
    document.getElementById('rx-step-input-method').style.display = 'none';
    document.getElementById('rx-step-media').style.display = 'none';
    document.getElementById(stepId).style.display = 'block';
}

// ڕێستکردنی گشتی و گەڕانەوە بۆ مێنۆی سەرەکی MedByte
function resetRxWizard() {
    stopRxLiveCamera();
    rxBase64Image = '';
    document.getElementById('rx-captured-image').src = '';
    document.getElementById('rx-preview-box').style.display = 'none';
    document.getElementById('rx-bento-results').style.display = 'none';
    document.getElementById('rx-placeholder').style.display = 'block';
    document.getElementById('rx-file-hidden').value = '';
    
    document.getElementById('ai-rx-app').style.display = 'none';
    const mainHome = document.getElementById('main-homepage');
    if (mainHome) mainHome.style.display = 'block';
    
    goBackToRxStep('rx-step-input-method');
}

// سڕینەوەی وێنە
function clearRxPhoto() {
    rxBase64Image = '';
    document.getElementById('rx-captured-image').src = '';
    document.getElementById('rx-preview-box').style.display = 'none';
    document.getElementById('rx-file-hidden').value = '';
}

// کامێرا
async function startRxLiveCamera() {
    document.getElementById('rx-camera-container').style.display = 'block';
    document.getElementById('rx-preview-box').style.display = 'none';
    try {
        rxLocalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        document.getElementById('rx-video').srcObject = rxLocalStream;
    } catch (err) {
        console.error(err);
        showAlert("کامێرا نەکرایەوە، تکایە فایل باربکە.");
    }
}

function captureRxPhoto() {
    const video = document.getElementById('rx-video');
    if (!video.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    rxBase64Image = canvas.toDataURL('image/jpeg');
    document.getElementById('rx-captured-image').src = rxBase64Image;
    document.getElementById('rx-preview-box').style.display = 'block';
    
    stopRxLiveCamera();
    document.getElementById('rx-camera-container').style.display = 'none';
}

function stopRxLiveCamera() {
    if (rxLocalStream) {
        rxLocalStream.getTracks().forEach(track => track.stop());
        rxLocalStream = null;
    }
}

function handleRxImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        rxBase64Image = e.target.result;
        document.getElementById('rx-captured-image').src = rxBase64Image;
        document.getElementById('rx-preview-box').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// ناردنی وێنەی ڕەچەتە بۆ لێکدانەوە بە زمانی کوردی و ئینگلیزی پێکەوە
async function sendRxToAI() {
    if (!rxBase64Image) {
        showAlert('تکایە سەرەتا وێنەی ڕەچەتەکە دابنێ!');
        return;
    }

    document.getElementById('rx-placeholder').style.display = 'none';
    document.getElementById('rx-bento-results').style.display = 'none';
    document.getElementById('rx-loading').style.display = 'block';

    const promptText = `
    You are MedByte Rx Expert. Decode this doctor's handwritten prescription image.
    Identify the names of the medications, dosages, and frequency if possible.
    Provide the response in a mixed format: Names of medications in English, but explanations, possible diagnosis, and nursing notes in BOTH Kurdish (Sorani) and English.
    
    Return strict JSON structure:
    {
      "medications": "HTML unordered list (<ul><li>...) containing decoded medications with doses",
      "diagnosis": "Kurdish summary + English of suspected conditions or reasons for these meds",
      "notes": "Nursing precautions or critical patient guidance in Kurdish + English"
    }
    `;

    const base64Data = rxBase64Image.split(',')[1];
    const mimeType = rxBase64Image.split(';')[0].split(':')[1];

    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${RX_GEMINI_KEY}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ]
                }]
            })
        });

        const data = await response.json();
        let jsonText = data.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const resObj = JSON.parse(jsonText);

        document.getElementById('rx-medications-list').innerHTML = resObj.medications;
        document.getElementById('rx-diagnosis').innerText = resObj.diagnosis;
        document.getElementById('rx-notes').innerText = resObj.notes;

        document.getElementById('rx-loading').style.display = 'none';
        document.getElementById('rx-bento-results').style.display = 'grid';

    } catch (err) {
        console.error(err);
        document.getElementById('rx-loading').style.display = 'none';
        showAlert('هەڵەیەک ڕوویدا لە کاتی خوێندنەوەی وێنەکەدا.');
    }
}
// ==========================================================================
// 🧪 لۆجیکی فەرمی و هەنگاو بە هەنگاوی AI Lab Analyzer لەگەڵ Modal Box
// ==========================================================================

const LAB_GEMINI_KEY = "AQ.Ab8RN6LbMh7_XtpGtJjsEQH0JeBRCkS2uJKLQmRMZEKhxJoEfg"; 

let labBase64Image = '';
let labLocalStream = null;

function goToLabStep(stepId) {
    document.getElementById('lab-step-intro').style.display = 'none';
    document.getElementById('lab-step-demographics').style.display = 'none';
    document.getElementById('lab-step-media').style.display = 'none';
    
    document.getElementById(stepId).style.display = 'block';
}

function validateLabDemographics() {
    const age = document.getElementById('lab-patient-age').value.trim();
    if (!age) {
        showAlert('تکایە سەرەتا تەمەنی نەخۆشەکە بنووسە!');
        return;
    }
    goToLabStep('lab-step-media');
}

// داخستنی بۆکسی ئەنجامەکان
function closeLabModal() {
    document.getElementById('lab-result-modal').style.display = 'none';
}

function resetLabWizard() {
    stopLabLiveCamera();
    closeLabModal();
    labBase64Image = '';
    document.getElementById('lab-patient-age').value = '';
    document.getElementById('lab-captured-image').src = '';
    document.getElementById('lab-preview-box').style.display = 'none';
    document.getElementById('lab-file-hidden').value = '';
    document.getElementById('lab-loading').style.display = 'none';
    
    document.getElementById('ai-lab-app').style.display = 'none';
    const mainHome = document.getElementById('main-homepage');
    if (mainHome) mainHome.style.display = 'block';
    
    goToLabStep('lab-step-intro');
}

function clearLabPhoto() {
    labBase64Image = '';
    document.getElementById('lab-captured-image').src = '';
    document.getElementById('lab-preview-box').style.display = 'none';
    document.getElementById('lab-file-hidden').value = '';
}

// کامێرا
async function startLabLiveCamera() {
    document.getElementById('lab-camera-container').style.display = 'block';
    document.getElementById('lab-preview-box').style.display = 'none';
    try {
        labLocalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        document.getElementById('lab-video').srcObject = labLocalStream;
    } catch (err) {
        console.error(err);
        showAlert("کامێرا نەکرایەوە، تکایە فایل باربکە.");
    }
}

function captureLabPhoto() {
    const video = document.getElementById('lab-video');
    if (!video.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    labBase64Image = canvas.toDataURL('image/jpeg');
    document.getElementById('lab-captured-image').src = labBase64Image;
    document.getElementById('lab-preview-box').style.display = 'block';
    
    stopLabLiveCamera();
    document.getElementById('lab-camera-container').style.display = 'none';
}

function stopLabLiveCamera() {
    if (labLocalStream) {
        labLocalStream.getTracks().forEach(track => track.stop());
        labLocalStream = null;
    }
}

function handleLabImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        labBase64Image = e.target.result;
        document.getElementById('lab-captured-image').src = labBase64Image;
        document.getElementById('lab-preview-box').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// ناردنی داتا بۆ لێکدانەوە
async function sendLabToAI() {
    if (!labBase64Image) {
        showAlert('تکایە وێنەی فەحسەکە دابنێ یان وێنەیەک بگرە!');
        return;
    }

    const age = document.getElementById('lab-patient-age').value;
    const gender = document.querySelector('input[name="lab-gender"]:checked').value;

    document.getElementById('lab-loading').style.display = 'block';

    const promptText = `
    You are MedByte Lab Expert. Analyze this laboratory report image.
    PATIENT DETAILS FOR REFERENCE RANGES:
    - Age: ${age} years old
    - Gender: ${gender}
    
    Identify any abnormal parameters (High or Low values) based on the provided patient's age and gender.
    Provide descriptions using a mixed layout: Test names and numbers in English, but clinical interpretation and nursing guidelines in BOTH Kurdish (Sorani) and professional English side-by-side.
    
    Return strict JSON structure:
    {
      "abnormalValues": "HTML unordered list (<ul><li>...) highlighting tests that are out of range with their values and a note if it's high or low",
      "interpretation": "Kurdish summary + English of what these results might indicate clinically given the patient profile",
      "nursingNotes": "Critical precautions, hydration status, or urgent notifications required by a nurse in Kurdish + English"
    }
    `;

    const base64Data = labBase64Image.split(',')[1];
    const mimeType = labBase64Image.split(';')[0].split(':')[1];

    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${LAB_GEMINI_KEY}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ]
                }]
            })
        });

        const data = await response.json();
        let jsonText = data.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const resObj = JSON.parse(jsonText);

        document.getElementById('lab-abnormal-list').innerHTML = resObj.abnormalValues;
        document.getElementById('lab-interpretation').innerText = resObj.interpretation;
        document.getElementById('lab-nursing-notes').innerText = resObj.nursingNotes;

        document.getElementById('lab-loading').style.display = 'none';
        
        // ✨ لێرەدا بۆکسی پۆپ-ئەپەکە چالاک دەبێت پاش لۆدین بە سەرکەوتوویی
        document.getElementById('lab-result-modal').style.display = 'flex';

    } catch (err) {
        console.error(err);
        document.getElementById('lab-loading').style.display = 'none';
        showAlert('هەڵەیەک ڕوویدا لە کاتی خوێندنەوەی فەحسەکەدا.');
    }
}
// ==========================================================================
// 📸 لۆجیکی فەرمی OCR Text Extractor (دەرهێنانی دەق بەبێ دەستکاری)
// ==========================================================================

const OCR_GEMINI_KEY = "AQ.Ab8RN6LbMh7_XtpGtJjsEQH0JeBRCkS2uJKLQmRMZEKhxJoEfg"; 

let ocrBase64Image = '';
let ocrLocalStream = null;

function goToOcrStep(stepId) {
    document.getElementById('ocr-step-intro').style.display = 'none';
    document.getElementById('ocr-step-media').style.display = 'none';
    document.getElementById(stepId).style.display = 'block';
}

function closeOcrModal() {
    document.getElementById('ocr-result-modal').style.display = 'none';
}

// فەنکشنی دووبارەکردنەوە (داخستنی مۆدال و گەڕانەوە بۆ بەشی وێنەگرتن)
function retakeOcrProcess() {
    closeOcrModal();
    clearOcrPhoto();
    goToOcrStep('ocr-step-media');
}

function resetOcrWizard() {
    stopOcrLiveCamera();
    closeOcrModal();
    ocrBase64Image = '';
    document.getElementById('ocr-captured-image').src = '';
    document.getElementById('ocr-preview-box').style.display = 'none';
    document.getElementById('ocr-file-hidden').value = '';
    document.getElementById('ocr-loading').style.display = 'none';
    
    document.getElementById('ocr-extractor-app').style.display = 'none';
    const mainHome = document.getElementById('main-homepage');
    if (mainHome) mainHome.style.display = 'block';
    
    goToOcrStep('ocr-step-intro');
}

function clearOcrPhoto() {
    ocrBase64Image = '';
    document.getElementById('ocr-captured-image').src = '';
    document.getElementById('ocr-preview-box').style.display = 'none';
    document.getElementById('ocr-file-hidden').value = '';
}

// لۆجیکی کامێرا
async function startOcrLiveCamera() {
    document.getElementById('ocr-camera-container').style.display = 'block';
    document.getElementById('ocr-preview-box').style.display = 'none';
    try {
        ocrLocalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        document.getElementById('ocr-video').srcObject = ocrLocalStream;
    } catch (err) {
        console.error(err);
        showAlert("کامێرا نەکرایەوە، تکایە فایل باربکە.");
    }
}

function captureOcrPhoto() {
    const video = document.getElementById('ocr-video');
    if (!video.srcObject) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    ocrBase64Image = canvas.toDataURL('image/jpeg');
    document.getElementById('ocr-captured-image').src = ocrBase64Image;
    document.getElementById('ocr-preview-box').style.display = 'block';
    
    stopOcrLiveCamera();
    document.getElementById('ocr-camera-container').style.display = 'none';
}

function stopOcrLiveCamera() {
    if (ocrLocalStream) {
        ocrLocalStream.getTracks().forEach(track => track.stop());
        ocrLocalStream = null;
    }
}

function handleOcrImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        ocrBase64Image = e.target.result;
        document.getElementById('ocr-captured-image').src = ocrBase64Image;
        document.getElementById('ocr-preview-box').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// ناردنی وێنەکە تەنها بۆ دەرهێنانی دەق بەبێ دەستکاری
async function sendOcrToAI() {
    if (!ocrBase64Image) {
        showAlert('تکایە وێنەیەک دیاری بکە!');
        return;
    }

    document.getElementById('ocr-loading').style.display = 'block';

    // پرۆمپتەکە زۆر ڕوونە: تەنها تێکستەکە وەک خۆی بەبێ زیادکردن و کەمکردن یاخود شیکردنەوە
    const promptText = `
    You are a precise Optical Character Recognition (OCR) engine.
    Extract ALL text from this image exactly as it is written. 
    Do NOT summarize, do NOT interpret, do NOT explain, and do NOT add or remove any words.
    Output only the raw text found in the image. Keep the original formatting and line breaks where possible.
    `;

    const base64Data = ocrBase64Image.split(',')[1];
    const mimeType = ocrBase64Image.split(';')[0].split(':')[1];

    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${OCR_GEMINI_KEY}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ]
                }]
            })
        });

        const data = await response.json();
        const rawExtractedText = data.candidates[0].content.parts[0].text;

        // خستنە ناو بۆکسی تێکستەکە
        document.getElementById('ocr-extracted-text-area').value = rawExtractedText;
        document.getElementById('ocr-loading').style.display = 'none';
        
        // پیشاندانی بۆکسی پۆپ ئەپ (Modal)
        document.getElementById('ocr-result-modal').style.display = 'flex';

    } catch (err) {
        console.error(err);
        document.getElementById('ocr-loading').style.display = 'none';
        showAlert('هەڵەیەک ڕوویدا لە کاتی دەرهێنانی دەقەکەدا.');
    }
}

// فەنکشنی کۆپیکردنی هەموو دەقەکە بە یەک کلیک
function copyOcrText() {
    const textArea = document.getElementById('ocr-extracted-text-area');
    textArea.select();
    textArea.setSelectionRange(0, 99999); // بۆ مۆبایلەکان
    navigator.clipboard.writeText(textArea.value);
    showAlert('✓ تەواوی دەقەکە کۆپی کرا!');
}

// ✨ فەنکشنی بڕین و کۆپیکردنی تەنها ئەو بەشەی بەکارهێنەر دیاری کردووە (Select)
function trimOcrSelectedText() {
    const textArea = document.getElementById('ocr-extracted-text-area');
    const start = textArea.selectionStart;
    const finish = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, finish);

    if (!selectedText || start === finish) {
        showAlert('⚠️ تکایە سەرەتا بەشێک لە دەقەکە ناو بۆکسەکە دیاری (Select) بکە!');
        return;
    }

    navigator.clipboard.writeText(selectedText);
    showAlert('✂️ ئەو بەشەی دیاریت کردبوو بە سەرکەوتوویی کۆپی کرا!');
}