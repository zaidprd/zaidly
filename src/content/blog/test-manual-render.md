---
title: Uji Rendering Manual Astro (FIX)
description: Menguji apakah konten Markdown ter-render dengan benar tanpa Decap CMS.
pubDate: 2025-12-16T06:00:00.000Z
author: Zaid
image: /images/article-3.jpg
tags: ['test', 'manual', 'render']
---

# Tes Markdown Level 1

Ini adalah konten yang ditulis langsung di file `.md` tanpa melalui Decap CMS.

## Tes Markdown Level 2

Konten ini menggunakan Markdown biasa. Astro seharusnya memprosesnya dengan fungsi **`<slot />`** standar tanpa masalah.

### Daftar Fitur

* **Fitur 1:** Ini seharusnya tebal.
* *Fitur 2:* Ini seharusnya miring.
* `Kode Inline`: Ini seharusnya memiliki *background* abu-abu.

### Kode Blok

Astro harus bisa merender blok kode ini dengan benar:

```javascript
// Cek Rendering Blok Kode
const fungsiTes = (a, b) => {
  return a + b;
};
console.log(fungsiTes(5, 3));