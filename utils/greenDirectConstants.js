// 政策阈值与默认参数
// 发改能源〔2026〕688号 第六条
module.exports = {
  RATIO_SELF_USE_OF_GENERATION: 0.60,  // 自发自用/总发电量 >=60%
  RATIO_SELF_USE_OF_LOAD_PRE2030: 0.35, // 自发自用/总用电量 2030前>=35%
  RATIO_SELF_USE_OF_LOAD_POST2030: 0.30,// 自发自用/总用电量 2030后>=30%
  RATIO_GRID_UPLOAD_MAX: 0.20           // 上网电量/总发电量 <=20%
}
