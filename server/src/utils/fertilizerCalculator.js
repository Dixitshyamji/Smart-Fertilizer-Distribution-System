
const calculateQuota = (landAreaAcres) => {
  const acres = parseFloat(landAreaAcres) || 0;

  if (acres <= 0.50) {
    return { urea_bags: 1, dap_bags: 1, npk_bags: 1 };
  } else if (acres <= 1.0) {
    return { urea_bags: 2, dap_bags: 2, npk_bags: 2 };
  } else {
    return {
      urea_bags: Math.max(2, Math.ceil(acres * 2)),
      dap_bags: Math.max(2, Math.ceil(acres * 2)),
      npk_bags: Math.max(2, Math.ceil(acres * 1))
    };
  }
};

module.exports = { calculateQuota };