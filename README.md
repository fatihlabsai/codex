# Codex

Bu depo, [OpenAI Codex CLI](https://github.com/openai/codex) ve **gpt-6-astra** modeliyle üretilen tarayıcı projelerini tek yerde toplar. Her proje kendi klasöründe durur; yeni çalışmalar da buraya ayrı klasörler olarak eklenecektir.

## Projeler

| Proje | Klasör | Kısa açıklama | Canlı demo |
| --- | --- | --- | --- |
| **Astra City** | [`astra-city/`](./astra-city/) | Prosedürel, düşük poligonlu yaşayan bir şehir: trafik, gün–gece döngüsü, sürülebilir arabalar ve canlı minimap. | [aç](https://fatihlabsai.github.io/codex/astra-city/) |
| **Yenimahalle 3D** | [`yenimahalle-3d/`](./yenimahalle-3d/) | Bakırköy Yenimahalle’nin OpenStreetMap verilerinden üretilmiş etkileşimli 3D mahalle modeli. | [aç](https://fatihlabsai.github.io/codex/yenimahalle-3d/) |
| **Simit Tezgâhı** | [`astra-simit-tezgahi/`](./astra-simit-tezgahi/) | Eminönü rıhtımında, simit arabasının arkasından oynanan 3D tarayıcı oyunu. | [oyna](https://fatihlabsai.github.io/codex/astra-simit-tezgahi/) |

Ana sayfa: [https://fatihlabsai.github.io/codex/](https://fatihlabsai.github.io/codex/)

Yeni bir Codex / Astra projesi bittiğinde buraya kendi klasörüyle eklenir.

## Veri ve atıf

**Yenimahalle 3D** harita verisi **© OpenStreetMap katkıda bulunanları**dır ve [Open Database License (ODbL 1.0)](https://www.openstreetmap.org/copyright) kapsamında sunulur. Google Maps veya Street View verisi kullanılmamıştır.

## Teknik

Projeler derleme adımı olmadan, statik dosyalar olarak çalışır. Three.js, jsDelivr CDN üzerinden yüklenir. Bu deponun GitHub Pages kaynağı `main` dalının köküdür.
