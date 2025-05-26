const fs = require('fs');
const path = require('path');

const baseX = -18;
const baseY = 55;
const startZ = 143;
const count = 13;
const outputDir = path.join(__dirname, 'module_rieng');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (let i = 0; i < count; i++) {
  const z = startZ - i;
  const index = (i + 1).toString().padStart(2, '0');
  const fileName = `vi_tri_Vanguard${index}.js`;
  const filePath = path.join(outputDir, fileName);

  const content = `
// module_rieng/${fileName}

const { goals: { GoalBlock } } = require('mineflayer-pathfinder');

async function vi_tri_Vanguard${index}(bot) {
  try {
    console.log('🧭 Đang di chuyển đến ${baseX} ${baseY} ${z}...');
    await bot.pathfinder.goto(new GoalBlock(${baseX}, ${baseY}, ${z}));
    console.log('✅ Đã đến tọa độ ${baseX} ${baseY} ${z}');
    await bot.look(-90 * Math.PI / 180, 0);
    console.log('👀 Đã quay mặt về hướng yaw=90°, pitch=0°');
  } catch (err) {
    console.log('⚠️ Lỗi khi di chuyển đến Vanguard${index}:', err.message);
  }
}

module.exports = vi_tri_Vanguard${index};
`;

  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ Đã tạo: ${fileName}`);
}
