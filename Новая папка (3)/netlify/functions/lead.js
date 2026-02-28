// Netlify Function: / .netlify/functions/lead
// Sends lead data to Telegram using environment variables:
// TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server not configured" }) };
    }

    const data = JSON.parse(event.body || "{}");

    const name = (data.name || "").toString().trim();
    const phone = (data.phone || "").toString().trim();
    const address = (data.address || "").toString().trim();
    const task = (data.task || "").toString().trim();
    const page = (data.page || "").toString().trim();

    if (!name || !phone) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Missing required fields" }) };
    }

    const text =
      "🧾 Заявка з сайту ВінДахБуд\n" +
      "👤 Ім'я: " + name + "\n" +
      "📞 Телефон: " + phone + "\n" +
      (address ? "📍 Адреса: " + address + "\n" : "") +
      (task ? "🛠 Задача: " + task + "\n" : "") +
      (page ? "🔗 Сторінка: " + page + "\n" : "");

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });

    const out = await resp.json().catch(() => ({}));
    if (!resp.ok || !out.ok) {
      return { statusCode: 502, body: JSON.stringify({ ok: false, error: "Telegram error" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server error" }) };
  }
};
