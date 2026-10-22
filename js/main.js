(function () {
  "use strict";

  /* ---------- Navbar: shadow on scroll + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  var toTop = document.getElementById("toTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      menu.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Active link highlighting ---------- */
  var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  var sections = links.map(function (l) { return document.querySelector(l.getAttribute("href")); });
  function setActive() {
    var pos = (window.scrollY || 0) + 120;
    var current = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) current = i; });
    links.forEach(function (l, i) { l.classList.toggle("active", i === current); });
  }
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Project reference table ---------- */
  var data = (window.STC_PROJECTS || []).map(function (r, i) {
    return { no: i + 1, year: r[0], name: r[1], field: r[2], loc: r[3], app: r[4], pump: r[5] };
  });
  var body = document.getElementById("refBody");
  var search = document.getElementById("refSearch");
  var yearSel = document.getElementById("refYear");
  var chipsBox = document.getElementById("refFields");
  var countEl = document.getElementById("refCount");
  var emptyEl = document.getElementById("refEmpty");
  var activeField = "";
  var moreBtn = document.getElementById("refMore");
  var expanded = false;
  var MOBILE_LIMIT = 6;
  var mq = window.matchMedia("(max-width: 640px)");
  moreBtn.addEventListener("click", function () { expanded = true; render(); });
  if (mq.addEventListener) mq.addEventListener("change", render);

  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }

  uniq(data.map(function (d) { return d.year; })).sort().forEach(function (y) {
    var o = document.createElement("option"); o.value = y; o.textContent = y; yearSel.appendChild(o);
  });

  var fields = ["Semua"].concat(uniq(data.map(function (d) { return d.field; })));
  fields.forEach(function (f) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (f === "Semua" ? " active" : "");
    var n = f === "Semua" ? data.length : data.filter(function (d) { return d.field === f; }).length;
    b.innerHTML = f + ' <span>' + n + "</span>";
    b.addEventListener("click", function () {
      activeField = f === "Semua" ? "" : f;
      chipsBox.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      b.classList.add("active");
      render();
    });
    chipsBox.appendChild(b);
  });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render() {
    var q = search.value.trim().toLowerCase();
    var y = yearSel.value;
    var rows = data.filter(function (d) {
      if (activeField && d.field !== activeField) return false;
      if (y && String(d.year) !== y) return false;
      if (q) {
        var hay = [d.year, d.name, d.field, d.loc, d.app, d.pump].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var total = rows.length;
    var limited = mq.matches && !expanded && total > MOBILE_LIMIT;
    if (limited) rows = rows.slice(0, MOBILE_LIMIT);
    moreBtn.hidden = !limited;
    moreBtn.textContent = "Tampilkan semua (" + total + " proyek)";
    body.innerHTML = rows.map(function (d) {
      return "<tr>" +
        '<td data-label="No">' + d.no + "</td>" +
        '<td data-label="Tahun">' + d.year + "</td>" +
        '<td data-label="Proyek" class="td-name">' + esc(d.name) + "</td>" +
        '<td data-label="Bidang"><span class="field-badge f-' + esc(d.field.toLowerCase()) + '">' + esc(d.field) + "</span></td>" +
        '<td data-label="Lokasi">' + esc(d.loc) + "</td>" +
        '<td data-label="Aplikasi">' + esc(d.app) + "</td>" +
        '<td data-label="Pompa">' + esc(d.pump) + "</td>" +
        "</tr>";
    }).join("");
    countEl.textContent = total === data.length
      ? data.length + " proyek (2017–2024)"
      : "Menampilkan " + total + " dari " + data.length + " proyek";
    emptyEl.hidden = total !== 0;
  }
  search.addEventListener("input", render);
  yearSel.addEventListener("change", render);
  render();

  document.getElementById("year").textContent = new Date().getFullYear();
})();
