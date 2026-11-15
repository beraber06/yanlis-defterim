# Yanlış Defterim

Test yanlışlarını kaydeden, aralıklı tekrarla yeniden soran ve PDF test hazırlayan,
telefona kurulan ve internetsiz çalışan yanlış defteri.

**Uygulama:** https://beraber06.github.io/yanlis-defterim/

**Android kurulum dosyası (APK):** https://github.com/beraber06/yanlis-defterim/releases/latest/download/yanlis-defterim.apk

Kurulum ve kullanım: [KURULUM.txt](KURULUM.txt)

Sorular, fotoğraflar ve yapay zekâ anahtarı yalnızca telefonda saklanır; bu depoda yalnızca programın kodu vardır.

## Klasörler

- `docs/` yayınlanan site (GitHub Pages bu klasörü sunar). `docs/index.html` elle düzenlenmez, `src/build.py` üretir.
- `src/` kaynaklar. `python3 src/build.py` kaynakları birleştirip `docs/index.html` dosyasını yazar.
- `tests/` tarayıcı testleri (Python + Playwright). Örnek: `python3 tests/test_v2.py`
- `android/` APK kabuğu (Trusted Web Activity): siteyi Chrome ile tam ekran açar. `android/` ya da `.github/workflows/apk.yml` değişince GitHub paketi yeniden derler ve `apk` sürümüne yükler. Her derleme yeni bir imza anahtarı kullanır; yeniden derlenen APK eskisinin üzerine kurulamaz (önce eskisi kaldırılır) ve adres çubuğunu gizleyen doğrulama dosyasındaki imza da güncellenmelidir.

## Yeni sürüm

1. `src/` içinde değişikliği yap; `src/core.js` içindeki `APP_VERSION` ve `docs/sw.js` içindeki `CACHE` adını artır.
2. `python3 src/build.py`
3. Testleri çalıştır, `main` dalına gönder. Site birkaç dakika içinde güncellenir.
