// Vercel Serverless Function - 写入 Google Sheets 速度测试

module.exports = async function handler(req, res) {
  // 允许跨域（方便调试）
  res.setHeader('Access-Control-Allow-Origin', '*');

  const startTime = Date.now();

  try {
    // 你的 Google Apps Script 写入地址（action=testWrite）
    // 每次写入带随机参数，避免重复
    const timestamp = Date.now();
    const SHEET_API_URL = `https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycby_d-Q0vryRXKrayiIJYvz54zf8ji6q95rh_2wc4OsstFKEpsr9LH98enHnXxqE4fhe/exec?action=testWrite&name=Vercel测试&action=速度测试_${timestamp}`;

    // 发起写入请求到 Google Sheets
    const response = await fetch(SHEET_API_URL, {
      signal: AbortSignal.timeout(30000) // 30秒超时
    });

    const text = await response.text();
    const endTime = Date.now();
    const elapsedMs = endTime - startTime;

    // 尝试解析 JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.status(200).json({
      success: response.ok,
      elapsedMs: elapsedMs,
      elapsedSeconds: (elapsedMs / 1000).toFixed(2),
      httpStatus: response.status,
      data: data,
      timestamp: new Date().toISOString(),
      note: 'Vercel → Google Sheets 写入速度测试'
    });

  } catch (error) {
    const endTime = Date.now();
    const elapsedMs = endTime - startTime;

    res.status(500).json({
      success: false,
      elapsedMs: elapsedMs,
      elapsedSeconds: (elapsedMs / 1000).toFixed(2),
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString(),
      note: '写入失败，请检查 Apps Script 部署'
    });
  }
};