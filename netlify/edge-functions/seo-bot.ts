export default async (request: Request, context: any) => {
  const userAgent = request.headers.get("user-agent") || "";
  // Detectar bots de redes sociales
  const isBot = /bot|crawler|spider|whatsapp|facebook|twitter|linkedin|telegram/i.test(userAgent);

  // Si es un humano, pasa de largo inmediatamente
  if (!isBot) {
    return context.next();
  }

  try {
    const response = await context.next();
    const html = await response.text();

    // Si no es HTML, lo dejamos pasar tal cual
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    // 👇 TIMEOUT DE 2 SEGUNDOS PARA NO COLGAR NETLIFY 👇
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const API_URL = "https://peluqueria-backend-mmst.onrender.com/api/settings";
    let settings = null;

    try {
      const apiRes = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (apiRes.ok) {
        settings = await apiRes.json();
      }
    } catch (e) {
      console.warn("API lenta o inaccesible para SEO, usando valores por defecto.");
    }

    // Si obtuvimos los datos, inyectamos las etiquetas
    if (settings) {
      const title = settings.business_name || "Peluquería";
      const desc = settings.hero_subtitle || "Reserva tu cita.";
      const image = settings.hero_image_url || "";

      let newHtml = html
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace('</head>', `
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${desc}">
          <meta property="og:image" content="${image}">
          <meta property="og:type" content="website">
          </head>
        `);

      return new Response(newHtml, {
        headers: response.headers,
        status: response.status
      });
    }

    return response;
  } catch (error) {
    console.error("Error en SEO Bot:", error);
    return context.next(); // Si algo falla, mostramos la web normal
  }
};