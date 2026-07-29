// Vercel Serverless Function
// 测试 Vercel → Google Sheets 的读写速度

const TEST_READ_URL = 'https://script.google.com/macros/s/AKfycby_d-Q0vryRXKrayiIJYvz54zf8ji6q95rh_2wc4OsstFKEpsr9LH98enHnXxqE4fhe/exec?action=testRead';
const TEST_WRITE_URL = 'https://script.google.com/macros/s/AKfycby_d-Q0vryRXKrayiIJYvz54zf8ji6q95rh_2wc4OsstFKEpsr9LH98enHnXxqE4fhe/exec?action=testWrite';

module.exports = async function handler(req, res) {
  const startTime = Date.now();

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.searchParams.get('action') || 'read';

    let result = {};

    if (action === 'read') {
      // 测试读取
      const readStart = Date.now();
      const response = await fetch(TEST_READ_URL, { signal: AbortSignal.timeout(30000) });
      const text = await response.text();
      const readTime = Date.now() - readStart;

      // 尝试解析JSON，看是否成功
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      result = {
        action: 'read',
        success: response.ok,
        responseTime: readTime + 'ms',
        data: data,
        httpStatus: response.status
      };

    } else if (action === 'write') {
      // 测试写入（带一个随机参数，避免重复）
      const writeStart = Date.now();
      const writeUrl = TEST_WRITE_URL + '&name=Vercel测试&action=速度测试' + Date.now();
      const response = await fetch(writeUrl, { signal: AbortSignal.timeout(30000) });
      const text = await response.text();
      const writeTime = Date.now() - writeStart;

      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      result = {
        action: 'write',
        success: response.ok,
        responseTime: writeTime + 'ms',
        data: data,
        httpStatus: response.status
      };
    } else {
      return res.status(400).json({ error: 'Invalid action. Use ?action=read or ?action=write' });
    }

    // 计算总耗时
    const totalTime = Date.now() - startTime;

    res.status(200).json({
      ...result,
      totalTime: totalTime + 'ms',
      note: 'Vercel → Google Sheets 速度测试'
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    res.status(500).json({
      action: 'test',
      success: false,
      error: error.message,
      totalTime: totalTime + 'ms',
      note: '如果出现超时(AbortError)，说明Vercel到Google Sheets可能超过30秒'
    });
  }
};