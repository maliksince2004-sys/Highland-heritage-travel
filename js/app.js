/* ==========================================================================
   HIGHLAND HERITAGE TRAVELS - INTERACTIVE APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Current Currency Rates relative to USD (1 USD as baseline)
  const currencyRates = {
    USD: { symbol: '$', rate: 1, label: 'USD ($)' },
    LKR: { symbol: 'Rs. ', rate: 305, label: 'LKR (Rs)' },
    EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
    GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' }
  };
  let currentCurrency = 'USD';

  // Base tour prices in USD
  const tourPrices = {
    'little-england': 45,
    'trip-01': 44.99,
    'trip-02': 49.99,
    'trip-03': 35.99,
    'trip-04': 59.99,
    'trip-05': 35.99,
    'trip-06': 55.99,
    'bomburu-ella': 55,
    'horton-plains': 70,
    'tea-heritage': 140,
    'moon-plains': 50,
    'ella-nuwaraeliya': 280
  };
  const vehicleSurchargesUSD = {
    'three-wheeler': 0,
    car: 10,
    van: 15
  };

  // WhatsApp Configuration - (User can easily change this phone number)
  const defaultWhatsAppNumber = '94741233175'; // Sri Lanka country code (+94)

  /* ==========================================================================
     1. STICKY NAVBAR & MOBILE MENU
     ========================================================================== */
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const themeToggle = document.getElementById('themeToggle');

  function setTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      const icon = themeToggle.querySelector('.theme-toggle-icon');
      const label = themeToggle.querySelector('.theme-toggle-label');
      if (icon) icon.textContent = isDark ? '☀' : '☾';
      if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
    }
  }

  const savedTheme = localStorage.getItem('highland-heritage-theme');
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeToggle?.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('highland-heritage-theme', nextTheme);
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.textContent = '☰';
      });
    });
  }

  /* ==========================================================================
     2. CURRENCY SWITCHER
     ========================================================================== */
  const currencySelect = document.getElementById('currencySelect');

  function updatePrices() {
    const { symbol, rate } = currencyRates[currentCurrency];
    const selectedVehicle = document.getElementById('heroVehicleSelect')?.value;
    const vehicleSurchargeUSD = vehicleSurchargesUSD[selectedVehicle] || 0;
    document.querySelectorAll('[data-base-price]').forEach(el => {
      const base = parseFloat(el.getAttribute('data-base-price'));
      if (!isNaN(base)) {
        const fractionDigits = currentCurrency === 'LKR' ? 0 : Number(el.dataset.pricePrecision) || 0;
        const cardSurcharge = el.closest('.tour-card') ? vehicleSurchargeUSD : 0;
        const converted = (base + cardSurcharge) * rate;
        const formattedPrice = `${symbol}${converted.toLocaleString(undefined, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits
        })}`;
        el.textContent = formattedPrice;

        const whatsappButton = el.closest('.tour-card')?.querySelector('.btn-card-whatsapp');
        if (whatsappButton) whatsappButton.dataset.tourPrice = `${formattedPrice} per vehicle`;
      }
    });

    // Also update modal calculation if modal open
    calculateModalPrice();
    updateHeroVehiclePrice();
  }

  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updatePrices();
    });
  }

  /* ==========================================================================
     3. TOUR PACKAGE FILTERING
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.tour-filter-bar .filter-btn');
  const tourCards = document.querySelectorAll('.tour-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      tourCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory.includes(filterCategory)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     4. TOUR CARD ITINERARY ACCORDION TOGGLES
     ========================================================================== */
  document.querySelectorAll('.itinerary-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.tour-card');
      const drawer = card.querySelector('.itinerary-drawer');
      const arrow = btn.querySelector('.itinerary-arrow');

      if (drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        btn.querySelector('.itinerary-btn-text').textContent = 'View Day-by-Day Plan';
        if (arrow) arrow.textContent = '▼';
      } else {
        drawer.classList.add('open');
        btn.querySelector('.itinerary-btn-text').textContent = 'Hide Itinerary Plan';
        if (arrow) arrow.textContent = '▲';
      }
    });
  });

  const tripOneDestinations = {
    'boburu-ella': {
      title: 'Boburu Ella',
      coordinates: [6.891, 80.870],
      photos: [
        'assets/images/boburu ella/bomburu-ella-view.jpg',
        'assets/images/boburu ella/bomburu-ella-waterfall.jpg',
        'assets/images/boburu ella/6ee33416-2a7d-4acd-98b5-fbefbdf9d9b1.jpg',
        'assets/images/boburu ella/boburu ella 03.jpg',
        'assets/images/boburu ella/boburu ella 04.jpg',
        'assets/images/boburu ella/boburu ella 05.jpg',
        'assets/images/boburu ella/boburu ella 06.jpg'
      ]
    },
    hakgala: {
      title: 'Hakgala Botanical Garden',
      coordinates: [6.923, 80.817],
      photos: [
        'assets/images/huggala botanical garden/2cded4081cfa27c8ea0a711618ee2cf7.jpg',
        'assets/images/huggala botanical garden/haggala garden 04.jpg',
        'assets/images/huggala botanical garden/haggala garden 05.jpg',
        'assets/images/huggala botanical garden/haggala garden 2.jpg',
        'assets/images/huggala botanical garden/haggala garden.jpg'
      ]
    },
    'seetha-amman': {
      title: 'Seetha Amman Kovil',
      coordinates: [6.954, 80.817],
      photos: [
        'assets/images/seetha amman tample/kovil.jpg',
        'assets/images/seetha amman tample/s1.jpg',
        'assets/images/seetha amman tample/s2.jpg',
        'assets/images/seetha amman tample/s3.jpg',
        'assets/images/seetha amman tample/s4.jpg'
      ]
    },
    'lake-gregory': {
      title: 'Lake Gregory',
      coordinates: [6.956, 80.782],
      photos: [
        'assets/images/lake gregory/lake-gregory-1.jpg',
        'assets/images/lake gregory/lake-gregory-boats.jpg',
        'assets/images/lake gregory/bench.jpg',
        'assets/images/lake gregory/nuwara-eliya-town.jpg'
      ]
    }
  };

  const victoriaParkPhotos = [
    'assets/images/victoria park/6995c9550e8d56de9a5291c027fa9cec.jpg',
    'assets/images/victoria park/v1.jpg',
    'assets/images/victoria park/v2.jpg',
    'assets/images/victoria park/v4.jpg',
    'assets/images/victoria park/v5.jpg',
    'assets/images/victoria park/v6.jpg'
  ];

  const destinationGalleryData = {
    ...tripOneDestinations,
    'ramboda-waterfall': {
      title: 'Ramboda Waterfall',
      photos: [
        'assets/images/Ramboda/06cf642f38e6a293aef125c57886ed7e.jpg',
        'assets/images/Ramboda/23e158cbbd41520e4b80f60fe956366b.jpg',
        'assets/images/Ramboda/a7e84dc9286dc43357570ad275c9d9ed (2).jpg',
        'assets/images/Ramboda/r3.jpg',
        'assets/images/Ramboda/r4.jpg'
      ]
    },
    'damro-tea-factory': {
      title: 'Damro Tea Factory',
      photos: [
        'assets/images/damro tea factory/d1.jpg',
        'assets/images/damro tea factory/d2.jpg',
        'assets/images/damro tea factory/d3.jpg',
        'assets/images/damro tea factory/d4.jpg',
        'assets/images/damro tea factory/d5.jpg',
        'assets/images/damro tea factory/d6.jpg'
      ]
    },
    'bluefield-tea-factory': {
      title: 'Bluefield Tea Factory',
      photos: [
        'assets/images/blue field tea factory/b1.jpg',
        'assets/images/blue field tea factory/b2.jpg',
        'assets/images/blue field tea factory/b3.jpg',
        'assets/images/blue field tea factory/b4.jpg',
        'assets/images/blue field tea factory/b5.jpg',
        'assets/images/blue field tea factory/b6.jpg'
      ]
    },
    'ramboda-view-point': {
      title: 'Ramboda View Point',
      photos: [
        'assets/images/tea bush/0ee27270eec337ec37c0719d388fa5fd.jpg',
        'assets/images/tea bush/6f9085b567cf74196d9c0d2d43eed1f6eb5eba28.png',
        'assets/images/tea bush/846370181.png',
        'assets/images/tea bush/84fb0bce746509fe2f42fc0374583619.jpg',
        'assets/images/tea bush/photo-oak-ray-tea-bush-ramboda-81.png',
        'assets/images/tea bush/v1.jpg'
      ]
    },
    'victoria-botanical-garden': {
      title: 'Victoria Botanical Garden',
      photos: victoriaParkPhotos
    },
    'gregory-lake': {
      title: 'Gregory Lake',
      photos: tripOneDestinations['lake-gregory'].photos
    },
    moonplain: {
      title: 'Moonplain',
      photos: [
        'assets/images/moon plain/m1.jpg',
        'assets/images/moon plain/m2.jpg',
        'assets/images/moon plain/m3.jpg',
        'assets/images/moon plain/m4.jpg',
        'assets/images/moon plain/m5.jpg',
        'assets/images/moon plain/m6.jpg'
      ]
    },
    'pedro-estate': {
      title: 'Pedro Estate',
      photos: [
        'assets/images/pedro estate/p1.jpg',
        'assets/images/pedro estate/p2.jpg',
        'assets/images/pedro estate/p3.jpg',
        'assets/images/pedro estate/p4.jpg',
        'assets/images/pedro estate/p5.jpg',
        'assets/images/pedro estate/p6.jpg'
      ]
    },
    'mandaram-nuwara': {
      title: 'Mandaram Nuwara Village',
      photos: [
        'assets/images/mandaram nuwara/m01.jpg',
        'assets/images/mandaram nuwara/m02.jpg',
        'assets/images/mandaram nuwara/m03.jpg',
        'assets/images/mandaram nuwara/m04.jpg',
        'assets/images/mandaram nuwara/m05.jpg'
      ]
    },
    'mandaram-nuwara-tea-estate': {
      title: 'Mandaram Nuwara Tea Estate',
      photos: [
        'assets/images/mandaramnuwara estate/01.jpg',
        'assets/images/mandaramnuwara estate/02.jpg',
        'assets/images/mandaramnuwara estate/03.jpg',
        'assets/images/mandaramnuwara estate/05.jpg'
      ]
    },
    'nuwara-eliya-city': {
      title: 'Nuwara Eliya City',
      photos: [
        'assets/images/lake gregory/nuwara-eliya-town.jpg',
        'assets/images/nuwara eliya/01.jpg',
        'assets/images/nuwara eliya/002.jpg',
        'assets/images/nuwara eliya/003.jpg',
        'assets/images/nuwara eliya/004.jpg',
        'assets/images/nuwara eliya/005.jpg'
      ]
    },
    'victoria-gardens': { title: 'Victoria Gardens', photos: victoriaParkPhotos },
    'world-end': {
      title: 'World’s End',
      photos: [
        'assets/images/world end/w1.jpg',
        'assets/images/world end/w2.jpg',
        'assets/images/world end/w3.jpg',
        'assets/images/world end/w4.jpg',
        'assets/images/world end/words end.jpg',
        'assets/images/world end/e6fc4acf6e4a94fcbcf3a2b20f335d9c.jpg'
      ]
    },
    Ambewela: {
      title: 'Ambewela',
      photos: [
        'assets/images/ambewela/0001.jpg',
        'assets/images/ambewela/0002.jpg',
        'assets/images/ambewela/0003.jpg',
        'assets/images/ambewela/0004.jpg',
        'assets/images/ambewela/0006.jpg',
        'assets/images/ambewela/0007.jpg'
      ]
    },
    Jagro: {
      title: 'Jagro',
      photos: [
        'assets/images/jagro/0000.png',
        'assets/images/jagro/00001.webp',
        'assets/images/jagro/Nuwara-Eliya-strawberry-farm-prices-1024x585.png',
        'assets/images/jagro/Nuwara-Eliya-strawberry-farms-and-picking-experiences-3-1024x585.png',
        'assets/images/jagro/Nuwara-Eliya-strawberry-picking-tour-1024x585.png'
      ]
    },
    'horton-plains': {
      title: 'Horton Plains',
      photos: [
        'assets/images/hortan plain/074f254d1b480c9acc0a177d5435c9fa.jpg',
        'assets/images/hortan plain/28de9f2b3257e65f9eaf62d42597606b.jpg',
        'assets/images/hortan plain/60da5fb9e955d09fa980774345453a03.jpg',
        'assets/images/hortan plain/6c554b6cea872e9170cab40a95724017.jpg',
        'assets/images/hortan plain/6c83b0f8f498cef2e148a1004924b7da.jpg',
        'assets/images/hortan plain/89fc05bf33d7c42d17c95a8cfdc288f8.jpg',
        'assets/images/hortan plain/c98de138e238af0afa3e8b6f03279683.jpg',
        'assets/images/hortan plain/dc0fbbb8b94e6038509e4b79a53c2f58.jpg',
        'assets/images/hortan plain/e2fb6ef81827fb79cd3b6e193293aa4c.jpg'
      ]
    }
  };

  const galleryKeyByFeatureTitle = {
    'Ramboda Waterfall': 'ramboda-waterfall',
    'Damro Tea Factory': 'damro-tea-factory',
    'Bluefield Tea Factory': 'bluefield-tea-factory',
    'Ramboda View Point': 'ramboda-view-point',
    'Victoria Botanical Garden': 'victoria-botanical-garden',
    'Gregory Lake': 'gregory-lake',
    Moonplain: 'moonplain',
    'Pedro Estate': 'pedro-estate',
    'Mandaram Nuwara': 'mandaram-nuwara',
    'Traditional Village': 'mandaram-nuwara',
    'Local Craft & Culture': 'mandaram-nuwara',
    'Mandaram Nuwara Tea Estate': 'mandaram-nuwara-tea-estate',
    'City Tour': 'nuwara-eliya-city',
    Victoria: 'victoria-gardens',
    Lake: 'lake-gregory',
    'World End': 'world-end',
    Ambewela: 'Ambewela',
    Jagro: 'Jagro',
    'Horton Plain': 'horton-plains'
  };

  document.querySelectorAll('.tour-card .feature-point:not(.destination-gallery-trigger)').forEach(feature => {
    const title = feature.querySelector('span')?.textContent.trim();
    const destinationKey = galleryKeyByFeatureTitle[title];
    if (!destinationKey || !destinationGalleryData[destinationKey]) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${feature.className} destination-gallery-trigger`;
    button.dataset.destinationGallery = destinationKey;
    const checkmark = feature.querySelector('svg');
    if (checkmark) button.appendChild(checkmark.cloneNode(true));
    const label = document.createElement('span');
    label.textContent = title;
    button.appendChild(label);
    const galleryHint = document.createElement('span');
    galleryHint.className = 'feature-gallery-hint';
    galleryHint.setAttribute('aria-hidden', 'true');
    galleryHint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
    button.appendChild(galleryHint);
    feature.replaceWith(button);
  });

  const destinationGalleryModal = document.getElementById('destinationGalleryModal');
  const destinationGalleryTitle = document.getElementById('destinationGalleryTitle');
  const destinationGalleryGrid = document.getElementById('destinationGalleryGrid');
  const destinationGalleryClose = document.getElementById('destinationGalleryClose');

  function closeDestinationGallery() {
    destinationGalleryModal?.classList.remove('open');
    destinationGalleryModal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.destination-gallery-trigger').forEach(button => {
    button.addEventListener('click', () => {
      const destination = destinationGalleryData[button.dataset.destinationGallery];
      if (!destination || !destinationGalleryGrid || !destinationGalleryTitle) return;

      destinationGalleryTitle.textContent = destination.title;
      destinationGalleryGrid.replaceChildren();
      const gallerySlotCount = Math.max(3, destination.photos.length);
      for (let index = 0; index < gallerySlotCount; index += 1) {
        const photoPath = destination.photos[index];
        const figure = document.createElement('figure');
        figure.className = 'mini-gallery-slot';

        if (photoPath) {
          const image = document.createElement('img');
          image.src = photoPath;
          image.alt = `${destination.title} photo ${index + 1}`;
          image.loading = 'lazy';
          figure.appendChild(image);
        } else {
          const placeholder = document.createElement('div');
          placeholder.className = 'mini-gallery-placeholder';
          placeholder.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>Photo slot</span>';
          figure.appendChild(placeholder);
        }

        const caption = document.createElement('figcaption');
        caption.textContent = photoPath ? `Photo ${index + 1}` : `Add photo ${index + 1} later`;
        figure.appendChild(caption);
        destinationGalleryGrid.appendChild(figure);
      }

      const galleryImages = Array.from(destinationGalleryGrid.querySelectorAll('.mini-gallery-slot img'));
      galleryImages.forEach((image, index) => {
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-label', `View ${image.alt} full size`);
        image.addEventListener('click', () => openLightbox(index, galleryImages));
        image.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLightbox(index, galleryImages);
          }
        });
      });

      destinationGalleryModal.classList.add('open');
      destinationGalleryModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      destinationGalleryClose?.focus();
    });
  });

  destinationGalleryClose?.addEventListener('click', closeDestinationGallery);
  destinationGalleryModal?.addEventListener('click', event => {
    if (event.target === destinationGalleryModal) closeDestinationGallery();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && destinationGalleryModal?.classList.contains('open')
      && !lightboxModal?.classList.contains('active')) {
      closeDestinationGallery();
    }
  });

  const tourRouteStops = {
    'trip-01': Object.values(tripOneDestinations),
    'trip-02': [
      { title: 'Ramboda Waterfall', coordinates: [7.046, 80.705] },
      { title: 'Damro Tea Factory', coordinates: [7.012, 80.723] },
      { title: 'Bluefield Tea Factory', coordinates: [7.025, 80.704] },
      { title: 'Ramboda View Point', coordinates: [7.052, 80.704] }
    ],
    'trip-03': [
      { title: 'Victoria Botanical Garden', coordinates: [6.971, 80.768] },
      { title: 'Gregory Lake', coordinates: [6.955, 80.783] },
      { title: 'Moonplain', coordinates: [6.973, 80.819] },
      { title: 'Pedro Estate', coordinates: [6.989, 80.800] }
    ],
    'trip-04': [
      { title: 'Mandaram Nuwara Village', coordinates: [7.015, 80.747] },
      { title: 'Mandaram Nuwara Tea Estate', coordinates: [7.023, 80.738] }
    ],
    'trip-05': [
      { title: 'Nuwara Eliya City', coordinates: [6.969, 80.768] },
      { title: 'Victoria', coordinates: [6.971, 80.768] },
      { title: 'Gregory Lake', coordinates: [6.955, 80.783] },
      { title: 'Moonplain', coordinates: [6.973, 80.819] }
    ],
    'trip-06': [
      { title: 'World’s End', coordinates: [6.802, 80.797] },
      { title: 'Ambewela', coordinates: [6.901, 80.821] },
      { title: 'Jagro', coordinates: [6.911, 80.827] },
      { title: 'Horton Plains', coordinates: [6.810, 80.795] }
    ]
  };

  const routeMapInstances = new Map();

  function appendRouteSummaryStop(summary, stop, markerClass) {
    const row = document.createElement('div');
    row.className = 'route-map-summary-stop';
    const marker = document.createElement('span');
    marker.className = markerClass;
    marker.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = stop.title;
    row.append(marker, label);
    summary.appendChild(row);
  }

  function addRouteMap(card, tripId, stops) {
    const tripNumber = tripId.slice(-2);
    const itineraryDrawer = card.querySelector('.itinerary-drawer');
    if (!itineraryDrawer || stops.length < 2) return;

    const toggle = document.createElement('button');
    toggle.className = 'route-map-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `<span>Trip ${tripNumber} Route Map</span><span class="route-map-arrow" aria-hidden="true">▼</span>`;

    const drawer = document.createElement('div');
    drawer.className = 'route-map-drawer';
    drawer.setAttribute('aria-hidden', 'true');

    const frame = document.createElement('div');
    frame.className = 'trip-route-map-frame';
    const mapElement = document.createElement('div');
    mapElement.id = `tripRouteMap${tripNumber}`;
    mapElement.className = 'trip-route-map';
    mapElement.setAttribute('role', 'application');
    mapElement.setAttribute('aria-label', `Road map showing the Trip ${tripNumber} route between ${stops.length} destinations`);

    const summary = document.createElement('div');
    summary.className = 'route-map-summary';
    summary.setAttribute('aria-label', 'Trip route stops');
    appendRouteSummaryStop(summary, stops[0], 'route-map-origin-dot');

    if (stops.length > 2) {
      const middle = document.createElement('div');
      middle.className = 'route-map-summary-middle';
      const dots = document.createElement('span');
      dots.setAttribute('aria-hidden', 'true');
      dots.textContent = '⋮';
      const count = document.createElement('span');
      count.textContent = `${stops.length - 2} scenic stops`;
      middle.append(dots, count);
      summary.appendChild(middle);
    }

    appendRouteSummaryStop(summary, stops[stops.length - 1], 'route-map-destination-pin');

    const directionsUrl = new URL('https://www.google.com/maps/dir/');
    directionsUrl.searchParams.set('api', '1');
    directionsUrl.searchParams.set('origin', `${stops[0].title}, Sri Lanka`);
    directionsUrl.searchParams.set('destination', `${stops[stops.length - 1].title}, Sri Lanka`);
    directionsUrl.searchParams.set('travelmode', 'driving');
    if (stops.length > 2) {
      directionsUrl.searchParams.set('waypoints', stops.slice(1, -1).map(stop => `${stop.title}, Sri Lanka`).join('|'));
    }
    const directions = document.createElement('a');
    directions.className = 'route-map-directions';
    directions.href = directionsUrl.href;
    directions.target = '_blank';
    directions.rel = 'noopener noreferrer';
    directions.textContent = 'Open directions';
    summary.appendChild(directions);

    const caption = document.createElement('p');
    caption.className = 'route-map-caption';
    caption.textContent = stops.map(stop => stop.title).join(' · ');
    frame.append(mapElement, summary);
    drawer.append(frame, caption);
    itineraryDrawer.after(toggle, drawer);

    toggle.addEventListener('click', () => {
      const isOpening = !drawer.classList.contains('open');
      drawer.classList.toggle('open', isOpening);
      drawer.setAttribute('aria-hidden', String(!isOpening));
      toggle.setAttribute('aria-expanded', String(isOpening));
      const arrow = toggle.querySelector('.route-map-arrow');
      if (arrow) arrow.textContent = isOpening ? '▲' : '▼';
      if (!isOpening) return;

      if (!window.L) {
        mapElement.innerHTML = '<div class="route-map-fallback"><strong>Road map unavailable</strong><span>Check your internet connection to load the map.</span></div>';
        return;
      }

      const existingMap = routeMapInstances.get(mapElement);
      if (existingMap) {
        window.requestAnimationFrame(() => existingMap.invalidateSize());
        return;
      }

      const map = L.map(mapElement, { scrollWheelZoom: false });
      routeMapInstances.set(mapElement, map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const routeCoordinates = stops.map(stop => stop.coordinates);
      const routeLine = L.polyline(routeCoordinates, {
        color: '#163ecb',
        weight: 7,
        opacity: 0.92,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      stops.forEach((stop, index) => {
        const stopIcon = L.divIcon({
          className: 'route-stop-icon-wrap',
          html: `<span class="route-stop-icon">${String.fromCharCode(65 + index)}</span>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        const popup = document.createElement('strong');
        popup.textContent = `${index + 1}. ${stop.title}`;
        L.marker(stop.coordinates, { icon: stopIcon }).addTo(map).bindPopup(popup);
      });
      map.fitBounds(routeLine.getBounds(), { padding: [35, 35] });

      const osrmCoordinates = stops.map(stop => `${stop.coordinates[1]},${stop.coordinates[0]}`).join(';');
      fetch(`https://router.project-osrm.org/route/v1/driving/${osrmCoordinates}?overview=full&geometries=geojson&steps=false`)
        .then(response => {
          if (!response.ok) throw new Error('Route service unavailable');
          return response.json();
        })
        .then(data => {
          const roadRoute = data.routes?.[0]?.geometry?.coordinates;
          if (!roadRoute?.length) return;
          routeLine.setLatLngs(roadRoute.map(([longitude, latitude]) => [latitude, longitude]));
          map.fitBounds(routeLine.getBounds(), { padding: [35, 35] });
        })
        .catch(() => { });
    });
  }

  document.querySelectorAll('.tour-card').forEach((card, index) => {
    const tripId = `trip-${String(index + 1).padStart(2, '0')}`;
    addRouteMap(card, tripId, tourRouteStops[tripId] || []);
  });

  /* ==========================================================================
     5. DESTINATION EXPLORER INTERACTIVE TABS
     ========================================================================== */
  const destinationsData = {
    'lake-gregory': {
      title: 'Lake Gregory & Waterfront Promenade',
      tag: 'Leisure & Water Sports',
      img: 'assets/images/lake gregory/lake-gregory-1.jpg',
      desc: 'Nestled in the heart of Nuwara Eliya, Lake Gregory was created during the British colonial era under Governor Sir William Gregory in 1873. Surrounded by misty hills and alpine pine trees, it is the premier spot for scenic water motor-boating, swans pedal-boating, horse riding along the banks, jet skis, and tranquil sunset walks.',
      chips: ['1,868m Elevation', 'Ideal for Families & Couples', '5 mins from Town Center', 'Open 6:00 AM - 7:00 PM']
    },
    'bomburu-ella': {
      title: 'Bomburu Ella Waterfall (Widest Waterfall)',
      tag: 'Untamed Valley Adventure',
      img: 'assets/images/boburu ella/bomburu-ella-waterfall.jpg',
      desc: 'A breathtaking hidden natural wonder located in Perawella near Welimada and Nuwara Eliya. Bomburu Ella (also called Perawella Falls) is famously known as the widest waterfall in Sri Lanka, cascading into numerous natural jungle pools over towering granite cliffs. Our guided trek winds through lush vegetable terrace valleys and mountain rainforests.',
      chips: ['Widest Waterfall in Sri Lanka', 'Guided Nature Trek (1.5 hrs)', 'Hidden Jungle Pools', 'Private Scenic Picnic Lunch']
    },
    'pedro-tea': {
      title: 'Pedro Tea Estate & Lover’s Leap Trail',
      tag: 'Ceylon Tea Heritage',
      img: 'assets/images/pedro estate/p3.jpg',
      desc: 'Perched under Mount Pidurutalagala, Sri Lanka’s highest peak, Pedro Estate was established in 1885 and still manufactures authentic Ceylon light-liquor highland tea using 19th-century British machinery. Walk hand-in-hand through velvet green tea bushes, learn the art of orthodox two-leaves-and-a-bud plucking, and savor a freshly brewed cup on the veranda.',
      chips: ['Est. 1885 Colonial Heritage', 'Factory Demonstration', 'Pidurutalagala Mountain Base', 'Artisanal Tea Tasting']
    },
    'horton-plains': {
      title: 'Horton Plains National Park & World’s End',
      tag: 'UNESCO Cloud Forest Biosphere',
      img: 'assets/images/hortan plain/28de9f2b3257e65f9eaf62d42597606b.jpg',
      desc: 'A hauntingly mystical plateau at 2,100 meters above sea level where windswept grasslands meet montane cloud forests. The early morning hike reaches the legendary "World’s End", a sheer vertical precipice that plunges 4,000 feet straight down into tea estates below, followed by the roaring crystal waters of Baker’s Falls.',
      chips: ['UNESCO World Heritage', '4,000 ft Sheer Drop Cliff', 'Baker’s Falls Hike', 'Dawn Departures Recommended']
    },
    'colonial-town': {
      title: 'Colonial "Little England" Heritage Tour',
      tag: 'Colonial Architecture & Gardens',
      img: 'assets/images/nuwara eliya/01.jpg',
      desc: 'Explore Nuwara Eliya’s colonial-era character on a privately arranged heritage tour. See Tudor-style architecture, stroll through manicured gardens, pass the historic golf club, and enjoy optional Ceylon high tea at the Grand Hotel.',
      chips: ['Colonial-Era Architecture', 'Tudor Revival Style', 'Grand Hotel High Tea', 'Victoria Botanical Gardens']
    }
  };

  const destTabs = document.querySelectorAll('.dest-tab');
  const destPreviewImg = document.getElementById('destPreviewImg');
  const destPreviewTitle = document.getElementById('destPreviewTitle');
  const destPreviewTag = document.getElementById('destPreviewTag');
  const destPreviewDesc = document.getElementById('destPreviewDesc');
  const destChipsContainer = document.getElementById('destChipsContainer');

  destTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      destTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const destKey = tab.getAttribute('data-dest');
      const data = destinationsData[destKey];
      if (data) {
        if (destPreviewImg) {
          destPreviewImg.src = data.img;
          destPreviewImg.alt = data.title;
        }
        if (destPreviewTitle) destPreviewTitle.textContent = data.title;
        if (destPreviewTag) destPreviewTag.textContent = data.tag;
        if (destPreviewDesc) destPreviewDesc.textContent = data.desc;

        if (destChipsContainer) {
          destChipsContainer.innerHTML = '';
          data.chips.forEach(chip => {
            const span = document.createElement('span');
            span.className = 'dest-chip';
            span.textContent = chip;
            destChipsContainer.appendChild(span);
          });
        }
      }
    });
  });

  /* ==========================================================================
     6. PHOTO GALLERY & LIGHTBOX
     ========================================================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');

  let currentGalleryIndex = 0;
  let currentLightboxItems = [];
  const visibleGalleryItems = () => Array.from(document.querySelectorAll('.gallery-item')).filter(item => item.style.display !== 'none');

  function openLightbox(index, items = visibleGalleryItems()) {
    if (index >= 0 && index < items.length) {
      currentGalleryIndex = index;
      currentLightboxItems = items;
      const targetItem = items[index];
      const img = targetItem instanceof HTMLImageElement ? targetItem : targetItem.querySelector('img');
      const title = targetItem instanceof HTMLImageElement
        ? targetItem.alt
        : targetItem.querySelector('.gallery-item-title')?.textContent || '';
      const location = targetItem instanceof HTMLImageElement
        ? ''
        : targetItem.querySelector('.gallery-item-location')?.textContent || '';

      if (lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxImg.classList.remove('lightbox-img-enter');
        void lightboxImg.offsetWidth;
        lightboxImg.classList.add('lightbox-img-enter');
      }
      if (lightboxCaption) lightboxCaption.textContent = location ? `${title} • ${location}` : title;
      lightboxModal?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    lightboxModal?.classList.remove('active');
    document.body.style.overflow = destinationGalleryModal?.classList.contains('open') ? 'hidden' : '';
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const items = visibleGalleryItems();
      const currentIdx = items.indexOf(item);
      openLightbox(currentIdx);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => {
    const items = currentLightboxItems;
    currentGalleryIndex = (currentGalleryIndex - 1 + items.length) % items.length;
    openLightbox(currentGalleryIndex, items);
  });
  lightboxNext?.addEventListener('click', () => {
    const items = currentLightboxItems;
    currentGalleryIndex = (currentGalleryIndex + 1) % items.length;
    openLightbox(currentGalleryIndex, items);
  });

  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev?.click();
    if (e.key === 'ArrowRight') lightboxNext?.click();
  });

  // Gallery Category Filter
  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-gallery-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-gallery-category');
        if (filter === 'all' || itemCategory.includes(filter)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     7. FAQ ACCORDION
     ========================================================================== */
  document.querySelectorAll('.faq-item').forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(other => other.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     8. INSTANT BOOKING MODAL & DYNAMIC WHATSAPP LINK GENERATOR
     ========================================================================== */
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openModalBtns = document.querySelectorAll('.js-open-modal');
  const modalTourSelect = document.getElementById('modalTourSelect');
  const modalGuestsSelect = document.getElementById('modalGuestsSelect');
  const modalVehicleSelect = document.getElementById('modalVehicleSelect');
  const modalDateInput = document.getElementById('modalDateInput');
  const modalEstimatePrice = document.getElementById('modalEstimatePrice');
  const modalEstimateBreakdown = document.getElementById('modalEstimateBreakdown');
  const modalEstimateUnit = document.getElementById('modalEstimateUnit');
  const whatsappSubmitBtn = document.getElementById('whatsappSubmitBtn');
  const bookingForm = document.getElementById('bookingForm');
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');
  const vehicleFitsPassengerCount = (vehicle, passengerCount) => {
    if (vehicle === 'three-wheeler') return passengerCount <= 2;
    if (vehicle === 'car') return passengerCount <= 3;
    if (vehicle === 'van') return passengerCount >= 4;
    return false;
  };
  function updateVehicleAvailability(passengersSelect, vehicleSelect) {
    if (!passengersSelect || !vehicleSelect) return;
    const passengerCount = Number(passengersSelect.value);

    Array.from(vehicleSelect.options).forEach(option => {
      option.disabled = Boolean(option.value) &&
        !vehicleFitsPassengerCount(option.value, passengerCount);
    });

    const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
    if (selectedOption?.disabled) {
      const firstAvailableVehicle = Array.from(vehicleSelect.options)
        .find(option => option.value && !option.disabled);
      vehicleSelect.value = firstAvailableVehicle?.value || '';
    }
  }
  // Set min date on date inputs to today
  const todayStr = new Date().toISOString().split('T')[0];
  if (modalDateInput) modalDateInput.min = todayStr;
  const heroDateInput = document.getElementById('heroDateInput');
  if (heroDateInput) heroDateInput.min = todayStr;

  function showToast(msg) {
    if (!toastNotice) return;
    if (toastMessage) toastMessage.textContent = msg;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 4500);
  }

  function openBookingModal(preselectedTour = 'trip-01') {
    updateVehicleAvailability(modalGuestsSelect, modalVehicleSelect);
    if (modalTourSelect) modalTourSelect.value = preselectedTour;
    calculateModalPrice();
    bookingModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    bookingModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tourKey = btn.getAttribute('data-tour') || 'little-england';
      openBookingModal(tourKey);
    });
  });

  modalCloseBtn?.addEventListener('click', closeBookingModal);
  bookingModal?.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });

  // Calculate dynamic price
  function calculateModalPrice() {
    if (!modalTourSelect || !modalGuestsSelect || !modalEstimatePrice) return;
    const tourKey = modalTourSelect.value;

    const basePriceUSD = tourPrices[tourKey] || 45;
    const vehicleSurchargeUSD = vehicleSurchargesUSD[modalVehicleSelect?.value] || 0;
    const totalUSD = basePriceUSD + vehicleSurchargeUSD;

    // Convert to current currency
    const { symbol, rate } = currencyRates[currentCurrency];
    const totalFractionDigits = currentCurrency !== 'LKR' && tourKey.startsWith('trip-') ? 2 : 0;
    const convertedTotal = totalUSD * rate;
    const fractionDigits = currentCurrency === 'LKR' ? 0 : 2;
    const selectedVehicle = modalVehicleSelect?.options[modalVehicleSelect.selectedIndex]?.text.split(' (')[0]
      || 'Three-wheeler';

    const formattedTotal = `${symbol}${convertedTotal.toLocaleString(undefined, {
      minimumFractionDigits: totalFractionDigits,
      maximumFractionDigits: totalFractionDigits
    })}`;
    modalEstimatePrice.textContent = formattedTotal;
    if (modalEstimateBreakdown) modalEstimateBreakdown.textContent = `${selectedVehicle} · ${modalTourSelect.options[modalTourSelect.selectedIndex]?.text || 'Selected tour'}`;
    if (modalEstimateUnit) modalEstimateUnit.textContent = 'Flat rate per vehicle';
    return { totalUSD, convertedTotal, formattedTotal, symbol };
  }

  // Bind change events to recalculate live
  [modalTourSelect, modalGuestsSelect, modalVehicleSelect].forEach(el => {
    el?.addEventListener('change', calculateModalPrice);
  });
  modalGuestsSelect?.addEventListener('change', () => {
    updateVehicleAvailability(modalGuestsSelect, modalVehicleSelect);
    calculateModalPrice();
  });

  // Handle WhatsApp booking submission
  if (whatsappSubmitBtn) {
    whatsappSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = document.getElementById('modalNameInput')?.value.trim();
      const phone = document.getElementById('modalPhoneInput')?.value.trim();
      const travelDate = document.getElementById('modalDateInput')?.value || 'Upcoming dates to be discussed';
      const tourName = modalTourSelect?.options[modalTourSelect.selectedIndex]?.text || 'Nuwara Eliya Tour';
      const guests = modalGuestsSelect?.value || '2';
      const vehicle = modalVehicleSelect?.options[modalVehicleSelect.selectedIndex]?.text || 'Private AC Sedan';
      const notes = document.getElementById('modalNotesInput')?.value.trim() || 'None';

      const priceData = calculateModalPrice();
      const estPrice = priceData ? priceData.formattedTotal : '$90';

      if (!modalVehicleSelect?.value ||
        !vehicleFitsPassengerCount(modalVehicleSelect.value, Number(guests))) {
        showToast('Choose a vehicle that fits the number of travelers.');
        modalVehicleSelect?.focus();
        return;
      }

      if (!name) {
        alert('Please provide your name so our tour manager can address you properly.');
        document.getElementById('modalNameInput')?.focus();
        return;
      }

      const messageLines = [
        '🌿 *HIGHLAND HERITAGE TRAVELS - TOUR BOOKING REQUEST* 🌿',
        '',
        `👤 *Guest Name:* ${name}`,
        `📱 *Contact / WhatsApp:* ${phone || 'Not provided'}`,
        `🏔️ *Selected Tour:* ${tourName}`,
        `📅 *Planned Travel Date:* ${travelDate}`,
        `👥 *Number of Travelers:* ${guests} Guests`,
        `🚗 *Vehicle Preference:* ${vehicle}`
      ];

      messageLines.push(
        `💰 *Estimated Vehicle Cost:* ${estPrice} (${currentCurrency}) per vehicle`,
        `📝 *Special Notes/Requests:* ${notes}`,
        '',
        '_Please confirm availability and help me complete this booking._'
      );

      const message = messageLines.join('\n');
      const whatsappUrl = `https://wa.me/${defaultWhatsAppNumber}?${new URLSearchParams({ text: message })}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Close modal and show celebration toast
      closeBookingModal();
      showToast(`Thank you ${name}! Opening WhatsApp to chat with your Nuwara Eliya tour specialist...`);
    });
  }

  // Hero Quick Booking form handling
  const heroBookingBtn = document.getElementById('heroBookingBtn');
  const heroVehicleSelect = document.getElementById('heroVehicleSelect');
  const heroPricePreview = document.getElementById('heroVehiclePricePreview');
  const heroTourSelect = document.getElementById('heroTourSelect');
  const heroGuestsSelect = document.getElementById('heroGuestsSelect');

  updateVehicleAvailability(heroGuestsSelect, heroVehicleSelect);
  updateVehicleAvailability(modalGuestsSelect, modalVehicleSelect);

  function updateHeroVehiclePrice() {
    if (!heroVehicleSelect || !heroPricePreview) return;
    const selectedVehicle = heroVehicleSelect.value;
    heroPricePreview.hidden = !selectedVehicle;
    if (!selectedVehicle) return;

    const tourKey = heroTourSelect?.value || 'trip-01';
    const pricePerGuestUSD = (tourPrices[tourKey] || 45) + (vehicleSurchargesUSD[selectedVehicle] || 0);
    const { symbol, rate } = currencyRates[currentCurrency];
    const fractionDigits = currentCurrency !== 'LKR' && tourKey.startsWith('trip-') ? 2 : 0;
    const vehiclePrice = pricePerGuestUSD * rate;
    const formatPrice = amount => amount.toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
    heroPricePreview.textContent = `${symbol}${formatPrice(vehiclePrice)} total per vehicle`;
  }

  heroVehicleSelect?.addEventListener('change', updatePrices);
  [heroTourSelect, heroGuestsSelect].forEach(input => {
    input?.addEventListener('change', updateHeroVehiclePrice);
  });
  heroGuestsSelect?.addEventListener('change', () => {
    updateVehicleAvailability(heroGuestsSelect, heroVehicleSelect);
    updatePrices();
  });

  if (heroBookingBtn) {
    heroBookingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const heroTour = heroTourSelect?.value || 'little-england';
      const heroDate = document.getElementById('heroDateInput')?.value;
      const heroGuests = heroGuestsSelect?.value || '2';

      if (modalDateInput && heroDate) modalDateInput.value = heroDate;
      if (modalGuestsSelect && heroGuests) modalGuestsSelect.value = heroGuests;
      updateVehicleAvailability(modalGuestsSelect, modalVehicleSelect);
      if (modalVehicleSelect && heroVehicleSelect?.value &&
        vehicleFitsPassengerCount(heroVehicleSelect.value, Number(heroGuests))) {
        modalVehicleSelect.value = heroVehicleSelect.value;
      }

      openBookingModal(heroTour);
    });
  }

  // Direct WhatsApp buttons on tour cards
  document.querySelectorAll('.btn-card-whatsapp').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tourTitle = btn.getAttribute('data-tour-title') || 'Nuwara Eliya Tour';
      const tourPrice = btn.getAttribute('data-tour-price') || '$45';
      const text = `🌿 *Highland Heritage Travels Inquiry* 🌿%0A%0A` +
        `Hello! I am interested in booking the *${encodeURIComponent(tourTitle)}* (Starting from ${encodeURIComponent(tourPrice)}).%0A%0A` +
        `Could you please share availability, vehicle options, and itinerary details?`;
      window.open(`https://wa.me/${defaultWhatsAppNumber}?text=${text}`, '_blank');
    });
  });

  // Initialize prices on first load
  updatePrices();

  // Subtle live weather simulation for Nuwara Eliya
  const weatherTempEl = document.getElementById('liveTemp');
  if (weatherTempEl) {
    // Nuwara Eliya averages 14-17°C during the day
    const hour = new Date().getHours();
    let temp = (hour >= 18 || hour <= 6) ? 14 : 17;
    weatherTempEl.textContent = `${temp}°C`;
  }
});
