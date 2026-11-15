/* ---------- curriculum topics ----------
   5, 6, 7. sınıf: Türkiye Yüzyılı Maarif Modeli (tymm.meb.gov.tr, 2026-2027): tema/ünite adları ve
   her temanın "İçerik Çerçevesi" başlıkları. 8. sınıf: 2026-2027'de Maarif Modeli henüz 8. sınıfta
   uygulanmadığı için önceki (LGS) programın üniteleri. Türkçe ve Paragraf: Maarif Türkçe programı
   sınıf bazında dil bilgisi listesi vermediği için test kitaplarında kullanılan konu başlıkları.
   Her giriş: [tema/ünite, [konular]]. Konu listesi boşsa temanın kendisi seçilir. */
var TR_COMMON=[
  ["Anlam bilgisi",["Sözcükte Anlam","Deyimler ve Atasözleri","Cümlede Anlam","Söz Sanatları"]],
  ["Yazım ve noktalama",["Yazım Kuralları","Noktalama İşaretleri"]],
  ["Metin ve okuma",["Metin Türleri","Görsel Okuma","Sözel Mantık"]]
];
var PARAGRAF=[
  ["Paragrafta anlam",["Paragrafın Konusu","Ana Fikir (Ana Düşünce)","Yardımcı Fikirler","Paragrafa Başlık Bulma","Paragraf Tamamlama"]],
  ["Paragrafın yapısı",["Giriş, Gelişme, Sonuç","Akışı Bozan Cümle","Paragrafı İkiye Bölme","Cümleleri Sıralama"]],
  ["Anlatım",["Anlatım Biçimleri","Düşünceyi Geliştirme Yolları","Metinleri Karşılaştırma"]],
  ["Yorum",["Görsel Okuma (Grafik, Tablo)","Sözel Mantık"]]
];
var MUFREDAT={
  5:{
    mat:[
      ["Sayılar ve Nicelikler (1)",["Çok Basamaklı Sayıları Okuma ve Yazma","Basamak Değerlerini Çözümleme","Doğal Sayılarla Dört İşlem Problemleri"]],
      ["Sayılar ve Nicelikler (2)",["Kesirlerin Farklı Gösterimleri","Kesirlerin Karşılaştırılması"]],
      ["İşlemlerle Cebirsel Düşünme",["Eşitliğin Korunumu","Değişme, Birleşme ve Dağılma Özellikleri","İşlem Önceliği","Örüntüler","Temel Aritmetik İşlemler ve Algoritma"]],
      ["Geometrik Şekiller",["Temel Geometrik Çizimler ve İnşalar","Açı Ölçme","Çokgenler","Çember"]],
      ["Geometrik Nicelikler",["Dikdörtgenin Çevre Uzunluğu ve Alanı"]],
      ["İstatistiksel Araştırma Süreci",["Kategorik Veri Dağılımları"]],
      ["Veriden Olasılığa",["Öznel Olasılık"]]
    ],
    fen:[
      ["Gökyüzündeki Komşularımız ve Biz",["Güneş","Ay","Dünya ve Gökyüzündeki Komşularımız"]],
      ["Kuvveti Tanıyalım",["Kuvvet ve Kuvvetin Ölçülmesi","Kütle ve Ağırlık İlişkisi","Sürtünme Kuvveti"]],
      ["Canlıların Yapısına Yolculuk",["Hücre ve Organelleri","Destek ve Hareket Sistemi"]],
      ["Işığın Dünyası",["Işığın Yayılması","Maddenin Işık Geçirgenliği","Tam Gölgenin Oluşumu"]],
      ["Maddenin Doğası",["Maddenin Tanecikli Yapısı","Isı ve Sıcaklık","Maddenin Hâl Değişimi","Madde ve Isı"]],
      ["Yaşamımızdaki Elektrik",["Devre Elemanları ve Devre Şeması","Ampul Parlaklığını Etkileyen Değişkenler"]],
      ["Sürdürülebilir Yaşam ve Geri Dönüşüm",["Evsel Atıklar ve Geri Dönüşüm"]]
    ],
    sos:[
      ["Birlikte Yaşamak",["Gruplar ve Roller","Kültürel Özelliklere Saygı ve Birlikte Yaşama","Yardımlaşma ve Dayanışma"]],
      ["Evimiz Dünya",["Yaşadığı İlin Göreceli Konumu","Doğal ve Beşerî Çevredeki Değişim","İlde Meydana Gelebilecek Afetler","Ülkemize Komşu Devletler"]],
      ["Ortak Mirasımız",["Ortak Miras Ögeleri","Somut ve Somut Olmayan Kültürel Miras","Anadolu'nun İlk Yerleşim Yerleri","Mezopotamya ve Anadolu Medeniyetleri"]],
      ["Yaşayan Demokrasimiz",["Demokrasi ve Cumhuriyet","Etkin Vatandaşlık","Temel Haklar ve Sorumluluklar","Sorunların Çözümünde Başvurulacak Kurumlar"]],
      ["Hayatımızdaki Ekonomi",["Kaynakların Verimli Kullanımı","Bütçe Oluşturma","İldeki Ekonomik Faaliyetler"]],
      ["Teknoloji ve Sosyal Bilimler",["Teknolojik Gelişmelerin Toplum Hayatına Etkileri","Teknolojik Ürünlerin Bilinçli Kullanımı"]]
    ],
    din:[["Allah İnancı",[]],["Namaz",[]],["Kur'an-ı Kerim",[]],["Peygamber Kıssaları",[]],["Mimarimizde Dinî Motifler",[]]],
    ing:[["School Life",[]],["Classroom Life",[]],["Personal Life",[]],["Family Life",[]],["Life in the Neighbourhood & City",[]],["Life in the World",[]],["Life in Nature",[]],["Life in the Universe & Future",[]]],
    tr:[["Dil bilgisi",["Kök ve Ekler","Yapım ve Çekim Ekleri","Eş, Zıt ve Eş Sesli Sözcükler"]]].concat(TR_COMMON)
  },
  6:{
    mat:[
      ["Sayılar ve Nicelikler (1)",["Çarpanlar ve Katlar","Bölünebilme Kuralları","Asal Sayılar ve Asal Çarpanlar"]],
      ["Sayılar ve Nicelikler (2)",["Kesirlerle İşlemler","Ondalık Gösterimleri Çözümleme","Kesir-Bölme İlişkisi","Kesir Problemleri","Uzunluk Ölçme"]],
      ["İşlemlerle Cebirsel Düşünme ve Değişimler",["Bilinmeyen Nicelikler","Örüntü","Cebirsel İfadeler ve Algoritma"]],
      ["Geometrik Şekiller",["Paralel Doğrular ve Kesenle Oluşan Açılar","Üçgenin Açıları","Dörtgenlerin Kenar, Açı ve Köşegen Özellikleri"]],
      ["Geometrik Nicelikler",["Uzunluk ve Alan Ölçme Birimleri","Paralelkenar ve Üçgenin Alanı","Çember ve Çap İlişkisi","Merkez Açı ve Yay Uzunluğu"]],
      ["İstatistiksel Araştırma Süreci",["Kategorik ve Nicel (Kesikli) Veriler"]],
      ["Veriden Olasılığa",["Deneysel Olasılık"]]
    ],
    fen:[
      ["Güneş Sistemi ve Tutulmalar",["Güneş Sistemi","Güneş ve Ay Tutulmaları"]],
      ["Kuvvetin Etkisinde Hareket",["Bileşke Kuvvet","Sabit Süratli ve Sabit Hızlı Hareket"]],
      ["Canlılarda Sistemler",["Üreme, Büyüme ve Gelişme","Denetleyici ve Düzenleyici Sistemler"]],
      ["Işığın Yansıması ve Renkler",["Işığın Yansıması","Aynalar","Işığın Soğurulması"]],
      ["Maddenin Ayırt Edici Özellikleri",["Genleşme ve Büzülme","Hâl Değişim Noktaları","Yoğunluk"]],
      ["Elektriğin İletimi ve Direnç",["Elektriğin İletimi","Elektriksel Direnç"]],
      ["Sürdürülebilir Yaşam ve Etkileşim",["Biyoçeşitlilik","İnsan ve Çevre Etkileşimi"]]
    ],
    sos:[
      ["Birlikte Yaşamak",["Zaman İçinde Değişen Gruplar ve Roller","Kültürel Bağlar ve Millî Değerler","Toplumsal Sorunlar ve Çözüm Önerileri"]],
      ["Evimiz Dünya",["Ülkemizin, Kıtaların ve Okyanusların Konumu","Doğal ve Beşerî Çevre İlişkisi","Türk Dünyasıyla Kültürel İş Birlikleri"]],
      ["Ortak Mirasımız",["İlk Türk Devletleri","İslam Medeniyetinin Katkıları","İslamiyet'in Kabulüyle Değişimler","Anadolu'nun Türkleşmesi ve İslamlaşması"]],
      ["Yaşayan Demokrasimiz",["Yönetimin Karar Alma Süreci","Temel Hak ve Sorumluluklar","Dijitalleşme ve Vatandaşlık"]],
      ["Hayatımızdaki Ekonomi",["Ülkemizin Kaynakları ve Ekonomik Faaliyetler","Ekonomik Faaliyetler ve Meslekler","Ürün, Yatırım ve Pazarlama"]],
      ["Teknoloji ve Sosyal Bilimler",["Ulaşım ve İletişim Teknolojileri","Telif ve Patent"]]
    ],
    din:[["Peygamber ve İlahi Kitap İnancı",[]],["Ramazan ve Oruç",[]],["Ahlaki Davranışlar",[]],["Peygamberliğinden Önce Hz. Muhammed",[]],["Kültürümüzdeki Dinî Motifler",[]]],
    ing:[["School Life",[]],["Classroom Life",[]],["Personal Life",[]],["Family Life",[]],["Life in the Neighbourhood & City",[]],["Life in the World & Culture",[]],["Life in Nature & Global Problems",[]],["Life in the Universe & Future",[]]],
    tr:[["Dil bilgisi",["İsimler (Adlar)","Sıfatlar (Ön Adlar)","Zamirler (Adıllar)","İsim Tamlamaları","Edat, Bağlaç, Ünlem"]]].concat(TR_COMMON)
  },
  7:{
    mat:[
      ["Sayılar ve Nicelikler (1)",["Tam Sayılar","Rasyonel Sayılar ve Gösterimleri","Rasyonel Sayıları Karşılaştırma ve Sıralama","Rasyonel Sayılarla İşlemler ve Problemler"]],
      ["Sayılar ve Nicelikler (2)",["Oran","Orantılı Durumlar","Doğru Orantı Problemleri"]],
      ["İşlemlerle Cebirsel Düşünme ve Değişimler",["Cebirsel İfadelerle İşlemler","Denklem ve Eşitsizlikler","İspat"]],
      ["Dönüşüm",["Yansıma Dönüşümü","Orta Dikme ve Açıortay İnşası"]],
      ["Geometrik Nicelikler (1)",["Cisimlerin Farklı Yönlerden Görünümleri","Dikdörtgenler Prizmasının Hacmi ve Yüzey Alanı","Hacim Ölçme Birimleri"]],
      ["Geometrik Nicelikler (2)",["Eşkenar Dörtgen ve Yamuk","Daire ve Daire Diliminin Alanı"]],
      ["Geometrik Şekiller",["Kenarortay ve İnşası","Açıortay","Yükseklik"]],
      ["İstatistiksel Araştırma Süreci",["Kategorik ve Nicel (Sürekli) Veriler"]],
      ["Veriden Olasılığa",["Teorik Olasılık"]]
    ],
    fen:[
      ["Uzay Çağı",["Türkiye ve Uzay Araştırmaları","Uzayda Neler Var?"]],
      ["Kuvvet ve Enerjiyi Keşfedelim",["Kuvvet, İş ve Enerji İlişkisi","Enerji Dönüşümleri"]],
      ["Vücudumuzdaki Sistemler",["Sindirim Sistemi","Dolaşım Sistemi","Solunum Sistemi","Boşaltım Sistemi"]],
      ["Işığın Kırılması ve Mercekler",["Işığın Kırılması","Mercekler"]],
      ["Maddenin Doğasına Yolculuk",["Maddenin Tanecikli Yapısı","Saf Maddeler","Karışımlar","Karışımların Ayrılması"]],
      ["Elektriklenme",["Elektrik Yükleri ve Elektriklenme"]],
      ["Sürdürülebilir Yaşam ve Enerji",["Besin Zinciri ve Enerji Akışı","Sürdürülebilir Yaşam"]]
    ],
    sos:[
      ["Birlikte Yaşamak",["Sosyal Hayatta İletişim","Özel Gereksinimli Bireyler ve Fırsat Eşitliği","Millî Meseleler ve Toplumun Tutumu"]],
      ["Evimiz Dünya",["Küreselleşmenin Etkileri","Bölgesel ve Küresel Sorunlarda Ülkemizin Rolü"]],
      ["Ortak Mirasımız",["Osmanlı'nın Cihan Devleti Olması","Osmanlı Devleti'nin Yenilikleri","Osmanlı Kültür ve Medeniyeti"]],
      ["Yaşayan Demokrasimiz",["Türkiye Cumhuriyeti'nin Nitelikleri","Yönetim Yapısı","Demokrasinin Gelişimi","Demokrasinin Uygulanmasındaki Sorunlar"]],
      ["Hayatımızdaki Ekonomi",["Millî Kalkınma Hamleleri","Üretim, Dağıtım ve Tüketim"]],
      ["Teknoloji ve Sosyal Bilimler",["Bilim ve Teknolojinin Geleceğe Etkisi","Sosyal Bilimlerin Çalışma Alanları","Toplumsal Problemlere Çözüm"]]
    ],
    din:[["Melek ve Ahiret İnancı",[]],["Hac, Umre ve Kurban",[]],["İslam Düşüncesinde Yorumlar",[]],["Peygamber Olarak Hz. Muhammed",[]],["Yaşayan Dünya Dinleri",[]]],
    ing:[["1. School Life & Education",["Extra-curricular Activities","Competitions & Celebrations at School","National Days & Celebrations","Simple Present Tense","Present Progressive Tense","Adverbs of Frequency","Must / Can't (Prohibition)"]],["2. Classroom Life & Learning",["Technological Tools for Learning","Learning Activities in the Classroom","Cardinal Numbers (500–1000)","Ordinal Numbers (50–100)","Simple Present vs Present Progressive","Question Tags (Simple Present / Present Progressive)","Will for Help"]],["3. Personal Life & Well-Being",["Body Parts, Illnesses & Keeping Good Health","The Place of Technology in People's Lives","Simple Past Tense (was / were)","Simple Past Tense (Regular Verbs)","Question Tags (was / were, Simple Past)"]],["4. Family Life & Home",["Family Members' Hobbies (Sports, Books, Films, Music, Cooking)","Generation Gap","Simple Past Tense (Irregular Verbs)","Question Tags (Simple Past)","Shall for Suggestions"]],["5. Life in the Neighbourhood & City and Social Life",["Public Services in the Neighbourhood & City","Life in Different Kinds of Cities","Past Progressive Tense","Question Tags (Past Progressive)"]],["6. Life in the World & Culture",["Capitals, Landmarks & Famous Places","Sports Events in Different Parts of the World","Present Perfect Tense (with for)","Question Tags (Present Perfect)"]],["7. Life in Nature",["Animals & Natural Resources","Protecting Animals & Nature","Zero Conditional","Comparatives","Superlatives"]],["8. Life in the Universe & Future",["Space Technology","Life in the Future with Robots","Be Going To (Future)","Simple Future Tense (will)","Question Tags (be going to / will)"]],["Eski program üniteleri (eski test kitapları)",["Appearance and Personality","Sports","Biographies","Wild Animals","Television","Celebrations","Dreams","Public Buildings","Environment","Planets"]]],
    tr:[["Dil bilgisi",["Fiiller (İş, Oluş, Durum)","Fiil Kipleri","Kişi Ekleri","Fiillerde Anlam Kayması","Ek Fiil","Basit, Türemiş ve Birleşik Fiiller","Zarflar (Belirteçler)","Anlatım Bozuklukları"]]].concat(TR_COMMON)
  },
  8:{
    mat:[["8. sınıf",["Çarpanlar ve Katlar","Üslü İfadeler","Kareköklü İfadeler","Veri Analizi","Basit Olayların Olma Olasılığı","Cebirsel İfadeler ve Özdeşlikler","Doğrusal Denklemler","Eşitsizlikler","Üçgenler","Eşlik ve Benzerlik","Dönüşüm Geometrisi","Geometrik Cisimler"]]],
    fen:[
      ["Mevsimler ve İklim",["Mevsimlerin Oluşumu","İklim ve Hava Hareketleri"]],
      ["DNA ve Genetik Kod",["DNA ve Genetik Kod","Kalıtım","Mutasyon ve Modifikasyon","Adaptasyon","Biyoteknoloji"]],
      ["Basınç",["Katı Basıncı","Sıvı Basıncı","Gaz Basıncı"]],
      ["Madde ve Endüstri",["Periyodik Sistem","Fiziksel ve Kimyasal Değişimler","Kimyasal Tepkimeler","Asitler ve Bazlar","Maddenin Isı ile Etkileşimi","Türkiye'de Kimya Endüstrisi"]],
      ["Basit Makineler",["Basit Makineler"]],
      ["Enerji Dönüşümleri ve Çevre Bilimi",["Besin Zinciri ve Enerji Akışı","Fotosentez ve Solunum","Madde Döngüleri ve Çevre Sorunları","Sürdürülebilir Kalkınma"]],
      ["Elektrik Yükleri ve Elektrik Enerjisi",["Elektrik Yükleri ve Elektriklenme","Elektrik Yüklü Cisimler","Elektrik Enerjisinin Dönüşümü"]]
    ],
    sos:[["Bir Kahraman Doğuyor",[]],["Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar",[]],["Millî Bir Destan: Ya İstiklal Ya Ölüm!",[]],["Atatürkçülük ve Çağdaşlaşan Türkiye",[]],["Demokratikleşme Çabaları",[]],["Atatürk Dönemi Türk Dış Politikası",[]],["Atatürk'ün Ölümü ve Sonrası",[]]],
    din:[["Kader İnancı",[]],["Zekât ve Sadaka",[]],["Din ve Hayat",[]],["Hz. Muhammed'in Örnekliği",[]],["Kur'an-ı Kerim ve Özellikleri",[]]],
    ing:[["Friendship",[]],["Teen Life",[]],["In the Kitchen",[]],["On the Phone",[]],["The Internet",[]],["Adventures",[]],["Tourism",[]],["Chores",[]],["Science",[]],["Natural Forces",[]]],
    tr:[["Dil bilgisi",["Fiilimsiler","Cümlenin Ögeleri","Fiilde Çatı","Cümle Türleri","Anlatım Bozuklukları"]]].concat(TR_COMMON)
  }
};
[5,6,7,8].forEach(function(g){MUFREDAT[g].par=PARAGRAF});
