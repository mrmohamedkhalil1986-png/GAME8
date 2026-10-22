const fs = require('fs');

console.log('⏳ جاري ضغط ودمج ملفات اللعبة لتصبح بحجم صغير جداً...');

let html = fs.readFileSync('index.html', 'utf8');

function getBase64Compressed(baseName, types) {
    for (const t of types) {
        const fileName = baseName + t.ext;
        if (fs.existsSync(fileName)) {
            const data = fs.readFileSync(fileName);
            console.log(`✅ تم ضغط ودمج: ${fileName}`);
            return `data:${t.mime};base64,${data.toString('base64')}`;
        }
    }
    console.warn(`⚠️ لم يتم العثور على: ${baseName}`);
    return null;
}

const imgTypes = [
    { ext: '.png', mime: 'image/png' },
    { ext: '.jpg', mime: 'image/jpeg' },
    { ext: '.jpeg', mime: 'image/jpeg' },
    { ext: '.webp', mime: 'image/webp' }
];

const audioTypes = [
    { ext: '.mp3', mime: 'audio/mpeg' },
    { ext: '.wav', mime: 'audio/wav' },
    { ext: '.ogg', mime: 'audio/ogg' },
    { ext: '.m4a', mime: 'audio/mp4' }
];

// 1. دمج الخلفيات والشعارات
const champB64 = getBase64Compressed('champ', imgTypes);
if (champB64) {
    html = html.replace(/url\('champ\.png'\),\s*url\('champ\.jpg'\),\s*url\('champ\.jpeg'\),\s*url\('champ\.webp'\)/g, `url('${champB64}')`);
}

const bgB64 = getBase64Compressed('background', imgTypes);
if (bgB64) {
    html = html.replace(/url\('background\.png'\),\s*url\('background\.jpg'\),\s*url\('background\.jpeg'\),\s*url\('background\.webp'\)/g, `url('${bgB64}')`);
    html = html.replace("url('oman_bg.jpg'),", `url('${bgB64}'),`);
}

['school', 'math', 'logo'].forEach(logoName => {
    const b64 = getBase64Compressed(logoName, imgTypes);
    if (b64) {
        html = html.split(`src="${logoName}.png"`).join(`src="${b64}"`);
    }
});

// 2. دمج الشخصيات الـ 8
const charMap = {};
for (let i = 1; i <= 8; i++) {
    const cName = `char${i}`;
    const b64 = getBase64Compressed(cName, imgTypes);
    if (b64) charMap[cName] = b64;
}

html = html.replace(
    "const charNames = ['char1', 'char2', 'char3', 'char4', 'char5', 'char6', 'char7', 'char8'];",
    `const charNames = ['char1', 'char2', 'char3', 'char4', 'char5', 'char6', 'char7', 'char8'];\n        const embeddedChars = ${JSON.stringify(charMap)};`
);
html = html.replace(
    "img.href.baseVal = `${baseName}.png`;",
    "img.href.baseVal = embeddedChars[baseName] || `${baseName}.png`;"
);

// 3. دمج الملفات الصوتية
['back', 'correct', 'wrong', 'spin'].forEach(audName => {
    const b64 = getBase64Compressed(audName, audioTypes);
    if (b64) {
        html = html.split(`${audName}.mp3`).join(b64);
    }
});

// 4. تقليص حجم كود الhtml وإزالة الفراغات الزائدة لتخفيف الوزن
html = html.replace(/\s+/g, ' ').replace(/>\s+</g, '><');

fs.writeFileSync('Final_Standalone_Game.html', html, 'utf8');
console.log('🎉 تم بنجاح! الملف الجديد جاهز وصغير الحجم: Final_Standalone_Game.html');