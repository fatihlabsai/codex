# YouTube başlık önizleyici

`index.html` dosyasını tarayıcıda açın. Türkçe, çevrimdışı çalışır; sunucu veya bağımlılık gerektirmez. GitHub Pages ile de kullanılabilir. Başlık, açıklama ve virgülle ayrılan etiketler yerel tarayıcı depolamasında saklanır.

Resmî sınırlar: başlık **100**, açıklama **5.000** karakter ([YouTube Help](https://support.google.com/youtube/answer/57407), [düzenleme](https://support.google.com/youtube/answer/57404), [açıklamalar](https://support.google.com/youtube/answer/12948449)); etiketler toplam **500** karakter ([YouTube Data API](https://developers.google.com/youtube/v3/docs/videos)). Etiketler arasındaki virgüller ve boşluk içeren her etiket için iki örtük tırnak sayılır: `Foo-Baz` = 7, `Foo Baz` = 9. Etiketlerin kenar boşlukları temizlenir, boş öğeler atlanır. Sayaçlar boşluklar dahil Unicode kod noktalarını sayar; limit aşımında metin kesilmez. Başlık ve açıklamadaki `<` ve `>` için uyarı gösterilir.

Mobil ve masaüstü kesilmeleri CSS satır kırpmasına dayalı yaklaşık yerleşim önizlemeleridir; **resmî görünür karakter sayıları değildir**. Genişlik, yazı tipi ve harfler sonucu değiştirir. “Daha fazla” yalnızca ilgili açıklama önizlemesini açar. Örnek başlık, sınır aşımını göstermek için 100 karakterden uzundur.
