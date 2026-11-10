# Simit Tezgâhı 3D — Eminönü'nde bir gün

Tarayıcıda oynanan, gerçek zamanlı **3D simitçi oyunu**. Eminönü rıhtımında kırmızı simit arabasının **arkasında**, satıcının gözünden (birinci şahıs) oynarsın. Sipariş al, tepsiyi hazırla, para üstünü say, martıyla kediye simit kaptırma.

▶️ **Oyna:** https://fatihlabsai.github.io/astra-simit-tezgahi/

Kurulum yok, tamamen tarayıcıda çalışır (Three.js, WebGL). Masaüstü tarayıcı önerilir.

## Görsel tarz
- **Fotoğraf ya da hazır 2D görsel yok.** Bütün sahne kodla üretiliyor: prosedürel geometri, PBR (MeshStandard/Physical) malzemeler ve canvas ile üretilen dokular (arnavut kaldırımı, ahşap, susam, etiketler, tebeşir fiyat tahtası).
- **Simit arabası:** cam vitrinde simit piramidi, pirinç çaydanlık, ince belli çay bardakları, su şişeleri, ayran, açma, poğaça, kumru ve peynir. Metal servis tepsisi ve açılan kasa da arabanın üstünde.
- **İstanbul arka planı:**
  - Dalga shader'lı Haliç/Boğaz suyu, karşıdan karşıya geçen Şehir Hatları vapuru ve martılar.
  - Galata Kulesi, kubbeli ve minareli camiler, evlerle kaplı tepeler.
  - Sokak lambaları, banklar ve babalar.
- **Gün döngüsü:** güneş 07:00'den 20:00'e hareket eder. Sabah ılık, öğle parlak, gün batımı turuncu, akşam mavi olur; akşam lambalar ve pencereler yanar.
- **Müşteriler:** düşük poligonlu, stilize-gerçekçi 3D insanlar. Kıyafet, saç ve aksesuarları farklıdır (başörtüsü, evrak çantası, sırt çantası, fotoğraf makinesi, olta, gazete). Yürüme, sıraya girme, el sallama, kızma ve ödeme animasyonları var.
- **3D hırsızlar:** kedi Sarı ve martı.

## Kontroller
| Kontrol | İşlev |
|---|---|
| Fare hareketi | Etrafa bak (sınırlı FPS bakışı) |
| Tıkla | 3D ürünü al (tepsiye uçar) / kedi-martıyı kov / arayüz |
| 1–8 | Simit, Çay, Su, Açma, Poğaça, Kumru, Ayran, Peynir |
| Enter | Siparişi ver / para üstünü ver |
| Backspace | Tepsideki son ürünü geri koy |
| Boşluk | Kediyi veya martıyı kov |
| P | Duraklat |
| M | Ses aç/kapat |

Para üstü, sağ alttaki para çekmecesinden (1, 5, 10, 20, 50, 100, 200 ₺) sayılarak verilir.

## Oynanış
- Müşteri tezgâha gelir. Başının üstünde konuşma balonu ve sabır çubuğu, solda da sipariş fişi çıkar.
- Ürünleri tepsiye koyup **Ver**'e basarsın. Müşteri nakit, bozuk para veya kartla öder; turist bazen avro uzatır. Para üstünü doğru verirsen bahşiş ve itibar kazanırsın.
- **Doğru satışta:** para sesi, uçan "+₺" yazıları, parıltılar ve kamera sarsıntısı.
- **Yanlış siparişte:** müşteri kafa sallar ve itibar düşer.
- Sabah ve akşam yoğunluk olur. Simit stoğu sınırlıdır ("Fırından taze simit" ile yenilenir).
- Gün sonunda özet ekranı ve geliştirme dükkânı açılır. İlerleme localStorage'a kaydedilir.
- Kumru ve peynir başta kilitlidir, dükkândan açılır.

## Müşteriler
| Tip | Özellik |
|---|---|
| Üniversiteli | Bütçesi kısıtlı, öğrenci indirimi ister |
| Liseli | Aceleci, bozuk parayla öder |
| İş insanı | Çok sabırsız, kart ya da 200 ₺, hızlı servise iyi bahşiş |
| Teyze | Sabırlı, dua eder, bozuklukları tek tek sayar |
| Turist | İngilizce konuşur, bazen avro uzatır, cömert bahşiş |
| Balıkçı amca | Sabahçı, çay-simit, balık hikâyeleri |
| Emekli amca | Huysuz, fiyatlardan yakınır, tavşan kanı çay ister |
| Taksici | Aceleci ve geveze |
| Kedi Sarı 🐈 | Peynir veya kumruya göz diker. Kov ya da besle (karma) |
| Martı 🐦 | Simit vitrinine dalar. Tıkla ya da Boşluk |

## Astra'nın Yorumu
GPT-6-Astra'nın oyuna kendi kattığı İstanbul dokunuşları:
- **Askıdan kahvaltı:** Askıya bıraktığın simit, simit isteyen bir üniversiteliye otomatik ikram edilir ve mahalle bağı artar.
- **Son düdüğün çayları:** Gün içinde vapur tayfası 18 saniyelik bir çağrıyla 3 çay ister. Yetiştirirsen bahşiş ve mahalle bağı kazanırsın.
- **Gazete kapanır, sohbet açılır:** Öğlen bir çay ikram edip sohbete katılırsan, sıradaki herkesin sabrı 15 saniye tazelenir.
- **İyiliğin akşam hesabı:** Askı, indirim ve kediyi besleme gibi iyilikler kalıcı bir mahalle bağı oluşturur. Akşam komşular buna göre destek bırakır (en fazla 80 ₺). Mahalle defteri son 5 günü hatırlar.
- **Dört dörtlük servis:** Art arda 4 doğru hesap, iskele esnafından 10 ₺ çay parası getirir.

## Teknik
- Three.js r170 (jsDelivr CDN üzerinden import map). Derleme adımı yok, statik dosyalar.
- Dosyalar:
  - `js/scene.js`: renderer, ışık, gökyüzü, kamera, giriş uçuşu
  - `js/cart.js`: araba, ürünler, tepsi
  - `js/city.js`: İstanbul
  - `js/people.js`: müşteriler ve hayvanlar
  - `js/game.js`: kurallar
  - `js/ui.js`: arayüz
  - `js/audio.js`: Web Audio sesleri
- Test kancası: `window.__game` (`startDay`, `spawnCustomer`, `serveExact`, `simulate`, `setTime`…).

## Emeği geçenler
- **Kod:** GPT-6-Astra (OpenAI Codex CLI üzerinden)
- **3D:** Tamamı kodla üretilmiştir; harici model, fotoğraf veya doku kullanılmamıştır. Kütüphane: [three.js](https://threejs.org) (MIT).
