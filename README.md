# Simit Tezgâhı

Eminönü kıyısında, satıcının gözünden bir İstanbul günü. Fotogerçekçi müşteriler, sıcak çay, simit kokusu ve fırsat kollayan martılar eşliğinde tezgâhını işlet.

**Oyna:** https://fatihlabsai.github.io/astra-simit-tezgahi/

Tamamen tarayıcıda çalışır; kurulum, derleme veya harici JavaScript kütüphanesi gerekmez. `index.html` dosyasını modern bir tarayıcıda açmak yeterlidir. `assets/` klasörü HTML dosyasının yanında bulunmalıdır. İnternet bağlantısı gerektiren yazı tipi veya ses kaynağı kullanılmaz.

## Nasıl oynanır?

1. Görseller yüklendikten sonra **Tezgâhı Aç** düğmesine bas. Sesler ilk etkileşimle başlar.
2. Müşterinin fişine bakıp tezgahtaki ürünlere dokun. Tepsideki bir ürüne dokunmak onu geri koyar.
3. **Ver** ile tam siparişi sun. Yanlış siparişte ürünlerin kaybolmaz; fişi kontrol edip düzelt.
4. Nakit ödemede alınan tutarı ve hesabı karşılaştır, çekmeceden para üstünü hazırla ve **Üstünü ver** düğmesine bas. Tam ödemede sıfır lira üstünü onayla. Eksik üstü tamamlayabilirsin; fazla verdiğin para kasandan çıkar ve itibarı azaltır. Kart ödemesi anında tamamlanır.
5. Müşterinin sabrını, stokları ve tezgâha yaklaşan hayvanları izle. Fırın siparişi 100 ₺ karşılığında 9 saniyede 15 simit getirir. Çay 6 saniyede bir dolar; diğer stoklar yeni gün yenilenir.
6. Gün 07.00–20.00 arasında yaklaşık 210 saniye sürer. Kepenk kapanınca bekleyenler ayrılmış sayılır. Gün sonu hesabından sonra kazancını tezgâh geliştirmelerine yatır.

Başlangıç kasası 300 ₺. Yeni gün kasan 100 ₺ altındaysa fırıncı komşu 100 ₺ destek verir. Oyun bir ekonomik simülasyondan çok servis, hesap ve mahalle ilişkileri oyunudur; günlük başlangıç stokları ücretsiz yenilenir. Fiyatlar oyun dengesi için seçilmiştir, güncel piyasa araştırması değildir.

Başlangıç ekranındaki **Rahat hesap** seçeneği para üstünü gösterir. Normal oyunda hesap sana aittir; hesap makinesi yükseltmesi aynı kolaylığı kalıcı açar.

| Kontrol | İşlev |
|---|---|
| Fare / dokunma | Ürün ekle, tepsiden çıkar, para üstü say |
| 1–8 | Simit, çay, su, açma, poğaça, kumru, ayran, peynir |
| Enter | Siparişi ver / ödeme aşamasında para üstünü ver |
| Backspace | Tepsideki son ürünü geri koy |
| Boşluk | Tezgâhtaki kedi veya martıyı uzaklaştır |
| P | Duraklat / devam et |
| M | Sesi aç / kapat |

Sekme arka plana geçince oyun otomatik duraklar. Mobilde ürünler iki sıra halinde, servis ve çekmece alt alta görünür. Hareket azaltma tercihi CSS animasyonlarında dikkate alınır.

## Tezgâhtaki fiyatlar

| Ürün | Fiyat |
|---|---:|
| Simit | 20 ₺ |
| Çay | 15 ₺ |
| Su | 10 ₺ |
| Açma | 25 ₺ |
| Poğaça | 25 ₺ |
| Kumru | 90 ₺ |
| Ayran | 20 ₺ |
| Peynir | 15 ₺ |

Kumru ve peynir, ikinci günün yatırım ekranından alınan donanımla satışa açılır. Diğer geliştirmeler: geniş tepsi, çift demlik, para üstü hesap makinesi, sabır artıran tente, özgün ezgi çalan radyo, kedi mama kabı ve bahşiş artıran cilalı tezgâh.

## Müşteriler

Her insan tipinin üçer karşılama, memnuniyet, kızgınlık ve ayrılış repliği vardır. Sabah öğrenciler ve işe gidenler, öğlen daha sakin müdavimler, akşam dönüş kalabalığı gelir. Öndeki müşterinin arkasında iki kişi bekleyebilir.

| Müşteri | Sipariş / davranış |
|---|---|
| Üniversiteli | Ucuz kahvaltı; isteğe bağlı %20 öğrenci indirimi sabrını ve mahalle bağını artırır. |
| Liseli | Simit ve ayran; bozuk para, kısa sabır. |
| İş insanı | Toplu kahvaltı; kart veya büyük banknot, hızlı servise yüksek bahşiş. |
| Teyze | Sabırlı, bereket duası; bozukluklarını 3,5 saniyede sayar. Bu sürede sabrı azalmaz. |
| Turist | İngilizce konuşur; cömert bahşiş, bazen avro uzatır. TL isteyince ödemeyi TL yapar. |
| Balıkçı amca | Sabah çayı ve simidi; sabırlı, balık hikâyeleri anlatır. |
| Emekli amca | Demli çay, gazete ve fiyat sitemleri. |
| Taksici | Kumru açıldıktan sonra kumrulu siparişler; aceleci, konuşkan. |
| Kedi | 9 saniyede peynir / kumru çalmaya çalışır; bunlar açılmadıysa simide yönelir. Kovabilir veya lokma paylaşabilirsin. Mama kabı hırsızlığı önler. |
| Martı | 5 saniyede simit kapar; dokun veya Boşluk ile uzaklaştır. |

## Astra'nın Yorumu

- **Askıdan kahvaltıya:** Askıya bıraktığın simit stoktan düşer. Simit isteyen bir üniversiteli geldiğinde askı otomatik kullanılır; hesabından 20 ₺ düşülür ve mahalle bağı artar. Öğrenci indirimi bununla birlikte uygulanabilir.
- **Son düdüğün çayları:** Günün ilk bölümünde vapur tayfası 18 saniyelik bir çağrı yapar. Stoktan üç çayı tek dokunuşla yetiştir: 45 ₺ satış, 15 ₺ bahşiş ve iki mahalle bağı kazan. Vapur kaçarsa ceza yok; fırsat geçer.
- **Gazete kapanır, sohbet açılır:** Öğlen eski bir İstanbul fotoğrafı gündeme gelir. 22 saniye içinde bir çay ayırıp sohbete katılırsan hem öndeki müşterinin hem sıradakilerin sabrı 15 saniye tazelenir, mahalle bağı iki artar.
- **İyiliğin akşam hesabı:** Askı, indirim, kediyle paylaşım ve mahalle olayları kalıcı bir mahalle bağı oluşturur. Akşam komşular bağ başına 4 ₺, en fazla 80 ₺ destek bırakır. Gün sonundaki mahalle defteri son beş günün müşteri ve iyilik sayısını hatırlar; bu ilişki sonraki günlere taşınır.
- **Dört dörtlük servis:** Arka arkaya dört doğru hesap, iskele esnafından 10 ₺ çay parası ve iki mahalle bağı getirir. Yanlış fazla para üstü veya ayrılan müşteri seriyi bozar.

## Kayıt ve teknik yapı

Gün, kasa, itibar, geliştirmeler ve mahalle defteri `localStorage` içindeki `simit-tezgahi-v1` anahtarında gün sonunda ve alışverişten sonra kaydedilir. Aktif günün ortası kaydedilmez. Tarayıcı kayıt izni vermezse oyun devam eder ve sonuç ekranında bilgi verir. Yeni başlangıç için bu sitenin tarayıcı depolamasını temizleyebilirsin.

Tek HTML içinde CSS, veri tabloları, oyun mantığı, zaman döngüsü ve Web Audio sentezi bulunur. Görseller başlamadan önce yüklenir; eksik görsel varsa başlangıç engellenerek adı bildirilir. `requestAnimationFrame` tabanlı simülasyon, sınırlanmış zaman adımı ve seyrek HUD güncellemeleri kullanılır. Sesler sentezlenir; harici ses dosyası yoktur.

Otomasyon arayüzü:

```js
window.__game.state                 // Canlı oyun durumu
window.__game.startDay()            // Görseller yüklendiyse günü başlatır
window.__game.spawnCustomer('teyze') // Ön alan doluysa kuyruğa ekler
window.__game.getCurrentOrder()     // Siparişin bir kopyası veya null
window.__game.serveExact()          // Tam sipariş + doğru üst; başarıda true
```

`serveExact()` test kolaylığı için gerekirse sipariş stoklarını tamamlar, teyzenin sayma süresini ve turistin TL konuşmasını atlar. İnsan müşteri türü anahtarları: `ogrenci`, `lise`, `isadami`, `teyze`, `turist`, `balikci`, `emekli`, `taksici`. Kararlı seçiciler: `#startBtn`, `#serveBtn`, `[data-product="simit"]`, `[data-denom="10"]`.

Doğrulama: HTML içindeki scriptler çıkarılarak `node --check` ile sözdizimi kontrol edildi. Sahte DOM üzerinde sekiz müşteri türü, tam servis, yanlış sipariş, eksik para üstünü düzeltme, mahalle olayları, duraklama, tam gün geçişi ve yeni gün başlangıcı testleri geçti. Statik DOM kimlikleri ve görsel yolları da kontrol edildi. Bu çalışma ortamında tarayıcı başlatılmadığından gerçek Chromium görsel / ses performansı ölçümü yapılmamıştır.

## Emeği geçenler

Kod: GPT-6-Astra (OpenAI Codex CLI üzerinden)

Görseller: Grok Bot ile üretilmiş fotogerçekçi AI görselleri (assets/)

Görseller değiştirilmeden kullanılmıştır. İstanbul'a, vapur emekçilerine ve bir lokmayı paylaşan bütün esnafa selam olsun.
