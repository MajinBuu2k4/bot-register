const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const { SocksProxyAgent } = require('socks-proxy-agent');
const webInventory = require('mineflayer-web-inventory');
const { pathfinder, Movements, goals: { GoalBlock } } = require('mineflayer-pathfinder');

// Cấu hình
const DEFAULT_X = 17;
const DEFAULT_Y = 55;
const DEFAULT_Z = 171;
const DEFAULT_YAW = 35; // độ
const DEFAULT_PITCH = 0; // độ
const INVENTORY_PORT = 3000;

// Trạng thái bot
let bot;
let state = {
    registered: false,
    loggedIn: false,
    menuOpened: false,
    warped: false,
    cooldown: false
};

// 👉 Hàm đọc danh sách proxy từ thư mục /proxy
function getProxyList() {
    const proxyDir = path.join(__dirname, 'proxy');
    const files = fs.readdirSync(proxyDir).filter(file => file.endsWith('.txt'));

    return files.map(file => {
        const content = fs.readFileSync(path.join(proxyDir, file), 'utf-8').trim();
        return content; // Trả về dòng như "ip:port:user:pass"
    });
}

// 👉 Lấy proxy ngẫu nhiên từ danh sách
function getRandomProxy() {
    const proxies = getProxyList();
    if (proxies.length === 0) return null;
    const random = Math.floor(Math.random() * proxies.length);
    return proxies[random];
}

function createBot() {
    const proxyString = getRandomProxy();

    let agent = undefined;

    if (proxyString) {
        const [ip, port, user, pass] = proxyString.split(':');
        const proxyUrl = `socks5://${user}:${pass}@${ip}:${port}`;
        agent = new SocksProxyAgent(proxyUrl);
        console.log(`🌐 Đang dùng proxy: ${ip}:${port}`);
    } else {
        console.log("⚠️ Không tìm thấy proxy. Kết nối trực tiếp.");
    }

    bot = mineflayer.createBot({
        host: 'mc.luckyvn.com',
        username: 'Vanguard13',
        version: '1.18.2',
        agent: agent,
    });

    bot.loadPlugin(pathfinder);
    webInventory(bot, { port: INVENTORY_PORT });

    bot.once('spawn', () => {
        const defaultMove = new Movements(bot);
        bot.pathfinder.setMovements(defaultMove);
        console.log("🟢 Bot đã vào game");
        console.log(`🌐 Xem inventory tại: http://localhost:${INVENTORY_PORT}`);
    });

    bot.on('message', async (message) => {
        const msg = message.toString();
        console.log(message.toAnsi ? message.toAnsi() : msg);

        if (msg.includes('VUI LÒNG ĐĂNG KÍ TÀI KHOẢN.') && !state.registered) {
            await bot.chat('/register Phuc2005 Phuc2005');
            state.registered = true;
            console.log("📝 Đã gửi lệnh đăng ký");

            setTimeout(async () => {
                await bot.chat('/login Phuc2005');
                state.loggedIn = true;
                console.log("🔐 Đã gửi lệnh login");
            }, 3000);
        }

        if (msg.includes('Đăng nhập thành công') && !state.menuOpened) {
            setTimeout(() => {
                bot.setQuickBarSlot(4);
                bot.activateItem();
                console.log("🕹 Mở menu chọn chế độ");
            }, 1000);
        }

        if (msg.includes('Bạn đã mở bảng chọn máy chủ!') && !state.menuOpened) {
            state.menuOpened = true;
            setTimeout(() => bot.clickWindow(22, 0, 0), 1000);
            setTimeout(() => {
                bot.clickWindow(34, 0, 0);
                console.log("✅ Đã chọn chế độ chơi");
            }, 2500);
        }




          // Reset trạng thái khi vào sảnh
  bot.on('respawn', () => {
    menuOpened = false;
    console.log('♻️ Đã reset trạng thái menu khi vào sảnh');
    
    // Đảm bảo bot cầm Clock khi vào sảnh
    setTimeout(() => {
      const clockSlot = bot.inventory.slots[36 + 4];
      if (clockSlot?.name.includes('clock')) {
        bot.setQuickBarSlot(4);
        console.log('🔁 Đã cầm lại Clock sau khi vào sảnh');
      }
    }, 2000);
  });




        

        if (msg.includes('Chào mừng') && !state.warped) {
            state.warped = true;
            setTimeout(async () => {
                await bot.chat('/warp afk');
                console.log("🚀 Đang warp sang khu AFK");

                setTimeout(async () => {
                    try {
                        console.log(`🧭 Đang đi đến ${DEFAULT_X} ${DEFAULT_Y} ${DEFAULT_Z}`);
                        await bot.pathfinder.goto(new GoalBlock(DEFAULT_X, DEFAULT_Y, DEFAULT_Z));

                        const yawRadians = DEFAULT_YAW * Math.PI / 180;
                        const pitchRadians = DEFAULT_PITCH * Math.PI / 180;
                        await bot.look(yawRadians, pitchRadians);
                        console.log(`👀 Đã chỉnh hướng nhìn ${DEFAULT_YAW} ${DEFAULT_PITCH}`);
                    } catch (err) {
                        console.log("⚠️ Lỗi:", err.message);
                    }
                }, 3000);
            }, 3000);
        }
    });

    bot.on('end', () => {
        console.log("♻️ Tự động kết nối lại sau 5s...");
        setTimeout(createBot, 5000);
    });

    process.stdin.on('data', data => {
        const input = data.toString().trim();

        if (input === '#reset') {
            console.log("🔄 Đang khởi động lại bot...");
            bot.end();
            return;
        }

        if (!state.cooldown) {
            bot.chat(input);
            console.log(`⌨ Gửi lệnh: ${input}`);
        }
    });
}

createBot();
