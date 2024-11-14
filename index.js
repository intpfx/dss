///<reference lib="dom" />

import { CI, CMJS, roadmap } from "jsr:@intpfx/fx";

CI({ title: "Data Storage Station", icon: "icon.svg" });
CMJS(async () => {
  const data = await fetch("/dataset");
  const reader = data.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const div = document.createElement("div");
  div.style = "margin-top: 20px; padding: 10px; display: grid; grid-template-columns: repeat(3, 1fr);";
  document.body.appendChild(div);

  const btn1 = document.createElement("button");
  btn1.textContent = "Clear";
  btn1.style = "margin-top: 20px; padding: 10px; background-color: #007bff; color: #fff; border: none; cursor: pointer;";
  btn1.onclick = async () => {
    await fetch("/clear", { method: "POST" });
    // table.innerHTML = "";
    // counter.value = 0;
  };
  div.appendChild(btn1);

  const btn2 = document.createElement("button");
  btn2.textContent = "Write";
  btn2.style = "margin-top: 20px; padding: 10px; background-color: #007bff; color: #fff; border: none; cursor: pointer;";
  btn2.onclick = async () => {
    await fetch("/write", { method: "POST" });
  };
  div.appendChild(btn2);

  const btn3 = document.createElement("button");
  btn3.textContent = "Random Change";
  btn3.style = "margin-top: 20px; padding: 10px; background-color: #007bff; color: #fff; border: none; cursor: pointer;";
  btn3.onclick = async () => {
    await fetch("/randomChange", { method: "POST" });
  };
  div.appendChild(btn3);

  const table = document.createElement("table");
  table.style = "margin-top: 20px; border-collapse: collapse; border: 1px solid #ddd; width: 100%;";
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  const th1 = document.createElement("th");
  th1.textContent = "Key";
  th1.style = "border: 1px solid #ddd; padding: 10px;";
  const th2 = document.createElement("th");
  th2.textContent = "Value";
  th2.style = "border: 1px solid #ddd; padding: 10px;";
  tr.appendChild(th1);
  tr.appendChild(th2);
  thead.appendChild(tr);
  table.appendChild(thead);
  document.body.appendChild(table);

  const span = document.createElement("span");
  span.textContent = "Loading...";
  span.style = "font-size: 12px; color: #666; margin-top: 20px;";
  document.body.appendChild(span);
  const counter = new Proxy({ value: 0 }, {
    set(target, prop, value) {
      target[prop] = value;
      if (prop === "value") {
        span.textContent = `${value} records loaded.`;
      }
      return true;
    }
  });

  const p = document.createElement("p");
  p.textContent = "Powered by @intpfx/fx";
  p.style = "font-size: 12px; color: #666; margin-top: 20px;";
  document.body.appendChild(p);

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log("Stream complete");
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      const json = JSON.parse(part.replace("data: ", ""));

      let isExist = false;
      for (let i = 1; i < table.rows.length; i++) {
        if (table.rows[i].cells[0].textContent === json.key.toString()) {
          if (json.value) {
            table.rows[i].cells[1].textContent = json.value;
          } else {
            table.deleteRow(i);
            counter.value--;
          }
          isExist = true;
          break;
        }
      }
      if (isExist) continue;

      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      td1.style = "border: 1px solid #ddd; padding: 10px;";
      td1.textContent = json.key;
      const td2 = document.createElement("td");
      td2.style = "border: 1px solid #ddd; padding: 10px;";
      td2.textContent = json.value;
      tr.appendChild(td1);
      tr.appendChild(td2);
      table.appendChild(tr);
      counter.value++;
    }
  }
});

// 创建一个数组来存储所有的监听任务
const WATCH_TASKS = [];
let STREAM_CONTROLLER = null;

async function write(times) {
  const output = [];
  const db = await Deno.openKv();
  for (let i = 0; i < times; i++) {
    const randomKey1 = Math.random().toString(36).substring(7);
    const randomKey2 = Math.random().toString(36).substring(7);
    const randomValue = Math.random().toString(36).substring(7);
    await db.set([randomKey1, randomKey2], randomValue);
    output.push([randomKey1, randomKey2]);
  }
  return output;
}
async function randomChange(times) {
  let count = 0;

  const array = [];
  const db = await Deno.openKv();
  const entries = db.list({ prefix: [] });
  for await (const entry of entries) {
    array.push(entry.key);
  }

  while (count < times) {
    const randomValue = Math.random().toString(36).substring(7);
    const randomIndex = Math.floor(Math.random() * array.length);
    await db.set(array[randomIndex], randomValue);
    await new Promise((resolve) => setTimeout(resolve, 100));
    count++;
  }
}
async function clear() {
  const array = [];
  const db = await Deno.openKv();
  const entries = db.list({ prefix: [] });
  for await (const entry of entries) {
    array.push(db.delete(entry.key));
  }
  await Promise.all(array);
}

roadmap.mark("icon.svg", (messages) => {
  const { headers } = messages;
  headers.set("Content-Type", "image/svg+xml");
  const body = /*html*/`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 207 207"><path d="M85.06,119.01h-32.03v-31.98h-31.88v-32.02h63.76v-31.92h32.1v63.96s.07-.07.07-.07h-32.07v32.08l.07-.07Z"/><path d="M117,87.06c18.89-.03,37.78-.06,56.67-.09,2.32,0,4.63,0,7.11,0v32.03h-63.77l.06.07c0-10.7,0-21.39,0-32.09l-.07.07Z"/><path d="M117.01,119.01c-.02,20.23-.04,40.47-.06,60.7,0,.98,0,1.96,0,3.11h-31.75c-.08-.52-.23-1.07-.23-1.62-.01-20.4-.01-40.8,0-61.2,0-.33.06-.66.1-.99,0,0-.07.07-.07.07,10.69,0,21.39,0,32.08,0l-.06-.07Z"/></svg>`;
  return new Response(body, { status: 200, headers });
});

// roadmap.mark("base.mod", (messages) => {
//   const { headers } = messages;
//   const context = () => {
//     class WebBase extends HTMLElement {
//       static isServerNode = false;
//       static fire(type, detail) {
//         globalThis.dispatchEvent(new CustomEvent(type, { detail: detail }));
//       }
//       static on(type, callback) {
//         return globalThis.addEventListener(type, callback, false);
//       }
//       constructor() {
//         super();
//         /**@type {ShadowRoot} */
//         this.root = this.attachShadow({ mode: 'open' });
//         this.sheet = new CSSStyleSheet();
//         this.root.adoptedStyleSheets = [this.sheet];
//         this.template = new Proxy(document.createElement('template'), {
//           set: (target, prop, value) => {
//             if (prop === 'innerHTML') {
//               this.root.innerHTML = '';
//               const style = value.match(/<style>([\s\S]*)<\/style>/)?.[1] || "";
//               value = value.replace(/<style>[\s\S]*<\/style>/, "");
//               target.innerHTML = value.trim();
//               this.root.appendChild(target.content.cloneNode(true));
//               this.sheet.replaceSync(style);
//             }
//             return true;
//           }
//         });
//       };
//       static async $define() {
//         const className = this.name;
//         const tagName = className[0] === "$" ? className.slice(1).replace(/(?<!^)([A-Z])/g, "-$1").toLowerCase() : className.replace(/(?<!^)([A-Z])/g, "-$1").toLowerCase();
//         if (!customElements.get(tagName)) {
//           customElements.define(tagName, this);
//           globalThis[className] = this;
//         }
//         if (className === "WebBase") { await this.#boot(); }
//         return [className, tagName];
//       };
//       static async $new(options = undefined) {
//         const nameArray = await this.$define();
//         const rareInstance = this.zone.rareMap.get(nameArray[1]);
//         if (rareInstance) { return rareInstance; }
//         const instance = new this(options);
//         if (instance.rare) {
//           this.zone.rareMap.set(instance.rare, instance);
//         }
//         return instance;
//       };
//       static async #boot() {
//         document.body.appendChild(await $SudokuGrid.$new($ControlPanel));
//       }
//     }
//   };
// });

// roadmap.mark("auth.mod", async (messages) => {
//   const { headers } = messages;

// });

roadmap.mark("dataset", async (messages) => {
  const { headers } = messages;
  const db = await Deno.openKv();
  const entries = db.list({ prefix: [] });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      STREAM_CONTROLLER = controller;

      for await (const entry of entries) {
        const data = `data: ${JSON.stringify({ key: entry.key, value: entry.value })}\n\n`;
        controller.enqueue(encoder.encode(data));

        // 创建一个独立的异步任务来处理 db.watch()
        const watchTask = (async () => {
          const something = db.watch([entry.key]);
          for await (const some of something) {
            const data = `data: ${JSON.stringify({ key: some[0].key, value: some[0].value })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        })();
        WATCH_TASKS.push(watchTask);
      }
      await Promise.all(WATCH_TASKS);
    },
  });
  headers.set("Content-Type", "text/event-stream");
  return new Response(stream, { status: 200, headers });
});

roadmap.mark("read", async (messages) => {
  const { request, headers } = messages;
  const { key } = await request.json();
  const db = await Deno.openKv();
  const result = await db.get(key);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(result), { status: 200, headers });
});

roadmap.mark("write", async (messages) => {
  const { headers } = messages;

  // 生成一个1-100的随机数
  const random = Math.floor(Math.random() * 100) + 1;

  const output = await write(random);
  if (STREAM_CONTROLLER) {
    const db = await Deno.openKv();
    for (const key of output) {
      const watchTask = ((async () => {
        const something = db.watch([key]);
        for await (const some of something) {
          const data = `data: ${JSON.stringify({ key: some[0].key, value: some[0].value })}\n\n`;
          STREAM_CONTROLLER.enqueue(new TextEncoder().encode(data));
        }
      }))();
      WATCH_TASKS.push(watchTask);
    }
  }
  headers.set("Content-Type", "application/json");
  return new Response(null, { status: 200, headers });
});

roadmap.mark("randomChange", (messages) => {
  const { headers } = messages;
  const random = Math.floor(Math.random() * 100) + 1;
  randomChange(random);
  headers.set("Content-Type", "application/json");
  return new Response(null, { status: 200, headers });
});

roadmap.mark("clear", (messages) => {
  const { headers } = messages;
  clear();
  headers.set("Content-Type", "application/json");
  return new Response(null, { status: 200, headers });
});