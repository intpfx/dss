///<reference lib="dom" />

import { CI, CMJS, roadmap } from "jsr:@intpfx/fx";

CI({ title: "Data Storage Station", icon: "icon.svg" });
CMJS(async () => {
  console.log("Welcome to Data Storage Station");
  const data = await fetch("/test");
  const json = await data.json();
  console.log(json);
  const h1 = document.createElement("h1");
  h1.textContent = json.message;
  document.body.appendChild(h1);
  const p = document.createElement("p");
  p.textContent = "Powered by @intpfx/fx";
  p.style = "font-size: 12px; color: #666; margin-top: 20px;";
  document.body.appendChild(p);
});

roadmap.mark("icon.svg", (messages) => {
  const { headers } = messages;
  headers.set("Content-Type", "image/svg+xml");
  const body = /*html*/`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 207 207"><path d="M85.06,119.01h-32.03v-31.98h-31.88v-32.02h63.76v-31.92h32.1v63.96s.07-.07.07-.07h-32.07v32.08l.07-.07Z"/><path d="M117,87.06c18.89-.03,37.78-.06,56.67-.09,2.32,0,4.63,0,7.11,0v32.03h-63.77l.06.07c0-10.7,0-21.39,0-32.09l-.07.07Z"/><path d="M117.01,119.01c-.02,20.23-.04,40.47-.06,60.7,0,.98,0,1.96,0,3.11h-31.75c-.08-.52-.23-1.07-.23-1.62-.01-20.4-.01-40.8,0-61.2,0-.33.06-.66.1-.99,0,0-.07.07-.07.07,10.69,0,21.39,0,32.08,0l-.06-.07Z"/></svg>`;
  return new Response(body, { status: 200, headers });
});

roadmap.mark("test", (messages) => {
  const { headers } = messages;
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify({ message: "项目开发中..." }), { status: 200, headers });
});