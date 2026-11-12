# YouTube açıklama ve bölüm oluşturucu

Çevrimdışı çalışan, Türkçe ve tek dosyalık bir açıklama hazırlama aracı. `index.html` dosyasını tarayıcıda açın veya GitHub Pages üzerinde sunun; kurulum gerekmez.

Özeti, her satırda zaman ve başlık içeren bölümleri, linkleri ve etiketleri girin. İsterseniz video süresini ekleyin. Canlı açıklamayı **Kopyala** ile YouTube Studio’ya yapıştırın. **Örnek doldur** geçerli bir örnek gösterir. Girdiler tarayıcının localStorage alanında saklanır; tarayıcı buna izin vermiyorsa kalıcı kayıt yapılamaz.

[Resmî bölüm kuralları](https://support.google.com/youtube/answer/9884579?hl=tr): ilk zaman 00:00, en az üç bölüm, kesinlikle artan zaman sırası ve bölüm başına en az 10 saniye. Son bölüm yalnızca video süresi girildiğinde doğrulanır. Okunamayan satırlar uyarılır ve çıktıya alınmaz. Bölüm özelliğinin kullanılabilirliği kanal koşullarına da bağlıdır.

[Resmî açıklama sınırı](https://support.google.com/youtube/answer/57404?hl=tr) 5.000 karakterdir. Sayaç Unicode kod noktalarını (`Array.from`) sayar. Metin kesilmez; hatalı bölümler veya sınır aşımı durumunda da kopyalama mümkündür. Pano erişimi engellenirse metni elle kopyalayabilirsiniz.
