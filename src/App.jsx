import { useState, useEffect, createElement, Fragment } from "react";

const h = createElement;

const CITIES = [["KNO","Medan"],["CGK","Jakarta"],["SUB","Surabaya"],["DPS","Bali"],["YIA","Yogyakarta"],["UPG","Makassar"]];
const CLASSES = ["Ekonomi", "Bisnis", "First"];
const rnd = n => Math.floor(Math.random() * n);
const city = c => (CITIES.find(x => x[0] === c) || [])[1] || "Pilih kota";

function Plane({ w, hgt }) {
  return h("svg", { viewBox: "0 0 64 24", width: w, height: hgt, style: w ? undefined : undefined },
    h("polygon", { points: "22,9 34,9 27,1 21,1", fill: "#1f5fbf" }),
    h("polygon", { points: "22,15 34,15 27,23 21,23", fill: "#1f5fbf" }),
    h("polygon", { points: "6,9 13,9 7,3 3,3", fill: "#ff7a3d" }),
    h("polygon", { points: "6,15 13,15 7,21 3,21", fill: "#ff7a3d" }),
    h("path", { d: "M3 12Q3 9 12 9H50Q60 9 62 12Q60 15 50 15H12Q3 15 3 12Z", fill: "#fff", stroke: "#cfd5e3" }),
    h("path", { d: "M52 10.5Q58 10.5 60 12L52 12Z", fill: "#7fb8e6" }));
}

function Barcode({ seed, faded }) {
  const s = seed || "AIRLIA";
  const bars = Array.from({ length: 44 }, (_, i) => 1 + ((s.charCodeAt(i % s.length) * (i + 3)) % 4));
  return h("div", { className: "bars" + (faded ? " faded" : "") },
    bars.map((w, i) => h("i", { key: i, style: { width: w + "px", opacity: i % 7 === 3 ? 0 : 1 } })),
    !faded && h("span", { className: "scan" }));
}

function App() {
  const today = new Date().toISOString().slice(0, 10);
  const blank = { name: "", from: "", to: "", date: "", cls: "Ekonomi" };
  const [f, setF] = useState(blank);
  const [stage, setStage] = useState("form");
  const [flying, setFlying] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(null);

  useEffect(() => { document.body.dataset.stage = stage; }, [stage]);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const filled = [f.name.trim(), f.from, f.to && f.to !== f.from ? f.to : "", f.date].filter(Boolean).length;
  const progress = stage === "form" ? filled / 4 : 1;
  const pos = 4 + progress * 92;

  const submit = () => {
    if (!f.name.trim()) return setErr("Nama penumpang wajib diisi.");
    if (!f.from || !f.to) return setErr("Pilih kota asal dan tujuan.");
    if (f.from === f.to) return setErr("Asal dan tujuan tidak boleh sama.");
    if (!f.date) return setErr("Pilih tanggal berangkat.");
    setErr("");
    const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    setInfo({
      code: Array.from({ length: 6 }, () => A[rnd(A.length)]).join(""),
      seat: (1 + rnd(30)) + "ABCDEF"[rnd(6)],
      gate: "ABC"[rnd(3)] + (1 + rnd(9)),
      time: "0" + (5 + rnd(5)) + ":" + ["05", "20", "45"][rnd(3)],
      confetti: Array.from({ length: 32 }, () => ({
        x: (rnd(520) - 260) + "px", y: -(60 + rnd(240)) + "px", r: (rnd(720) - 360) + "deg",
        c: ["#ff7a3d", "#1f5fbf", "#ffd23f", "#2ecc71", "#e84393", "#7fb8e6"][rnd(6)],
        d: (0.15 + rnd(40) / 100) + "s", t: (1.8 + rnd(10) / 10) + "s"
      }))
    });
    setStage("tearing"); setFlying(true);
    setTimeout(() => setStage("done"), 2200);
    setTimeout(() => setFlying(false), 3700);
  };

  const reset = () => { setF(blank); setStage("form"); setInfo(null); };
  const dateTxt = f.date ? new Date(f.date + "T00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

  const mainForm = [
    h("label", { key: "a" }, "Nama penumpang"),
    h("input", { key: "b", type: "text", value: f.name, placeholder: "Sesuai KTP / paspor", onChange: e => set("name", e.target.value) }),
    h("div", { key: "c", className: "two" },
      h("div", null, h("label", null, "Dari"),
        h("select", { value: f.from, onChange: e => set("from", e.target.value) },
          h("option", { value: "" }, "Pilih"), CITIES.map(c => h("option", { key: c[0], value: c[0] }, c[1] + " (" + c[0] + ")")))),
      h("div", null, h("label", null, "Ke"),
        h("select", { value: f.to, onChange: e => set("to", e.target.value) },
          h("option", { value: "" }, "Pilih"), CITIES.map(c => h("option", { key: c[0], value: c[0] }, c[1] + " (" + c[0] + ")"))))),
    h("label", { key: "d" }, "Tanggal berangkat"),
    h("input", { key: "e", type: "date", min: today, value: f.date, onChange: e => set("date", e.target.value) }),
    h("label", { key: "f" }, "Kelas"),
    h("div", { key: "g", className: "seg" }, CLASSES.map(c => h("button", { key: c, type: "button", className: f.cls === c ? "on" : "", onClick: () => set("cls", c) }, c))),
    err && h("p", { key: "h", className: "err" }, err),
    h("button", { key: "i", type: "button", className: "go", onClick: submit, disabled: stage !== "form" }, "CHECK-IN SEKARANG ✈")
  ];

  const mainDone = info && h("div", { className: "ok" },
    h("h2", null, "Check-in berhasil!"),
    h("p", null, "Selamat terbang, " + f.name.trim().split(" ")[0] + ". Tunjukkan boarding pass ini di gate."),
    h("div", { className: "stampwrap" }, h("div", { className: "stamp" }, "✓ CHECKED IN")),
    h("div", { className: "grid" },
      h("div", null, h("label", { style: { margin: "0 0 3px" } }, "Tanggal"), h("b", null, dateTxt)),
      h("div", null, h("label", { style: { margin: "0 0 3px" } }, "Kelas"), h("b", null, f.cls)),
      h("div", null, h("label", { style: { margin: "0 0 3px" } }, "Gate"), h("b", null, info.gate)),
      h("div", null, h("label", { style: { margin: "0 0 3px" } }, "Boarding"), h("b", null, info.time + " WIB"))),
    h("button", { type: "button", className: "go", style: { background: "#1f5fbf" }, onClick: reset }, "PESAN TIKET LAGI"));

  const confetti = stage === "done" && info && h("div", { className: "confetti" },
    info.confetti.map((q, i) => h("i", { key: i, style: { "--x": q.x, "--y": q.y, "--r": q.r, "--c": q.c, "--d": q.d, "--t": q.t } })));
  const stubCls = "stub" + (stage === "tearing" ? " tear" : stage === "done" ? " drop" : "");

  return h(Fragment, null,
    h("div", { className: "ticket" + (stage === "done" ? " done" : "") },
      stage === "done" && h("div", { className: "shine" }),
      confetti,
      h("div", { className: "head" }, h("span", null, "AIR LIA"), h("span", null, "BOARDING PASS")),
      h("div", { className: "main" },
        h("div", { className: "route" },
          h("div", { className: "code" }, f.from || "---", h("small", null, city(f.from))),
          h("div", { className: "track" },
            h("i", { style: { width: pos + "%" } }),
            h("div", { style: { position: "absolute", left: pos + "%", top: 0 } }, h(Plane, { w: 40, hgt: 24 }))),
          h("div", { className: "code r" }, f.to || "---", h("small", null, city(f.to)))),
        stage === "done" ? mainDone : mainForm),
      h("div", { className: "perf" }),
      h("div", { className: stubCls, key: stage === "done" ? "issued" : "stub" },
        h("div", { className: "row" },
          h("div", null, h("span", { className: "k" }, "Penumpang"), h("b", null, (f.name.trim() || "NAMA PENUMPANG").toUpperCase().slice(0, 18))),
          h("div", null, h("span", { className: "k" }, "Kursi"), h("b", null, stage === "done" && info ? info.seat : "--")),
          h("div", null, h("span", { className: "k" }, "Kode"), h("b", null, stage === "done" && info ? info.code : "------"))),
        h(Barcode, { seed: info ? info.code : "", faded: stage !== "done" }))),
    flying && h("div", { className: "fly" }, h("div"), h(Plane, {})));
}

export default App;
