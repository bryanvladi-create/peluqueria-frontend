export default async (request: Request, context: any) => {
  const userAgent = request.headers.get("user-agent") || "";
  const isBot = /bot|crawler|spider|whatsapp|facebook|twitter|linkedin|telegram/i.test(userAgent);

  // Si es un humano, lo dejamos pasar a la app de Angular
  if (!isBot) {
    return context.next();
  }

  // Si es un bot, interceptamos el HTML
  const response = await context.next();
  const html = await response.text();

  try {
    // 👇 CAMBIA ESTA URL POR LA DE TU BACKEND EN RENDER 👇
    const API_URL = "https://peluqueria-backend-mmst.onrender.com/api/settings";
    
    const apiRes = await fetch(API_URL);
    if (!apiRes.ok) return response;

    const settings = await apiRes.json();
    
    const title = settings.business_name || "Peluquería";
    const desc = settings.hero_subtitle || "Reserva tu cita con nosotros.";
    const image = settings.hero_image_url || "https://tu-web.netlify.app/assets/default-preview.jpg";

    // Inyectamos las etiquetas en el HTML
    const newHtml = html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${desc}">`)
      .replace('</head>', `
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${desc}">
        <meta property="og:image" content="${image}">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        </head>
      `);

    return new Response(newHtml, response);
  } catch (error) {
    console.error("Error obteniendo los datos para SEO:", error);
    return response;
  }
};