import http from "node:http";

const port = Number(process.env.PORT || 8787);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.url === "/tool/docs.search") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({
      tool: "docs.search",
      description: "Replace this fixed response with your own docs lookup logic.",
      examples: [
        "What environment variables are required?",
        "How do I start the local server?"
      ]
    }));
    return;
  }

  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("MCP starter kit running. Try /health or /tool/docs.search");
});

server.listen(port, () => {
  console.log(`mcp-starter-kit listening on http://127.0.0.1:${port}`);
});
