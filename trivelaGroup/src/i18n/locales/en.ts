/*
 * English — IZVOR ISTINE za sve prevode.
 *
 * sr.ts je tipiziran prema ovom obliku (`Messages`), pa:
 *   - kljuc koji postoji ovde a fali u srpskom  -> greska pri kompajliranju
 *   - kljuc koji postoji u srpskom a ne ovde    -> greska pri kompajliranju
 * Tako nijedan tekst ne moze tiho da ostane neprevedeni.
 *
 * NIJE `as const` namerno: vrednosti moraju biti `string`, ne tacni literali,
 * da bi srpski mogao da ima drugaciji tekst istog oblika.
 *
 * Ne prevode se: imena brendova (Trivela Group/Drop/Business), imena
 * klijenata i sportista, i nazivi paketa (Standard/Premium/Elite — idu u
 * ?package= link ka kontakt formi, pa moraju ostati stabilni).
 */
const en = {
  lang: {
    label: "Language",
  },

  nav: {
    home: "Home",
    whatWeDo: "What we do",
    whoWeAre: "Who we are",
    aboutUs: "About Us",
    gallery: "Gallery",
    getInTouch: "Get in Touch",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Menu",
    // {{n}}, ne {{count}} — "count" u i18next okida mnozinu (_one/_other kljucevi).
    openCart: "Open cart ({{n}})",
  },

  common: {
    location: "Belgrade, Serbia",
    basedIn: "Based in:",
    mute: "Mute",
    unmute: "Unmute",
    previous: "Previous",
    next: "Next",
    close: "Close",
    clip: "Clip",
    openClip: "Open {{name}}",
    loading: "Loading…",
    viewOnInstagram: "View this post on Instagram",
    tapToOpen: "Tap to open",
    // Karuseli (samo za citace ekrana)
    carousel: "carousel",
    imageCarousel: "Image carousel",
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    showSlide: "Show {{name}}",
    slideN: "slide {{n}}",
  },

  about: {
    hero: {
      kicker: "Est. 2019 — Belgrade, Serbia",
      titleA: "About",
      titleB: "Us",
      lead: "From a single Instagram page to a creative agency crafting iconic athlete brands — this is how it happened, and why we're called Trivela.",
    },
    origins: {
      eyebrow: "Origins",
      titleBefore: "How did Trivela Group",
      titleAccent: "begin?",
      steps: [
        "The story of Trivela Group goes back to October 2019, when one of its founders began creating sports-focused digital content through an Instagram platform.",
        "As the platform grew, so did the brand behind it. It soon established itself as one of Serbia’s most recognized sports media brands, building a particularly strong presence within the Partizan community.",
        "This growth opened the door to collaborations with Partizan BC, Partizan HC, and a number of professional football and basketball players representing the black and whites — followed by partnerships with athletes from Crvena Zvezda Belgrade.",
        "The next chapter began when a graphic designer joined the team, bringing a new creative dimension to the project. What started as a collaboration evolved into a long-term partnership and, several years later, into the foundation of the creative agency known today as Trivela Group.",
      ],
    },
    why: {
      eyebrow: "(02) — Identity",
      titleBefore: "Why",
      titleAccent: "Trivela?",
      intro:
        "While Trivela Group is now an established name in Belgrade and across Serbia, its identity was built around a simple idea shared by its founders.",
      nameLabel: "The name",
      nameBefore: "The name",
      nameAccent: "Trivela",
      nameAfter:
        "was inspired by one of football’s most distinctive and spectacular techniques — an outside-of-the-foot strike associated with creativity, confidence and exceptional ability. A move not everyone can master.",
      philosophy: "That philosophy remains at the heart of our identity today.",
      arrowLabel: "The arrow",
      arrowBody:
        "The upward-facing arrow embedded within the Trivela Group logo represents our ambition and forward-thinking mindset: to help talented young athletes grow into elite professionals and build powerful personal brands that resonate across Serbian, European and global markets.",
      logoAlt: "Trivela Group logo",
    },
    closing: {
      lineBefore: "Careers into stories. Personalities into brands.",
      lineAccent: "Athletes into icons.",
      cta: "Work with us",
    },
  },

  gallery: {
    title: "Trivela Gallery",
    // Kljucevi su VREDNOSTI kategorija iz galleryPhotos.ts (stabilni); prevodi se samo prikaz.
    categories: {
      Matchdays: "Matchdays",
      Verifications: "Verifications",
      Reels: "Reels",
      Posts: "Posts",
    },
    comingSoon: "Coming soon",
    onTheWay: "{{category}} are on the way — check back shortly.",
  },

  drop: {
    hero: {
      titleBefore: "Carry your",
      titleAccent: "colors",
      lead1: "Exclusive athlete-driven drops.",
      //   = nedeljivi razmak: "Trivela Group" se nikad ne prelomi na pola.
      lead2: "Limited editions by Trivela Group.",
      cta: "Create your custom case",
    },

    shop: {
      trustedEyebrow: "Trusted by the best",
      trustedTitle1: "People who trusted",
      trustedTitle2: "our work",
      playerRoles: {
        basketball: "Basketball Player",
        football: "Football Player",
        lessortWife: "Mathias Lessort's wife",
      },
      allCases: "All cases",
      // Mnozina: i18next bira _one/_few/_other po jeziku. Engleski nikad ne
      // koristi _few, ali kljuc mora postojati da bi srpski imao isti oblik.
      productCount_one: "{{count}} product",
      productCount_few: "{{count}} products",
      productCount_other: "{{count}} products",
      sortBy: "Sort by",
      collections: "Collections",
      sort: {
        az: "Name: A – Z",
        za: "Name: Z – A",
        priceAsc: "Price: low to high",
        priceDesc: "Price: high to low",
      },
      addToCart: "Add {{name}} to cart",
      loadFailed: "Failed to load products: {{error}}",
    },

    product: {
      notFoundTitle: "Case not found",
      notFoundBody: "The product you're looking for doesn't exist.",
      backToShop: "Back to shop",
      collection: "{{name}} collection",
      description:
        "Premium hard case with a soft-touch finish. Slim, drop-tested and built to show your colors. Precise cutouts, wireless-charging friendly.",
      color: "Color",
      colors: {
        green: "Green",
        lightGreen: "Light Green",
        purple: "Purple",
        grey: "Grey",
      },
      phoneModel: "Your phone model",
      phoneModelPlaceholder: "e.g. iPhone 18 Pro",
      addToCart: "Add to cart",
      added: "Added to cart",
      stock: "In stock · Ships in 2–4 business days",
      alsoLike: "You might also like",
      viewAll: "View all",
    },

    cart: {
      title: "Your cart",
      count_one: "{{count}} item",
      count_few: "{{count}} items",
      count_other: "{{count}} items",
      close: "Close cart",
      dialog: "Shopping cart",
      emptyTitle: "Your cart is empty",
      emptyBody: "Pick a case from the shop and it will show up here.",
      continue: "Continue shopping",
      remove: "Remove {{name}}",
      decrease: "Decrease",
      increase: "Increase",
      subtotal: "Subtotal",
      checkout: "Checkout",
      clear: "Clear cart",
    },

    checkout: {
      eyebrow: "(01) — Checkout",
      title: "Almost yours.",
      lead: "A few details and your cases are on the way. We reply within 24 hours if anything's off.",
      contact: "Contact",
      shipping: "Shipping",
      fields: {
        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        phone: "Phone number",
        address: "Address",
        city: "City",
        postal: "Postal code",
      },
      errors: {
        required: "Required",
        email: "Invalid email",
        phone: "Invalid phone number",
        postal: "Invalid postal code",
      },
      placing: "Placing order…",
      place: "Place order",
      terms:
        "By placing the order you agree to our terms. This is a demo — no payment is processed yet.",
      yourOrder: "Your order",
      subtotal: "Subtotal",
      shippingLabel: "Shipping",
      free: "Free",
      freeOver: "Free shipping over 6.000 RSD ✓",
      total: "Total",
      redirecting: "Redirecting…",
      orderNumber: "Order #{{number}}",
      placedTitle: "Order placed.",
      thanks: "Thanks, {{name}}.",
      friend: "friend",
      confirmBefore: "We'll send a confirmation to",
      confirmAfter: " shortly. Delivery typically takes 2–4 business days.",
      backHome: "Back home",
    },

    custom: {
      eyebrow: "Made for you",
      titleBefore: "Create your",
      titleAccent: "custom case",
      lead: "Upload your photo, pick your phone, tell us where to ship it — and we'll craft a one-off case just for you.",
      photo: "Your photo",
      uploading: "Uploading…",
      clickToUpload: "Click to upload your image",
      removeImage: "Remove image",
      fullName: "Full name",
      email: "Email",
      phone: "Phone number",
      phoneModel: "Phone model",
      address: "Address",
      city: "City",
      postal: "Postal",
      country: "Country",
      quantity: "Quantity",
      idea: "Your idea (optional)",
      placeholders: {
        fullName: "Marko Marković",
        email: "you@email.com",
        phone: "+381 …",
        phoneModel: "e.g. iPhone 15 Pro, Galaxy S24…",
        address: "Street & number",
        idea: "Player, club, colours, text — anything you want on it.",
      },
      sending: "Sending…",
      send: "Send my request",
      errors: {
        noImage: "Add your photo for the case.",
        noName: "Full name is required.",
        badEmail: "Enter a valid email.",
        noModel: "Enter your phone model.",
        uploadFailed: "The image didn't upload — please try again.",
        sendFailed: "Sending failed — please try again.",
      },
      successTitle: "Request received.",
      successBody:
        "We'll review your idea and get back to you by email within 24 hours.",
    },

    /* "How it works" vodic (TrivelaJourney) + dva demo prikaza. Tekst koraka
       je pod steps.<panel> — svaki korak ima jedinstven panel. */
    journey: {
      flows: {
        custom: {
          tab: "Custom case",
          eyebrow: "Your picture, our case",
          heading: "How to send a custom request",
          sub: "What to write, field by field — so the first mock-up is already the right one.",
        },
        order: {
          tab: "Regular Case",
          eyebrow: "From the drop",
          heading: "How to order a case",
          sub: "Four steps from the grid to a confirmed order.",
        },
      },
      guides: "Guides",
      stepOf: "Step {{current}} of {{total}}",
      back: "Back",
      next: "Next",
      replay: "Replay",
      sendThis: "Send this",
      notThis: "Not this",
      steps: {
        image: {
          title: "Upload your picture",
          meta: "Start here",
          label: "The image",
          copy: "The photo is the whole case, so it decides how the case turns out. Send the biggest version you have — straight from the camera roll, not a screenshot and not something saved off Instagram.",
        },
        model: {
          title: "Write your exact phone model",
          meta: "Be precise",
          label: "Phone model",
          copy: "Write the full model, including Pro or Max. A 15 Pro case does not fit a 15, and the camera cut-out is the part that goes wrong.",
        },
        contact: {
          title: "Leave your name and contact",
          meta: "So we can reply",
          label: "Contact",
          copy: "Full name, an email you actually read, and a phone number. We come back to you with the mock-up on the email, and the courier calls the number.",
        },
        address: {
          title: "Where it should arrive",
          meta: "Delivery",
          label: "Address",
          copy: "Street with the number, city, postal code and country. Add the flat or floor in the notes if the building needs it — that is what saves a failed delivery.",
        },
        extras: {
          title: "How many, and anything else",
          meta: "Optional",
          label: "Quantity & notes",
          copy: "Say how many cases you want, and use the notes for anything the picture cannot say: a name to print, which part to keep in frame, a deadline you need it by.",
        },
        send: {
          title: "Send it and wait for the mock-up",
          meta: "Then us",
          label: "After you send",
          copy: "We answer with a mock-up of how your case will look. Nothing is printed until you say yes to it.",
        },
        browse: {
          title: "Open a case and write your model",
          meta: "Start here",
          label: "From the grid",
          copy: "Every case we have ready is on the Drop page. Tap one and it opens on its own page, with its price and collection — then write your phone model in full, Pro or Max included. Watch it happen below.",
        },
        cart: {
          title: "Add it to the cart",
          meta: "Collect",
          label: "Cart",
          copy: "Add to cart, then the bag at the top of the page — the cart slides out from the side. It keeps the model with each case, so two of the same print for two different phones stay apart.",
        },
        details: {
          title: "Fill in the delivery details",
          meta: "Checkout",
          label: "Checkout",
          copy: "Name, email, phone, address, city and postal code. Shipping is free over 6.000 RSD and 590 RSD under it — the total updates as you go.",
        },
        placed: {
          title: "Place the order",
          meta: "Done",
          label: "Confirmation",
          copy: "You get an order number on screen and by email. Keep it — it is what we look you up by if you write to us.",
        },
      },
      panels: {
        image: {
          caption: "Cases we printed from photos customers sent in.",
          good: [
            "The original photo, straight from your gallery",
            "The face or subject fully in frame, not cropped at the edge",
            "Good light — what looks dull on screen prints dull",
          ],
          bad: [
            "A screenshot of a photo",
            "An image saved from Instagram or WhatsApp — both shrink it",
            "A picture that is already blurry when you zoom in",
          ],
          note: "Not sure whether yours is big enough? Send it anyway — we check it and tell you before anything is printed.",
        },
        model: {
          label: "Phone model",
          hint: "Type it in full — the Pro and the Max are different cases.",
          bad: ["iPhone", "the new one", "18 pro maybe"],
          note: "Not sure your model is one we cut? Write it anyway — we tell you before anything is printed.",
        },
        contact: {
          name: "Full name",
          email: "Email",
          emailHint: "The mock-up goes here, so use one you check.",
          phone: "Phone",
          phoneHint: "The courier calls this number.",
        },
        address: {
          address: "Address",
          city: "City",
          postal: "Postal code",
          country: "Country",
          countryValue: "Serbia",
          note: "Flat number, floor, or an intercom that does not work — put it in the notes on the next step. That is what stops a delivery coming back to us.",
        },
        extras: {
          quantity: "Quantity",
          quantityHint: "Same picture on two cases, or two models.",
          notes: "Notes",
          notesValue:
            "“Second case is for a Samsung S24. Please keep both of us in frame and print the name MARKO under the photo. Needed before the 20th if possible.”",
          note: "Anything the picture cannot say belongs here — a name to print, which part to keep, a date you need it by.",
        },
        send: {
          list: [
            "Your request lands with us, picture and all",
            "We come back on email with a mock-up of your case",
            "You say yes — or ask for a change, as many times as it takes",
            "Only then do we print it and send it out",
          ],
          cta: "Send my request",
        },
        browse: {
          fieldEmpty: "Field empty",
          modelWritten: "Model written",
          note: "The button stays dead until the model field has something in it — a case is cut for one model, and the camera cut-out is what goes wrong otherwise. Filter by collection or sort by price to get to yours faster.",
          goToAll: "Go to all cases",
        },
        cart: {
          note: "Same print, two different phones — the cart keeps them apart because the model rides along with each case. The price on the case is what you pay for it; shipping is counted separately at the end.",
        },
        details: {
          firstName: "First name",
          lastName: "Last name",
          email: "Email",
          phone: "Phone",
          address: "Address",
          city: "City",
          postal: "Postal code",
          freeNote: "Free shipping over 6.000 RSD — under that it is 590 RSD.",
        },
        placed: {
          title: "Order placed",
          numberIs: "Your order number is",
          note: "The same number goes to your email. Keep it — it is how we find your order if you write to us.",
        },
      },
      shopDemo: {
        captionProduct:
          "That is the case's own page — price, collection, and the model field.",
        captionGrid: "Watch: the grid, one case, and where it takes you.",
      },
      cartDemo: {
        captionDone:
          "Checkout takes you to the next step — your delivery details.",
        captionOpen:
          "The cart slides in from the right — the model stays with the case.",
        captionIdle: "Watch: Add to cart, then the bag up top.",
      },
    },
  },

  /* Trivela Business — obraca se kompanijama (u srpskom: formalno "Vi"). */
  business: {
    hero: {
      title1: "Beyond the game",
      title2: "Built for business.",
      lead: "The same storytelling that turned athletes into icons — now working for companies, founders and brands far outside sport.",
      ctaPrimary: "Start a project",
      ctaSecondary: "See our clients",
    },
    beyond: {
      eyebrow: "(01) — Beyond sport",
      title: "Not just athletes.",
      lead: "We spent years making sportspeople unforgettable. That same craft — marketing, PR and brand consulting — now powers companies in every industry.",
      pillars: {
        social: {
          title: "Social Media",
          copy: "Complete management of your brand’s digital presence: from day-to-day social media operations to premium content creation that reflects the quality and identity of your business. We build a consistent online image supported by a clear communication, content and advertising strategy.",
        },
        pr: {
          title: "PR & Media",
          copy: "Developing tailored PR strategies and building strong media relationships to increase brand visibility, strengthen reputation and create meaningful exposure. Our approach also includes strategic PR activation, corporate social responsibility initiatives and ad making.",
        },
        marketing: {
          title: "Marketing & Branding",
          copy: "Building and strengthening the identity of your organization and the products, services and ideas behind it. From brand positioning and creative direction to sponsorship strategy and brand partnerships, we create opportunities that drive recognition, connection and long-term growth.",
        },
      },
    },
    clients: {
      eyebrow: "(02) — Clients",
      titleBefore: "Companies who",
      titleAccent: "trust Trivela",
      titleAfter: ".",
      lead: "From startups to established names — inside sport and far beyond it.",
    },
    masterpieces: {
      eyebrow: "(03) — Clients & masterpieces",
      titleBefore: "Masterpieces,",
      titleAccent: "made together",
      titleAfter: ".",
      lead: "Every brand we touch gets the same obsession we bring to an athlete's name. A few of the stories we're proud of.",
      spotlights: {
        savic: {
          name: "Restaurant Savic",
          role: "Brand & social film",
          kicker: "Case 01",
          title: "A table worth talking about.",
          story:
            "We gave Restaurant Savic more than a menu — we gave it a mood. From the plating to the lighting, we shot and cut the content that fills the room every night, and built the social presence that keeps the reservations coming. Proof that the same eye for a story works just as well in a kitchen as on a pitch.",
          tags: ["Content", "Social", "Film"],
        },
        opening: {
          name: "Restaurant Savic — Grand opening",
          role: "Launch campaign",
          kicker: "Case 02",
          title: "Opening night, sold out.",
          story:
            "For the launch we ran the full campaign — teaser films, influencer seeding and a night the whole city wanted an invite to. The doors opened to a full house and a waiting list, and the footage lived on long after the last plate was cleared.",
          tags: ["Launch", "Campaign", "Video"],
        },
      },
    },
    reels: {
      eyebrow: "(04) — Our work",
      titleBefore: "The work,",
      titleAccent: "client by client",
      titleAfter: ".",
      lead: "Campaigns, content and brand films we produced. Tap any clip to open it full size.",
    },
    cta: {
      title: "Let's build your brand.",
      lead: "Tell us where you want to be. We'll bring the story that gets you there.",
      button: "Get in touch",
    },
  },

  /* Kontakt stranica — mesovita publika (sportisti + kompanije), u srpskom "Vi". */
  contact: {
    eyebrow: "(01) — Get in touch",
    title1: "Let's make",
    title2: "something",
    title3: "great.",
    lead: "Tell us about your project. We reply within 24 hours, never with a templated email.",
    emailLabel: "Email",
    studio: "Studio",
    social: "Social",
    fields: {
      name: "Name",
      email: "Email",
      company: "Company (optional)",
      message: "Message",
    },
    packageQuestion: "Which package are you interested in?",
    helpQuestion: "What can we help with?",
    // Kljuc = stabilan id; VREDNOST koja ide backend-u ostaje engleska (ContactForm).
    services: {
      marketing: "Marketing",
      pr: "PR",
      consulting: "Consulting",
      content: "Content Creation",
      social: "Social Media",
      branding: "Branding",
      influencer: "Influencer Marketing",
      events: "Event Management",
    },
    sending: "Sending…",
    send: "Send message",
    error: "Couldn't send. Try again or email us directly.",
    successTitle: "Got it.",
    successAccent: "We'll be in touch.",
    successBody: "One of us will reply within 24 hours. Usually faster.",
  },

  footer: {
    navigation: "Navigation",
    whoWeAre: "Who We Are",
    tagline: "Crafting iconic athlete brands.",
    socials: "Socials",
    legalLine: "Marketing, PR & consulting.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookies",
  },

  home: {
    hero: {
      tagline: "Crafting iconic athlete brands.",
      subtitle:
        "Exclusive boutique agency for world-class players: elite vision, timeless legacy & unstoppable passion.",
      cta: "Start working with us",
    },

    introduce: {
      kicker: "The story of Trivela",
      eyebrow: "(01) — About us",
      titleBefore: "What is",
      titleAccent: "Trivela Group",
      titleAfter: "?",
      leadStrong: "Trivela Group is a young,",
      leadRest:
        "forward-thinking creative agency built by people who share a genuine passion for sports, marketing, design, and storytelling.",
      leadRest2:
        "We specialize in Social Media Management, PR, creative content, and strategic marketing, helping athletes build powerful personal brands that go far beyond their performance on the field.",
      body: "By combining creativity, strategy, and a deep understanding of the sports industry, we turn careers into stories, personalities into brands, and athletes into icons. We don’t just manage presence. We build iconic athlete brands.",
      stats: {
        athletes: "Athletes",
        projects: "Projects",
        services: "Core services",
      },
      seeWork: "See our work",
      showreel: "Showreel",
      videoCaption: "Custom cases — in motion",
    },

    whoWeAre: {
      eyebrow: "Who we are",
      titleBefore: "Founded on a",
      titleAccent: "shared vision.",
      p1: "Trivela was founded in September 2024 from a shared vision of two people with years of experience across sports, marketing, media, and graphic design.",
      p2: "As the agency grew, so did the team behind it. Today, Trivela Group brings together more than 10 dedicated professionals, combining their expertise to provide our clients with seamless, 24/7 support.",
      roles: {
        social: {
          title: "Social Media Managers",
          copy: "Turning every moment into a story worth following.",
        },
        pr: {
          title: "PR & Marketing Manager",
          copy: "Building reputations that go beyond the game.",
        },
        video: {
          title: "Videographers",
          copy: "Capturing the moments that define careers.",
        },
        design: {
          title: "Graphic Designers",
          copy: "Giving every athlete a visual identity of their own.",
        },
      },
    },

    whatWeDo: {
      eyebrow: "What we do",
      titleBefore: "Different skills, one vision —",
      titleAccent: "where athletes become brands",
      services: {
        social: {
          title: "Social Media",
          desc: "Managing and elevating your digital presence across today’s most relevant social media platforms. Our services include full profile management, verification, content creation across posts, reels and stories, supported by high-end video production and premium visual design.",
        },
        pr: {
          title: "PR",
          desc: "A dedicated PR Officer focused on building and protecting your public image through strategic media relations, tailored PR campaigns and carefully managed communication.",
        },
        marketing: {
          title: "Marketing",
          desc: "A dedicated Marketing Manager focused on building and growing your personal brand, while managing sponsorship agreements and identifying new commercial and partnership opportunities.",
        },
      },
    },

    players: {
      eyebrow: "Trusted by",
      title: "Players who trust our work",
    },

    seeOurWork: {
      eyebrow: "See our work",
      title: "Our Gallery",
      cta: "See more",
    },

    pricing: {
      eyebrow: "Packages",
      titleBefore: "Built around",
      titleAccent: "your game.",
      intro1: "Every athlete is different. So is the way we work.",
      intro2:
        "Choose the level of support that fits your career, your ambitions and the brand you want to build.",
      selectLabel: "Select a package",
      plans: {
        standard: {
          tagline: "Everything you need to look the part.",
          cta: "Choose Standard",
          lead: "What's included:",
          features: [
            "Social media management",
            "Photo editing",
            "Matchday design",
            "Monthly performance report",
            "Basic PR outreach",
            "Community management",
          ],
        },
        premium: {
          tagline: "For athletes ready to become a brand.",
          cta: "Choose Premium",
          lead: "Everything in Standard, plus:",
          features: [
            "Social media management (more platforms)",
            "Video production & editing",
            "PR & media relations",
            "Paid ads management",
            "Interviews & Media",
          ],
        },
        elite: {
          tagline: "Complete brand partnership.",
          cta: "Choose Elite",
          lead: "Everything in Premium, plus:",
          features: [
            "Dedicated account manager",
            "Brand strategy & consulting",
            "Influencer partnerships",
            "Priority support",
          ],
        },
      },
    },
  },
};

export default en;
export type Messages = typeof en;
