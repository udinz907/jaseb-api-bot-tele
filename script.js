const USERNAME1 = "gustafhosting";
const PASSWORD1 = "admin";
const USERNAME2 = "Ress";
const PASSWORD2 = "Ress1";
const USERNAME3 = "trial";
const PASSWORD3 = "trial123";
const USERNAME4 = "free";
const PASSWORD4 = "free123";
const USERNAME5 = "renz";
const PASSWORD5 = "renz123";

let currentUser = localStorage.getItem("currentUser") || null;
let groups = [];
let botToken = "";
let autoSendInterval = null;

function checkLogin() {
    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();
    if (
        (user === USERNAME1 && pass === PASSWORD1) ||
        (user === USERNAME2 && pass === PASSWORD2) ||
        (user === USERNAME3 && pass === PASSWORD3) ||
        (user === USERNAME4 && pass === PASSWORD4) ||
        (user === USERNAME5 && pass === PASSWORD5)
    ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", user);
        currentUser = user;
        loadUserData();
        showBotPage();
        updateUserDisplayName();
    } else {
        alert("Login salah! Silakan Beli Akses Di https://t.me/adhityagustaf22");
    }
}
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    location.reload();
}
function getStorageKey(base) {
    return currentUser ? `${base}_${currentUser}` : base;
}
function loadUserData() {
    groups = JSON.parse(localStorage.getItem(getStorageKey("groupIds")) || "[]");
    botToken = localStorage.getItem(getStorageKey("botToken")) || "";
    if (botToken) document.getElementById("token").style.display = "none";
    renderGroups();
}
function showBotPage() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("botContainer").style.display = "block";
    renderGroups();
}
function saveGroups() {
    localStorage.setItem(getStorageKey("groupIds"), JSON.stringify(groups));
    renderGroups();
}
function renderGroups() {
    document.getElementById("groupList").innerHTML = `<b>Jumlah Group:</b> ${groups.length}`;
}
function addGroup() {
    let ids = document.getElementById("groupId").value.split(/[\s,]+/).map(id => id.trim()).filter(id => id && !groups.includes(id));
    groups = [...groups, ...ids];
    saveGroups();
    document.getElementById("groupId").value = "";
}
function removeGroup() {
    let ids = document.getElementById("groupId").value.split(/[\s,]+/).map(id => id.trim());
    groups = groups.filter(g => !ids.includes(g));
    saveGroups();
    document.getElementById("groupId").value = "";
}
function loadFromFile() {
    let file = document.getElementById("fileInput").files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = e => {
        let ids = e.target.result.split(/[\s,]+/).map(id => id.trim()).filter(id => id && !groups.includes(id));
        groups = [...groups, ...ids];
        saveGroups();
    };
    reader.readAsText(file);
}
function saveToken() {
    let token = document.getElementById("token").value.trim();
    if (token) {
        botToken = token;
        localStorage.setItem(getStorageKey("botToken"), botToken);
        document.getElementById("token").style.display = "none";
        alert("Token berhasil disimpan!");
    }
}
function hapusToken() {
    localStorage.removeItem(getStorageKey("botToken"));
    botToken = "";
    document.getElementById("token").style.display = "block";
    alert("Token dihapus!");
}
async function sendMessage() {
    let token = botToken || document.getElementById("token").value.trim();
    let text = document.getElementById("message").value.trim();
    let photoFile = document.getElementById("photo").files[0];
    if (!token || groups.length === 0) {
        alert("Token dan ID group harus diisi!");
        return;
    }
    await Promise.all(groups.map(async (id) => {
        try {
            if (photoFile) {
                let formData = new FormData();
                formData.append("chat_id", id);
                formData.append("photo", photoFile);
                if (text.length <= 1024) {
                    formData.append("caption", text);
                    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body: formData });
                } else {
                    formData.append("caption", text.substring(0, 1024));
                    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body: formData });
                    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ chat_id: id, text: text })
                    });
                }
            } else {
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: id, text: text })
                });
            }
        } catch (err) { console.error("Gagal kirim ke", id, err); }
    }));
}
async function autoSendLoop() {
    document.getElementById("autoSendStatus").textContent = "Mengirim pesan ke semua grup...";
    await sendMessage();
    document.getElementById("autoSendStatus").textContent = "Selesai mengirim. Menunggu 5 menit untuk pengiriman berikutnya...";
}
function startAutoSend() {
    if (autoSendInterval) return;
    localStorage.setItem(getStorageKey("autoSendActive"), "true");
    document.getElementById("autoSendBtn").style.display = "none";
    document.getElementById("stopAutoSendBtn").style.display = "inline-block";
    document.getElementById("autoSendStatus").style.color = "#00ff00";
    document.getElementById("autoSendStatus").textContent = "Auto Kirim aktif. Mulai mengirim...";
    autoSendLoop();
    autoSendInterval = setInterval(autoSendLoop, 300000);
}
function stopAutoSend() {
    if (!autoSendInterval) return;
    clearInterval(autoSendInterval);
    autoSendInterval = null;
    localStorage.removeItem(getStorageKey("autoSendActive"));
    document.getElementById("autoSendBtn").style.display = "inline-block";
    document.getElementById("stopAutoSendBtn").style.display = "none";
    document.getElementById("autoSendStatus").style.color = "#ff0000";
    document.getElementById("autoSendStatus").textContent = "Auto Kirim dihentikan oleh pengguna.";
}
function updateUserDisplayName() {
    if (currentUser) document.getElementById("userDisplayName").textContent = currentUser;
}
if (localStorage.getItem("isLoggedIn") === "true" && localStorage.getItem("currentUser")) {
    currentUser = localStorage.getItem("currentUser");
    loadUserData();
    showBotPage();
    updateUserDisplayName();
    if (localStorage.getItem(getStorageKey("autoSendActive")) === "true") {
        startAutoSend();
    }
}