# Akış — Senaryodan ekrana

YouTube Shorts içerik üreticileri için Türkçe senaryo, altyazı ve prompter aracı. `index.html` dosyasını tarayıcıda açın; kurulum, internet, sunucu veya harici kütüphane gerekmez.

- Senaryonuzu yapıştırın veya **Örnek Metin** ile başlayın. Kelime, karakter ve tahmini süre anlık hesaplanır. Konuşma hızı 1–4,5 kelime/sn arasında ayarlanır.
- 50–60 saniyede yaklaşma uyarısı, 60 saniye üzerinde hedef aşımı uyarısı gösterilir. 60 saniye bu aracın kısa video hedefidir.
- Satır uzunluğunu ayarlayın; en fazla iki satırlı altyazıları önizleyin. **SRT İndir** UTF-8 dosya indirir; **Kopyala** SRT içeriğini panoya alır.
- Altyazı süreleri kelime sayısına göre, en az 0,8 saniye hesaplanır; bu nedenle altyazı toplamı konuşma tahmininden uzun olabilir. Sınırı aşan tek kelimeler bölünmez. Zamanlama ses analizi değil, tahmindir.
- **Prompter'ı Aç** ile okuyun. Başlat/duraklat için metne dokunun veya Boşluk tuşunu kullanın; Esc ile çıkın. Hız, yazı boyutu, aynalama ve konuşma süresine otomatik eşleme mevcuttur. Otomatik eşleme kapalıyken kaydırma hızı elle ayarlanır. Oynatma sırasında kontroller gizlenir; hareket veya dokunmayla görünür.
- Tam ekran desteklenmiyorsa prompter tarayıcı alanını kullanır. Açık/koyu tema, metin ve ayarlar bu tarayıcının localStorage alanında saklanır. Tarayıcı depolamayı engellerse yalnızca mevcut oturumda kalır.

Mobil ve masaüstü ekranlarına uyumludur. Tüm CSS ve JavaScript `index.html` içindedir; hiçbir veri dışarı gönderilmez.
