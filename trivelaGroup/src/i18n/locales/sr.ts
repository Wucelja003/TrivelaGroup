import type { Messages } from "./en";

/*
 * Srpski (latinica). Oblik je vezan za en.ts preko `Messages` — ako ovde
 * fali kljuc ili ima visak, TypeScript prijavi gresku.
 */
const sr: Messages = {
  lang: {
    label: "Jezik",
  },

  nav: {
    home: "Početna",
    whatWeDo: "Šta radimo",
    whoWeAre: "Ko smo mi",
    aboutUs: "O nama",
    gallery: "Galerija",
    getInTouch: "Kontakt",
    openMenu: "Otvori meni",
    closeMenu: "Zatvori meni",
    menu: "Meni",
    openCart: "Otvori korpu ({{n}})",
  },

  common: {
    location: "Beograd, Srbija",
    basedIn: "Sedište:",
    mute: "Isključi zvuk",
    unmute: "Uključi zvuk",
    previous: "Prethodno",
    next: "Sledeće",
    close: "Zatvori",
    clip: "Snimak",
    openClip: "Otvori: {{name}}",
    loading: "Učitavanje…",
    viewOnInstagram: "Pogledaj ovu objavu na Instagramu",
    tapToOpen: "Dodirni da otvoriš",
    carousel: "karusel",
    imageCarousel: "Karusel slika",
    prevSlide: "Prethodni slajd",
    nextSlide: "Sledeći slajd",
    showSlide: "Prikaži: {{name}}",
    slideN: "slajd {{n}}",
  },

  about: {
    hero: {
      kicker: "Osnovano 2019. — Beograd, Srbija",
      titleA: "O",
      titleB: "nama",
      lead: "Od jedne Instagram stranice do kreativne agencije koja gradi ikonične brendove sportista — ovako je sve počelo i zato se zovemo Trivela.",
    },
    origins: {
      eyebrow: "Poreklo",
      titleBefore: "Kako je Trivela Group",
      titleAccent: "počela?",
      steps: [
        "Priča o Trivela Group seže u oktobar 2019. godine, kada je jedan od osnivača počeo da kreira sportski digitalni sadržaj putem Instagram platforme.",
        "Kako je platforma rasla, rastao je i brend iza nje. Ubrzo se izdvojila kao jedan od najprepoznatljivijih sportskih medijskih brendova u Srbiji, sa posebno snažnim prisustvom među navijačima Partizana.",
        "Taj rast otvorio je vrata saradnji sa KK Partizan, RK Partizan i nizom profesionalnih fudbalera i košarkaša koji nose crno-beli dres — a zatim i partnerstvima sa sportistima beogradske Crvene zvezde.",
        "Sledeće poglavlje počelo je kada se timu pridružio grafički dizajner i projektu doneo novu kreativnu dimenziju. Ono što je počelo kao saradnja preraslo je u dugoročno partnerstvo, a nekoliko godina kasnije i u temelj kreativne agencije koja je danas poznata kao Trivela Group.",
      ],
    },
    why: {
      eyebrow: "(02) — Identitet",
      titleBefore: "Zašto",
      titleAccent: "Trivela?",
      intro:
        "Iako je Trivela Group danas afirmisano ime u Beogradu i širom Srbije, njen identitet izgrađen je oko jednostavne ideje koju dele njeni osnivači.",
      nameLabel: "Ime",
      nameBefore: "Ime",
      nameAccent: "Trivela",
      nameAfter:
        "inspirisano je jednom od najprepoznatljivijih i najspektakularnijih tehnika u fudbalu — udarcem spoljnim delom stopala, koji se vezuje za kreativnost, samopouzdanje i izuzetno umeće. Potez koji ne može svako da savlada.",
      philosophy: "Ta filozofija i danas je u srcu našeg identiteta.",
      arrowLabel: "Strelica",
      arrowBody:
        "Strelica okrenuta nagore, ugrađena u logo Trivela Group, predstavlja našu ambiciju i okrenutost budućnosti: da pomognemo talentovanim mladim sportistima da izrastu u vrhunske profesionalce i izgrade snažne lične brendove koji odjekuju na srpskom, evropskom i globalnom tržištu.",
      logoAlt: "Logo Trivela Group",
    },
    closing: {
      lineBefore: "Karijere u priče. Ličnosti u brendove.",
      lineAccent: "Sportiste u ikone.",
      cta: "Sarađuj sa nama",
    },
  },

  gallery: {
    title: "Trivela galerija",
    categories: {
      Matchdays: "Utakmice",
      Verifications: "Verifikacije",
      Reels: "Rilsovi",
      Posts: "Objave",
    },
    comingSoon: "Uskoro",
    onTheWay: "{{category}} stižu uskoro — navrati ponovo.",
  },

  drop: {
    hero: {
      titleBefore: "Nosi svoje",
      titleAccent: "boje",
      lead1: "Ekskluzivne kolekcije inspirisane sportistima.",
      lead2: "Ograničena izdanja koja potpisuje Trivela Group.",
      cta: "Napravi svoju maskicu po meri",
    },

    shop: {
      trustedEyebrow: "Veruju nam najbolji",
      trustedTitle1: "Ljudi koji su verovali",
      trustedTitle2: "našem radu",
      playerRoles: {
        basketball: "Košarkaš",
        football: "Fudbaler",
        lessortWife: "Supruga Mathiasa Lessorta",
      },
      allCases: "Sve maskice",
      // 1 proizvod · 2–4 proizvoda · 5+ proizvoda (21 proizvod, 22 proizvoda...)
      productCount_one: "{{count}} proizvod",
      productCount_few: "{{count}} proizvoda",
      productCount_other: "{{count}} proizvoda",
      sortBy: "Sortiraj po",
      collections: "Kolekcije",
      sort: {
        az: "Naziv: A – Z",
        za: "Naziv: Z – A",
        priceAsc: "Cena: od najniže",
        priceDesc: "Cena: od najviše",
      },
      addToCart: "Dodaj {{name}} u korpu",
      loadFailed: "Učitavanje proizvoda nije uspelo: {{error}}",
    },

    product: {
      notFoundTitle: "Maskica nije pronađena",
      notFoundBody: "Proizvod koji tražiš ne postoji.",
      backToShop: "Nazad u prodavnicu",
      collection: "Kolekcija {{name}}",
      description:
        "Premium tvrda maskica sa mekim, prijatnim završnim slojem. Tanka, testirana na padove i napravljena da nosi tvoje boje. Precizni otvori, kompatibilna sa bežičnim punjenjem.",
      color: "Boja",
      colors: {
        green: "Zelena",
        lightGreen: "Svetlozelena",
        purple: "Ljubičasta",
        grey: "Siva",
      },
      phoneModel: "Model tvog telefona",
      phoneModelPlaceholder: "npr. iPhone 18 Pro",
      addToCart: "Dodaj u korpu",
      added: "Dodato u korpu",
      stock: "Na stanju · Isporuka za 2–4 radna dana",
      alsoLike: "Možda će ti se svideti i",
      viewAll: "Pogledaj sve",
    },

    cart: {
      title: "Tvoja korpa",
      // 1 artikal · 2–4 artikla · 5+ artikala
      count_one: "{{count}} artikal",
      count_few: "{{count}} artikla",
      count_other: "{{count}} artikala",
      close: "Zatvori korpu",
      dialog: "Korpa",
      emptyTitle: "Korpa je prazna",
      emptyBody: "Izaberi maskicu u prodavnici i pojaviće se ovde.",
      continue: "Nastavi kupovinu",
      remove: "Ukloni {{name}}",
      decrease: "Smanji",
      increase: "Povećaj",
      subtotal: "Međuzbir",
      checkout: "Završi kupovinu",
      clear: "Isprazni korpu",
    },

    checkout: {
      eyebrow: "(01) — Porudžbina",
      title: "Skoro je tvoje.",
      lead: "Još par detalja i tvoje maskice kreću na put. Ako nešto nije u redu, javljamo se u roku od 24 sata.",
      contact: "Kontakt",
      shipping: "Dostava",
      fields: {
        firstName: "Ime",
        lastName: "Prezime",
        email: "Email",
        phone: "Broj telefona",
        address: "Adresa",
        city: "Grad",
        postal: "Poštanski broj",
      },
      errors: {
        required: "Obavezno polje",
        email: "Neispravan email",
        phone: "Neispravan broj telefona",
        postal: "Neispravan poštanski broj",
      },
      placing: "Slanje porudžbine…",
      place: "Poruči",
      terms:
        "Slanjem porudžbine prihvataš naše uslove. Ovo je demo — plaćanje se još ne obrađuje.",
      yourOrder: "Tvoja porudžbina",
      subtotal: "Međuzbir",
      shippingLabel: "Dostava",
      free: "Besplatno",
      freeOver: "Besplatna dostava preko 6.000 RSD ✓",
      total: "Ukupno",
      redirecting: "Preusmeravanje…",
      orderNumber: "Porudžbina #{{number}}",
      placedTitle: "Porudžbina je poslata.",
      thanks: "Hvala, {{name}}.",
      friend: "prijatelju",
      confirmBefore: "Uskoro ćemo poslati potvrdu na",
      confirmAfter: ". Isporuka obično traje 2–4 radna dana.",
      backHome: "Nazad na početnu",
    },

    custom: {
      eyebrow: "Napravljeno za tebe",
      titleBefore: "Napravi svoju",
      titleAccent: "maskicu po meri",
      lead: "Otpremi svoju fotografiju, izaberi telefon, reci nam gde da je pošaljemo — a mi pravimo unikatnu maskicu samo za tebe.",
      photo: "Tvoja fotografija",
      uploading: "Otpremanje…",
      clickToUpload: "Klikni da otpremiš sliku",
      removeImage: "Ukloni sliku",
      fullName: "Ime i prezime",
      email: "Email",
      phone: "Broj telefona",
      phoneModel: "Model telefona",
      address: "Adresa",
      city: "Grad",
      postal: "Poštanski broj",
      country: "Država",
      quantity: "Količina",
      idea: "Tvoja ideja (opciono)",
      placeholders: {
        fullName: "Marko Marković",
        email: "ti@email.com",
        phone: "+381 …",
        phoneModel: "npr. iPhone 15 Pro, Galaxy S24…",
        address: "Ulica i broj",
        idea: "Igrač, klub, boje, tekst — šta god želiš na njoj.",
      },
      sending: "Slanje…",
      send: "Pošalji zahtev",
      errors: {
        noImage: "Dodaj svoju fotografiju za maskicu.",
        noName: "Ime i prezime je obavezno.",
        badEmail: "Unesi ispravan email.",
        noModel: "Unesi model telefona.",
        uploadFailed: "Slika nije otpremljena — pokušaj ponovo.",
        sendFailed: "Slanje nije uspelo — pokušaj ponovo.",
      },
      successTitle: "Zahtev je primljen.",
      successBody:
        "Pregledaćemo tvoju ideju i javiti ti se mejlom u roku od 24 sata.",
    },

    journey: {
      flows: {
        custom: {
          tab: "Maskica po meri",
          eyebrow: "Tvoja slika, naša maskica",
          heading: "Kako poslati zahtev za maskicu po meri",
          sub: "Šta da upišeš, polje po polje — da prva skica odmah bude prava.",
        },
        order: {
          tab: "Gotova maskica",
          eyebrow: "Iz Drop ponude",
          heading: "Kako poručiti maskicu",
          sub: "Četiri koraka od izbora do potvrđene porudžbine.",
        },
      },
      guides: "Vodiči",
      stepOf: "Korak {{current}} od {{total}}",
      back: "Nazad",
      next: "Dalje",
      replay: "Ponovi",
      sendThis: "Pošalji ovo",
      notThis: "Ne ovo",
      steps: {
        image: {
          title: "Otpremi svoju sliku",
          meta: "Počni ovde",
          label: "Slika",
          copy: "Fotografija je cela maskica, pa od nje zavisi kako će maskica ispasti. Pošalji najveću verziju koju imaš — direktno iz galerije, ne snimak ekrana i ne nešto sačuvano sa Instagrama.",
        },
        model: {
          title: "Upiši tačan model telefona",
          meta: "Budi precizan",
          label: "Model telefona",
          copy: "Napiši ceo model, uključujući Pro ili Max. Maskica za 15 Pro ne odgovara modelu 15, a upravo otvor za kameru tu pravi problem.",
        },
        contact: {
          title: "Ostavi ime i kontakt",
          meta: "Da možemo da odgovorimo",
          label: "Kontakt",
          copy: "Ime i prezime, email koji zaista čitaš i broj telefona. Skicu ti šaljemo na email, a kurir zove na taj broj.",
        },
        address: {
          title: "Gde treba da stigne",
          meta: "Dostava",
          label: "Adresa",
          copy: "Ulica sa brojem, grad, poštanski broj i država. Stan ili sprat dodaj u napomenu ako zgrada to zahteva — upravo to spašava dostavu koja bi inače propala.",
        },
        extras: {
          title: "Koliko komada i sve ostalo",
          meta: "Opciono",
          label: "Količina i napomena",
          copy: "Navedi koliko maskica želiš, a u napomenu upiši sve što slika ne može da kaže: ime za štampu, koji deo da ostane u kadru, rok do kog ti treba.",
        },
        send: {
          title: "Pošalji i sačekaj skicu",
          meta: "Onda mi",
          label: "Posle slanja",
          copy: "Odgovaramo skicom kako će tvoja maskica izgledati. Ništa se ne štampa dok ne kažeš da ti se sviđa.",
        },
        browse: {
          title: "Otvori maskicu i upiši model",
          meta: "Počni ovde",
          label: "Iz ponude",
          copy: "Sve gotove maskice su na Drop stranici. Dodirni jednu i otvoriće se na svojoj stranici, sa cenom i kolekcijom — zatim upiši ceo model telefona, sa Pro ili Max. Pogledaj kako to izgleda ispod.",
        },
        cart: {
          title: "Dodaj je u korpu",
          meta: "Sakupi",
          label: "Korpa",
          copy: "Dodaj u korpu, pa klikni na torbu na vrhu strane — korpa izlazi sa strane. Model ostaje uz svaku maskicu, pa dve iste maskice za dva različita telefona ostaju odvojene.",
        },
        details: {
          title: "Popuni podatke za dostavu",
          meta: "Porudžbina",
          label: "Porudžbina",
          copy: "Ime, email, telefon, adresa, grad i poštanski broj. Dostava je besplatna preko 6.000 RSD, a ispod toga košta 590 RSD — ukupan iznos se ažurira dok popunjavaš.",
        },
        placed: {
          title: "Pošalji porudžbinu",
          meta: "Gotovo",
          label: "Potvrda",
          copy: "Broj porudžbine dobijaš na ekranu i mejlom. Sačuvaj ga — po njemu te pronalazimo ako nam pišeš.",
        },
      },
      panels: {
        image: {
          caption: "Maskice koje smo odštampali sa fotografija koje su kupci poslali.",
          good: [
            "Originalna fotografija, direktno iz galerije",
            "Lice ili motiv ceo u kadru, ne odsečen na ivici",
            "Dobro svetlo — što deluje tamno na ekranu, tamno se i odštampa",
          ],
          bad: [
            "Snimak ekrana fotografije",
            "Slika sačuvana sa Instagrama ili WhatsApp-a — oba je smanjuju",
            "Slika koja je već mutna kad je uvećaš",
          ],
          note: "Nisi siguran da li je tvoja dovoljno velika? Pošalji je svejedno — proverimo je i javimo ti pre nego što bilo šta odštampamo.",
        },
        model: {
          label: "Model telefona",
          hint: "Upiši ceo naziv — Pro i Max su različite maskice.",
          bad: ["iPhone", "onaj novi", "18 pro valjda"],
          note: "Nisi siguran da li radimo tvoj model? Napiši ga svejedno — javljamo ti pre nego što bilo šta odštampamo.",
        },
        contact: {
          name: "Ime i prezime",
          email: "Email",
          emailHint: "Skica stiže ovde, pa upiši onaj koji proveravaš.",
          phone: "Telefon",
          phoneHint: "Kurir zove ovaj broj.",
        },
        address: {
          address: "Adresa",
          city: "Grad",
          postal: "Poštanski broj",
          country: "Država",
          countryValue: "Srbija",
          note: "Broj stana, sprat ili interfon koji ne radi — napiši to u napomenu u sledećem koraku. Upravo to sprečava da nam se pošiljka vrati.",
        },
        extras: {
          quantity: "Količina",
          quantityHint: "Ista slika na dve maskice, ili dva modela.",
          notes: "Napomena",
          notesValue:
            "„Druga maskica je za Samsung S24. Molim vas da oboje budemo u kadru i da ispod slike odštampate ime MARKO. Treba mi do 20. ako je moguće.”",
          note: "Sve što slika ne može da kaže ide ovde — ime za štampu, koji deo da ostane, datum do kog ti treba.",
        },
        send: {
          list: [
            "Tvoj zahtev stiže kod nas, zajedno sa slikom",
            "Javljamo ti se mejlom sa skicom tvoje maskice",
            "Ti kažeš da — ili tražiš izmenu, koliko god puta treba",
            "Tek tada je štampamo i šaljemo",
          ],
          cta: "Pošalji zahtev",
        },
        browse: {
          fieldEmpty: "Prazno polje",
          modelWritten: "Model upisan",
          note: "Dugme je neaktivno dok polje za model ne sadrži nešto — maskica se seče za jedan model, a otvor za kameru je ono što inače pođe naopako. Filtriraj po kolekciji ili sortiraj po ceni da brže nađeš svoju.",
          goToAll: "Idi na sve maskice",
        },
        cart: {
          note: "Isti dizajn, dva različita telefona — korpa ih drži odvojeno jer model ide uz svaku maskicu. Cena na maskici je ono što plaćaš za nju; dostava se računa posebno na kraju.",
        },
        details: {
          firstName: "Ime",
          lastName: "Prezime",
          email: "Email",
          phone: "Telefon",
          address: "Adresa",
          city: "Grad",
          postal: "Poštanski broj",
          freeNote: "Besplatna dostava preko 6.000 RSD — ispod toga 590 RSD.",
        },
        placed: {
          title: "Porudžbina je poslata",
          numberIs: "Broj tvoje porudžbine je",
          note: "Isti broj stiže i na tvoj email. Sačuvaj ga — po njemu pronalazimo tvoju porudžbinu ako nam pišeš.",
        },
      },
      shopDemo: {
        captionProduct:
          "To je stranica same maskice — cena, kolekcija i polje za model.",
        captionGrid: "Gledaj: ponuda, jedna maskica i gde te vodi.",
      },
      cartDemo: {
        captionDone:
          "Završi kupovinu te vodi na sledeći korak — podatke za dostavu.",
        captionOpen:
          "Korpa izlazi sa desne strane — model ostaje uz maskicu.",
        captionIdle: "Gledaj: Dodaj u korpu, pa torba na vrhu.",
      },
    },
  },

  /* Business se obraća kompanijama — formalno "Vi" (veliko V). */
  business: {
    hero: {
      title1: "Izvan igre",
      title2: "Stvoreno za biznis.",
      lead: "Isto pripovedanje koje je sportiste pretvorilo u ikone — sada radi za kompanije, osnivače i brendove daleko izvan sporta.",
      ctaPrimary: "Započnite projekat",
      ctaSecondary: "Pogledajte naše klijente",
    },
    beyond: {
      eyebrow: "(01) — Izvan sporta",
      title: "Ne samo sportisti.",
      lead: "Godinama smo sportiste činili nezaboravnim. Isto to umeće — marketing, PR i brend konsalting — sada pokreće kompanije u svim industrijama.",
      pillars: {
        social: {
          title: "Društvene mreže",
          copy: "Kompletno upravljanje digitalnim prisustvom Vašeg brenda: od svakodnevnog vođenja društvenih mreža do premium sadržaja koji odražava kvalitet i identitet Vašeg poslovanja. Gradimo dosledan onlajn imidž, oslonjen na jasnu strategiju komunikacije, sadržaja i oglašavanja.",
        },
        pr: {
          title: "PR i mediji",
          copy: "Razvijamo PR strategije po meri i gradimo snažne odnose sa medijima kako bismo povećali vidljivost brenda, učvrstili reputaciju i stvorili značajnu medijsku pažnju. Naš pristup obuhvata i strateške PR aktivacije, inicijative društveno odgovornog poslovanja i izradu reklama.",
        },
        marketing: {
          title: "Marketing i brendiranje",
          copy: "Gradimo i jačamo identitet Vaše organizacije, kao i proizvoda, usluga i ideja koje stoje iza nje. Od pozicioniranja brenda i kreativnog usmerenja do sponzorske strategije i brend partnerstava — stvaramo prilike koje donose prepoznatljivost, povezanost i dugoročan rast.",
        },
      },
    },
    clients: {
      eyebrow: "(02) — Klijenti",
      titleBefore: "Kompanije koje",
      titleAccent: "veruju Triveli",
      titleAfter: ".",
      lead: "Od startapa do afirmisanih imena — u sportu i daleko izvan njega.",
    },
    masterpieces: {
      eyebrow: "(03) — Klijenti i remek-dela",
      titleBefore: "Remek-dela,",
      titleAccent: "stvorena zajedno",
      titleAfter: ".",
      lead: "Svaki brend sa kojim radimo dobija istu posvećenost koju unosimo u ime jednog sportiste. Nekoliko priča na koje smo ponosni.",
      spotlights: {
        savic: {
          name: "Restoran Savić",
          role: "Brend i film za društvene mreže",
          kicker: "Slučaj 01",
          title: "Sto o kom se priča.",
          story:
            "Restoranu Savić dali smo više od jelovnika — dali smo mu atmosferu. Od serviranja do svetla, snimili smo i montirali sadržaj koji svake večeri puni salu i izgradili prisustvo na društvenim mrežama zahvaljujući kom rezervacije ne prestaju. Dokaz da isto oko za priču jednako dobro radi u kuhinji kao i na terenu.",
          tags: ["Sadržaj", "Društvene mreže", "Film"],
        },
        opening: {
          name: "Restoran Savić — Svečano otvaranje",
          role: "Kampanja za otvaranje",
          kicker: "Slučaj 02",
          title: "Veče otvaranja, rasprodato.",
          story:
            "Za otvaranje smo vodili kompletnu kampanju — tizer filmove, saradnje sa influenserima i veče na koje je ceo grad želeo pozivnicu. Vrata su se otvorila pred punom salom i listom čekanja, a snimci su živeli još dugo nakon što je sklonjen poslednji tanjir.",
          tags: ["Otvaranje", "Kampanja", "Video"],
        },
      },
    },
    reels: {
      eyebrow: "(04) — Naši radovi",
      titleBefore: "Radovi,",
      titleAccent: "klijent po klijent",
      titleAfter: ".",
      lead: "Kampanje, sadržaj i brend filmovi koje smo producirali. Dodirnite bilo koji snimak da ga otvorite u punoj veličini.",
    },
    cta: {
      title: "Izgradimo Vaš brend.",
      lead: "Recite nam gde želite da stignete. Mi donosimo priču koja će Vas tamo odvesti.",
      button: "Kontaktirajte nas",
    },
  },

  contact: {
    eyebrow: "(01) — Kontakt",
    title1: "Hajde da napravimo",
    title2: "nešto",
    title3: "sjajno.",
    lead: "Recite nam nešto o svom projektu. Odgovaramo u roku od 24 sata, nikad šablonskim mejlom.",
    emailLabel: "Email",
    studio: "Studio",
    social: "Društvene mreže",
    fields: {
      name: "Ime",
      email: "Email",
      company: "Kompanija (opciono)",
      message: "Poruka",
    },
    packageQuestion: "Koji paket Vas zanima?",
    helpQuestion: "Kako možemo da pomognemo?",
    services: {
      marketing: "Marketing",
      pr: "PR",
      consulting: "Konsalting",
      content: "Kreiranje sadržaja",
      social: "Društvene mreže",
      branding: "Brendiranje",
      influencer: "Influenser marketing",
      events: "Organizacija događaja",
    },
    sending: "Slanje…",
    send: "Pošalji poruku",
    error: "Slanje nije uspelo. Pokušajte ponovo ili nam pišite direktno na email.",
    successTitle: "Primljeno.",
    successAccent: "Javićemo se.",
    successBody: "Neko iz tima odgovoriće u roku od 24 sata. Obično i brže.",
  },

  footer: {
    navigation: "Navigacija",
    whoWeAre: "Ko smo mi",
    tagline: "Gradimo ikonične brendove sportista.",
    socials: "Društvene mreže",
    legalLine: "Marketing, PR i konsalting.",
    privacy: "Politika privatnosti",
    terms: "Uslovi korišćenja",
    cookies: "Kolačići",
  },

  home: {
    hero: {
      tagline: "Gradimo ikonične brendove sportista.",
      subtitle:
        "Ekskluzivna butik agencija za igrače svetske klase: elitna vizija, bezvremensko nasleđe i nezaustavljiva strast.",
      cta: "Započni saradnju sa nama",
    },

    introduce: {
      kicker: "Priča o Triveli",
      eyebrow: "(01) — O nama",
      titleBefore: "Šta je",
      titleAccent: "Trivela Group",
      titleAfter: "?",
      leadStrong: "Trivela Group je mlada,",
      leadRest:
        "inovativna kreativna agencija koju čine ljudi sa iskrenom strašću prema sportu, marketingu, dizajnu i pripovedanju.",
      leadRest2:
        "Specijalizovani smo za upravljanje društvenim mrežama, PR, kreativni sadržaj i strateški marketing — pomažemo sportistima da izgrade snažne lične brendove koji sežu daleko izvan njihovih rezultata na terenu.",
      body: "Spajajući kreativnost, strategiju i duboko razumevanje sportske industrije, karijere pretvaramo u priče, ličnosti u brendove, a sportiste u ikone. Ne upravljamo samo prisustvom. Gradimo ikonične brendove sportista.",
      stats: {
        athletes: "Sportista",
        projects: "Projekata",
        services: "Ključne usluge",
      },
      seeWork: "Pogledaj naše radove",
      showreel: "Showreel",
      videoCaption: "Maskice po meri — u pokretu",
    },

    whoWeAre: {
      eyebrow: "Ko smo mi",
      titleBefore: "Nastali iz",
      titleAccent: "zajedničke vizije.",
      p1: "Trivela je osnovana u septembru 2024. godine iz zajedničke vizije dvoje ljudi sa višegodišnjim iskustvom u sportu, marketingu, medijima i grafičkom dizajnu.",
      p2: "Kako je agencija rasla, rastao je i tim iza nje. Danas Trivela Group okuplja više od 10 posvećenih profesionalaca koji udružuju svoje znanje kako bi našim klijentima pružili besprekornu podršku 24/7.",
      roles: {
        social: {
          title: "Menadžeri društvenih mreža",
          copy: "Svaki trenutak pretvaraju u priču vrednu praćenja.",
        },
        pr: {
          title: "PR i marketing menadžer",
          copy: "Gradi reputaciju koja seže dalje od same igre.",
        },
        video: {
          title: "Snimatelji",
          copy: "Beleže trenutke koji definišu karijere.",
        },
        design: {
          title: "Grafički dizajneri",
          copy: "Svakom sportisti daju sopstveni vizuelni identitet.",
        },
      },
    },

    whatWeDo: {
      eyebrow: "Šta radimo",
      titleBefore: "Različite veštine, jedna vizija —",
      titleAccent: "gde sportisti postaju brendovi",
      services: {
        social: {
          title: "Društvene mreže",
          desc: "Upravljamo tvojim digitalnim prisustvom i podižemo ga na viši nivo na danas najrelevantnijim društvenim mrežama. Naše usluge obuhvataju kompletno upravljanje profilima, verifikaciju i kreiranje sadržaja — objava, rilsova i storija — uz vrhunsku video produkciju i premium vizuelni dizajn.",
        },
        pr: {
          title: "PR",
          desc: "Posvećeni PR menadžer koji gradi i štiti tvoj javni imidž kroz strateške odnose sa medijima, PR kampanje po meri i pažljivo vođenu komunikaciju.",
        },
        marketing: {
          title: "Marketing",
          desc: "Posvećeni marketing menadžer koji gradi i razvija tvoj lični brend, vodi sponzorske ugovore i pronalazi nove komercijalne i partnerske prilike.",
        },
      },
    },

    players: {
      eyebrow: "Veruju nam",
      title: "Igrači koji veruju našem radu",
    },

    seeOurWork: {
      eyebrow: "Pogledaj naše radove",
      title: "Naša galerija",
      cta: "Pogledaj više",
    },

    pricing: {
      eyebrow: "Paketi",
      titleBefore: "Napravljeno po meri",
      titleAccent: "tvoje igre.",
      intro1: "Svaki sportista je drugačiji. Takav je i naš pristup.",
      intro2:
        "Izaberi nivo podrške koji odgovara tvojoj karijeri, ambicijama i brendu koji želiš da izgradiš.",
      selectLabel: "Izaberi paket",
      plans: {
        standard: {
          tagline: "Sve što ti treba da izgledaš kao profesionalac.",
          cta: "Izaberi Standard",
          lead: "Šta je uključeno:",
          features: [
            "Upravljanje društvenim mrežama",
            "Obrada fotografija",
            "Dizajn za dan utakmice",
            "Mesečni izveštaj o učinku",
            "Osnovna PR komunikacija",
            "Upravljanje zajednicom",
          ],
        },
        premium: {
          tagline: "Za sportiste spremne da postanu brend.",
          cta: "Izaberi Premium",
          lead: "Sve iz Standard paketa, plus:",
          features: [
            "Upravljanje društvenim mrežama (više platformi)",
            "Video produkcija i montaža",
            "PR i odnosi sa medijima",
            "Upravljanje plaćenim oglasima",
            "Intervjui i mediji",
          ],
        },
        elite: {
          tagline: "Kompletno partnerstvo u izgradnji brenda.",
          cta: "Izaberi Elite",
          lead: "Sve iz Premium paketa, plus:",
          features: [
            "Lični menadžer naloga",
            "Strategija brenda i konsalting",
            "Saradnje sa influenserima",
            "Prioritetna podrška",
          ],
        },
      },
    },
  },
};

export default sr;
