# bee.ts

---

Little node.js package to create simple front for backend api

sample ->

```ts
// style.ts

export const style = {
  dashboard: {
    position: "absolute",
    top: "50px",
    width: "60%",
    margin: "auto",
    padding: "10px",
  },
  body: {
    margin: "0px",
    position: "absolute",
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    fontFamily:
      "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
  },
  hr: {
    border: "solid #1e2124 1.75px",
    background: "#1e2124",
    borderRadius: "10px",
  },
};
```

```ts
// worker.ts

export const worker = {
  point: [0, 0],
  add_point_x() {
    this.point[0]++;
  },
  add_point_y() {
    this.point[1]++;
  },
  onload_set_points() {
    document.querySelector('[ref="points"]').textContent =
      "points: [x]=0 [y]=0";
  },
  update_points(element) {
    element.textContent = `points: [x]=${this.point[0]} [y]=${this.point[1]}`;
  },
};
```

```ts
// main.ts

const hive = new Hive("Readme");
hive.style("body", style.body);
hive.style("hr", style.hr);

hive.script(worker);

const dashboard = new Bee().style("", style.dashboard);

dashboard.add("#Readme", "h1");
dashboard.add("", "hr");
dashboard.add("#Here is subsection", "h2");
dashboard.add("#Here is u(b(description))", "p");

const workbench = dashboard.add("", "div.workbench");

workbench.add("", "span$points");
workbench.add("", "br");

workbench.add("add X", "button#add_x").click(({ worker, ref }) => {
  worker.add_point_x();
  worker.update_points(ref.points);
});
workbench.add("add Y", "button#add_y").click(({ worker, ref }) => {
  worker.add_point_y();
  worker.update_points(ref.points);
});

hive.push(dashboard);
hive.hive_html();
```

![](https://cdn.discordapp.com/attachments/769962861597818913/992571072929071124/unknown.png)
