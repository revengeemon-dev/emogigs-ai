export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Emogigs AI API is running.", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    try {
      const body = await request.json();
      const message = body.message;

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message is required." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      return new Response(
        JSON.stringify({
          reply: "Your AI backend is connected. AI engine configuration is the next step."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid request." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};