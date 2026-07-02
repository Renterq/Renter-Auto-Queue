# Renter Auto Queue

Bir web sayfasındaki belirli bir butona (varsayılan **"Join Queue"**) sizin yerinize otomatik ve hızlı şekilde tıklayan, Discord temalı bir Firefox eklentisi. Araç çubuğundaki simgeye **tek tıkla** açılır, hemen çalışmaya başlar ve başka sekmeye geçseniz bile **arka planda çalışmaya devam eder**.

---

## ✨ Özellikler

- **Tek tık başlatma** — Araç çubuğu simgesine bastığınız anda panel açılır ve otomatik başlar. Ayrıca "Başlat"a basmanıza gerek yok.
- **Sadece o sekmede** — Panel her sayfada kendiliğinden açılmaz; yalnızca simgeye bastığınız sekmede görünür.
- **Arka planda çalışır** — Başka sekmeye geçseniz bile o sekmede tıklamayı sürdürür (tarayıcının arka plan kısıtlamasını aşar).
- **Yapılandırılabilir hedef** — Tıklanacak buton metnini kutudan değiştirebilirsiniz. Yazdığınız metin hatırlanır.
- **Discord tarzı arayüz** — Koyu tema, blurple vurgular, canlı durum göstergesi ve toplam tıklama sayacı.
- **Sürüklenebilir panel** — Paneli istediğiniz yere taşıyabilirsiniz.

---

## 📦 Kurulum

### Yöntem 1 — Geçici yükleme (test için, en hızlı)

> Not: Bu yöntemde eklenti Firefox'u kapatınca kaldırılır. Her açılışta tekrar yüklemeniz gerekir.

1. Bu depoyu indirin (**Code → Download ZIP**) ve bir klasöre çıkarın.
2. Firefox'ta adres çubuğuna şunu yazın:
   ```
   about:debugging#/runtime/this-firefox
   ```
3. **Load Temporary Add-on…** (Geçici Eklenti Yükle) düğmesine basın.
4. Çıkardığınız klasördeki **`manifest.json`** dosyasını seçin.

Araç çubuğunda eklenti simgesi belirir.

### Yöntem 2 — Kalıcı kurulum (imzalı .xpi)

Firefox imzasız eklentileri kalıcı yüklemez. Kalıcı kullanmak için iki seçenek var:

- **AMO üzerinden imzalatma:** Paketi [addons.mozilla.org](https://addons.mozilla.org) Developer Hub'a **"On your own" (unlisted)** olarak yükleyin, imzalı `.xpi`'yi indirin ve `about:addons → dişli → Install Add-on From File` ile kurun.
- **Developer/Nightly sürümü:** Firefox Developer Edition veya Nightly'de `about:config → xpinstall.signatures.required → false` yapıp `.xpi`'yi doğrudan kurun.

---

## 🚀 Kullanım

1. Kullanmak istediğiniz web sayfasını açın.
2. Araç çubuğundaki **Queue** simgesine tıklayın → panel açılır ve **otomatik başlar**.
3. Farklı bir butonu hedeflemek istiyorsanız, paneldeki **"Hedef Buton Metni"** kutusuna o butonun üzerindeki yazıyı girin (örn. `Join Queue`).
4. Durdurmak için **Durdur** düğmesine basın veya paneli **×** ile kapatın.
5. Simgeye tekrar basınca panel gizlenir/görünür; çalışma bu sırada devam eder.

> İpucu: Hedef metni bir kez yazdığınızda kaydedilir, sonraki açılışlarda otomatik olarak o metinle başlar.

---

## 🔒 Gizlilik

Bu eklenti **hiçbir kişisel veri toplamaz veya dışarıya göndermez**. Yalnızca belirlediğiniz hedef metni tarayıcınızda **yerel olarak** (`storage.local`) saklar. Manifest'te bu durum `data_collection_permissions: { required: ["none"] }` ile beyan edilmiştir.

---

## 🗂️ Proje yapısı

```
queue-plugin/
├── manifest.json     # Eklenti tanımı (MV2, browser_action, izinler)
├── background.js     # Simgeye basınca content.js'i aktif sekmeye enjekte eder
├── content.js        # Panel arayüzü + otomatik tıklama mantığı
├── icons/
│   ├── icon48.png
│   └── icon96.png
└── README.md
```

---

## ⚙️ Nasıl çalışır (teknik)

- `background.js`, araç çubuğu butonunun `onClicked` olayını dinler ve `tabs.executeScript` ile `content.js`'i **sadece aktif sekmeye** enjekte eder (`activeTab` izniyle).
- `content.js`, sayfaya sürüklenebilir bir panel ekler, hedef metne uyan butonu bulur ve kısa aralıklarla tıklar. Tıklama; `click()` yanında `mouse`, `pointer` ve `touch` olaylarını da tetikleyerek farklı sitelerde uyumlu çalışmayı hedefler.
- Arka plan sekmelerde tarayıcının zamanlayıcı kısıtlamasını azaltmak için sessiz bir `AudioContext` osilatörü ve mümkünse `wakeLock` kullanılır; ayrıca DOM değişimlerini yakalamak için bir `MutationObserver` çalışır.

---

## ⚠️ Notlar / Sınırlamalar

- `about:`, eklenti mağazası gibi korumalı sayfalarda Firefox script enjeksiyonuna izin vermez; normal web sayfalarında çalışır.
- Hedef eşleştirmesi butonun **birebir metnine** göre yapılır (boşluklar kırpılır). Buton metni ikon/başka öğe içeriyorsa eşleşmeyebilir.
- Otomatik tıklama araçlarının bazı site veya oyunların kullanım şartlarına aykırı olabileceğini unutmayın; kullanım sorumluluğu size aittir.


