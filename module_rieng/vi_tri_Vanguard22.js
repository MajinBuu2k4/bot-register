// module_rieng/vi_tri_Vanguard22.js

const { goals: { GoalBlock } } = require('mineflayer-pathfinder');

/**
 * Di chuyển bot đến vị trí -17, 55, 133 và quay mặt về yaw=90°, pitch=0°
 */
async function vi_tri_Vanguard22(bot) {
  try {
    console.log('🧭 Đang di chuyển đến -17 55 133...');
    await bot.pathfinder.goto(new GoalBlock(-17, 55, 133));
    console.log('✅ Đã đến tọa độ -17 55 133');
    await bot.look(-90 * Math.PI / 180, 0);
    console.log('👀 Đã quay mặt về hướng yaw=90°, pitch=0°');
  } catch (err) {
    console.log('⚠️ Lỗi khi thực hiện vi_tri_Vanguard22:', err.message);
  }
}

module.exports = vi_tri_Vanguard22;