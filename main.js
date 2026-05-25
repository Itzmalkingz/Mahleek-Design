// Random Background Image Feature
const setBackground = () => {
    // List of background images from the portfolio
    const bgImages = [
        'images/workspace.jpg',
        'images/branding-module-1.png',
        'images/branding-module-2.png',
        'images/branding-module-3.png',
        'images/branding-module-4.png',
        'images/branding-module-5.png',
        'images/logo-designs-01.jpg',
        'images/logo-designs-02.jpg',
        'images/social-media-design-01.jpeg',
        'images/social-media-flyers-01.png',
        'images/vela-branding-01.jpeg',
        'images/clothing-brand-01.jpeg',
        'images/quote-cards-01.jpg',
        'images/business-cards-01.jpg',
        'images/client-testimonials-01.jpg'
    ];

    // Pick a random image
    const originalImage = bgImages[Math.floor(Math.random() * bgImages.length)];
    const randomImage = assetPath(originalImage);

    // Create an image element to preload
    const img = new Image();
    img.src = randomImage;

    img.onload = () => {
        document.body.style.setProperty('--bg-image', `url('${randomImage}')`);
        document.body.classList.add('bg-image-loaded');
    };

    // Fallback: apply the original raster image if an optimized version is missing.
    img.onerror = () => {
        if (randomImage !== originalImage) {
            document.body.style.setProperty('--bg-image', `url('${originalImage}')`);
            document.body.classList.add('bg-image-loaded');
            return;
        }

        console.warn('Background image failed to load, using gradient only');
    };
};

const scrollProgress = document.getElementById('scrollProgress');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes = Array.from(document.querySelectorAll('[data-scene]'));
const revealElements = Array.from(document.querySelectorAll('.reveal'));
let ticking = false;

const optimizedImageFormat = document.documentElement.dataset.imageFormat;
const shouldUseOptimizedImages = optimizedImageFormat === 'webp' || optimizedImageFormat === 'avif';
const rasterImagePattern = /\.(png|jpe?g)$/i;

const assetPath = (src) => (
    shouldUseOptimizedImages && rasterImagePattern.test(src)
        ? src.replace(rasterImagePattern, `.${optimizedImageFormat}`)
        : src
);

const setImageSource = (image, originalSrc) => {
    if (!image || !originalSrc) return;

    const optimizedSrc = assetPath(originalSrc);
    image.onerror = null;

    if (optimizedSrc !== originalSrc) {
        image.onerror = () => {
            image.onerror = null;
            image.src = originalSrc;
        };
    }

    image.src = optimizedSrc;
};

const upgradeStaticImages = () => {
    document.querySelectorAll('img[src^="images/"]').forEach((image) => {
        setImageSource(image, image.getAttribute('src'));
    });
};

const trackConversion = (eventName, details = {}) => {
    const payload = {
        event: eventName,
        ...details
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    console.info('[conversion]', payload);
};

const enhancePointer = () => {
    if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursorGlow);

    window.addEventListener('pointermove', (event) => {
        cursorGlow.style.setProperty('--cursor-x', `${event.clientX}px`);
        cursorGlow.style.setProperty('--cursor-y', `${event.clientY}px`);
    }, { passive: true });

    document.querySelectorAll('.magnetic').forEach((element) => {
        element.addEventListener('pointermove', (event) => {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            element.style.transform = `translate(${x * 0.08}px, ${y * 0.18}px)`;
        });

        element.addEventListener('pointerleave', () => {
            element.style.transform = '';
        });
    });
};

const setProjectAccents = () => {
    document.querySelectorAll('.project-panel').forEach((panel) => {
        const accent = panel.getAttribute('data-accent');
        if (accent) {
            panel.style.setProperty('--panel-accent', accent);
        }
    });
};

const updateScrollProgress = () => {
    if (!scrollProgress) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    scrollProgress.style.height = `${Math.min(progress * 100, 100)}%`;
};

const updateParallax = () => {
    if (prefersReducedMotion) return;

    const viewportHeight = window.innerHeight;
    scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        const sceneProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        scene.querySelectorAll('[data-depth]').forEach((layer) => {
            const depth = Number(layer.getAttribute('data-depth')) || 0;
            const movement = (sceneProgress - 0.5) * depth * 150;
            layer.style.setProperty('--parallax-y', `${movement}px`);
        });
    });
};

const updateFrame = () => {
    updateScrollProgress();
    updateParallax();
    ticking = false;
};

const requestFrame = () => {
    if (!ticking) {
        requestAnimationFrame(updateFrame);
        ticking = true;
    }
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -5% 0px'
});

revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 60}ms`;
    revealObserver.observe(element);
});

document.querySelectorAll('.project-panel[data-link]').forEach((panel) => {
    const openProject = () => {
        const link = panel.getAttribute('data-link');
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    };

    panel.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        openProject();
    });

    panel.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openProject();
        }
    });
});

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
    const setMenuOpen = (isOpen) => {
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        siteNav.classList.toggle('mobile-open', isOpen);
        document.body.classList.toggle('nav-open', isOpen);
    };

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        setMenuOpen(!isOpen);
    });

    siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 980) {
            setMenuOpen(false);
        }
    });
}

document.querySelectorAll('.whatsapp-cta').forEach((link) => {
    link.addEventListener('click', () => {
        trackConversion('whatsapp_cta_click', {
            action: link.dataset.conversion || 'whatsapp_click',
            label: link.textContent.trim(),
            href: link.href
        });
    });
});

const designGrid = document.getElementById('designGrid');

const buildNumberedItems = (title, category, slug, extensions) => (
    extensions.map((extension, index) => ({
        title: `${title} ${index + 1}`,
        category,
        src: `images/${slug}-${String(index + 1).padStart(2, '0')}.${extension}`
    }))
);

const designItems = [
    ...['png', 'png', 'png', 'png', 'png'].map((extension, index) => ({
        title: `Brand design ${index + 1}`,
        category: 'Brand materials',
        src: `images/branding-module-${index + 1}.${extension}`
    })),
    ...buildNumberedItems('Social media design', 'Post design', 'social-media-design', [
        'jpeg', 'png', 'png', 'png', 'png', 'png', 'jpg', 'jpg', 'png', 'png', 'png', 'png'
    ]),
    ...buildNumberedItems('Vela branding', 'Premium branding', 'vela-branding', [
        'jpeg', 'jpeg', 'jpeg'
    ]),
    ...buildNumberedItems('Clothing brand', 'Brand design', 'clothing-brand', [
        'jpeg', 'jpeg', 'jpeg', 'jpeg'
    ]),
    ...buildNumberedItems('Client testimonial', 'Social proof design', 'client-testimonials', [
        'jpg', 'jpg', 'jpg'
    ]),
    ...buildNumberedItems('Quote card', 'Typography design', 'quote-cards', [
        'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpeg', 'jpg', 'jpg', 'jpg'
    ]),
    ...buildNumberedItems('Business card', 'Print design', 'business-cards', [
        'jpg', 'png', 'png', 'png'
    ]),
    ...buildNumberedItems('Logo design', 'Logo design', 'logo-designs', [
        'jpg', 'jpg', 'png', 'png', 'png', 'png', 'png', 'png', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg'
    ]),
    ...buildNumberedItems('Social media flyer', 'Flyer design', 'social-media-flyers', [
        'png', 'jpeg', 'jpeg', 'png', 'png', 'png', 'png', 'png', 'png', 'jpeg', 'jpg', 'png', 'jpg', 'jpg',
        'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpeg', 'jpeg', 'jpeg', 'png', 'png', 'png', 'jpeg'
    ])
];
const normalizeAlbumTitle = (label) => label.replace(/\s+\d+$/, '').trim();

const groupDesignAlbums = (items) => {
    const groups = items.reduce((acc, item) => {
        const title = normalizeAlbumTitle(item.title);
        const key = title.toLowerCase();
        acc[key] = acc[key] || { title, category: item.category, items: [] };
        acc[key].items.push(item);
        return acc;
    }, {});

    return Object.values(groups).map((group) => {
        group.items.sort((a, b) => {
            const aIndex = Number(a.title.match(/(\d+)$/)?.[1] ?? 0);
            const bIndex = Number(b.title.match(/(\d+)$/)?.[1] ?? 0);
            return aIndex - bIndex;
        });
        group.cover = group.items[0];
        return group;
    });
};

const galleryModal = document.getElementById('galleryModal');
const galleryTitle = galleryModal?.querySelector('.gallery-title');
const galleryCounter = galleryModal?.querySelector('.gallery-counter');
const galleryImage = galleryModal?.querySelector('.gallery-preview img');
const galleryThumbs = galleryModal?.querySelector('.gallery-thumbnails');
const galleryPrev = galleryModal?.querySelector('.gallery-prev');
const galleryNext = galleryModal?.querySelector('.gallery-next');
const galleryClose = galleryModal?.querySelector('.modal-close');

let albums = [];
let currentAlbumIndex = 0;
let currentImageIndex = 0;

const updateGallery = () => {
    const album = albums[currentAlbumIndex];
    if (!album || !galleryImage || !galleryCounter) return;

    const item = album.items[currentImageIndex];
    setImageSource(galleryImage, item.src);
    galleryImage.alt = item.title;
    galleryCounter.textContent = `${currentImageIndex + 1} / ${album.items.length}`;

    galleryThumbs.querySelectorAll('.gallery-thumb').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
};

const openGallery = (albumIndex, imageIndex = 0) => {
    if (!galleryModal || !galleryImage || !galleryThumbs || !galleryTitle) return;
    albums = albums.length ? albums : groupDesignAlbums(designItems);
    currentAlbumIndex = albumIndex;
    currentImageIndex = imageIndex;
    const album = albums[currentAlbumIndex];
    if (!album) return;

    galleryTitle.textContent = album.title;
    galleryCounter.textContent = `${currentImageIndex + 1} / ${album.items.length}`;
    setImageSource(galleryImage, album.items[currentImageIndex].src);
    galleryImage.alt = album.items[currentImageIndex].title;
    galleryThumbs.innerHTML = '';

    album.items.forEach((item, index) => {
        const thumbButton = document.createElement('button');
        thumbButton.className = 'gallery-thumb';
        thumbButton.type = 'button';
        thumbButton.dataset.index = String(index);
        thumbButton.setAttribute('aria-label', `Show ${item.title}`);
        if (index === currentImageIndex) thumbButton.classList.add('active');

        const thumbImage = document.createElement('img');
        setImageSource(thumbImage, item.src);
        thumbImage.alt = item.title;
        thumbImage.loading = 'lazy';
        thumbImage.decoding = 'async';
        thumbButton.appendChild(thumbImage);

        thumbButton.addEventListener('click', () => {
            currentImageIndex = index;
            updateGallery();
        });

        galleryThumbs.appendChild(thumbButton);
    });

    galleryModal.classList.add('is-open');
    galleryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    galleryClose?.focus();
};

const closeGallery = () => {
    if (!galleryModal) return;
    galleryModal.classList.remove('is-open');
    galleryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

const navigateGallery = (direction) => {
    const album = albums[currentAlbumIndex];
    if (!album) return;
    const nextIndex = currentImageIndex + direction;
    if (nextIndex < 0 || nextIndex >= album.items.length) return;
    currentImageIndex = nextIndex;
    updateGallery();
};

if (designGrid) {
    albums = groupDesignAlbums(designItems);
    designGrid.innerHTML = '';
    albums.forEach((album, index) => {
        const button = document.createElement('button');
        button.className = 'behance-item album-trigger';
        button.type = 'button';
        button.dataset.albumIndex = String(index);
        button.setAttribute('aria-label', `Open ${album.title} album`);

        const thumb = document.createElement('div');
        thumb.className = 'thumb';

        const image = document.createElement('img');
        setImageSource(image, album.cover.src);
        image.alt = `${album.title} cover`;
        image.loading = 'lazy';
        image.decoding = 'async';

        const meta = document.createElement('div');
        meta.className = 'meta';

        const title = document.createElement('strong');
        title.textContent = album.title;

        const category = document.createElement('span');
        category.textContent = `${album.category} - ${album.items.length} images`;

        thumb.append(image);
        meta.append(title, category);
        button.append(thumb, meta);
        designGrid.append(button);

        button.addEventListener('click', () => openGallery(index));
    });
}

galleryPrev?.addEventListener('click', () => navigateGallery(-1));
galleryNext?.addEventListener('click', () => navigateGallery(1));
galleryClose?.addEventListener('click', closeGallery);

galleryModal?.addEventListener('click', (event) => {
    if (event.target === galleryModal) {
        closeGallery();
    }
});

window.addEventListener('keydown', (event) => {
    if (!galleryModal?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeGallery();
    if (event.key === 'ArrowRight') navigateGallery(1);
    if (event.key === 'ArrowLeft') navigateGallery(-1);
});

window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', requestFrame);

setProjectAccents();
upgradeStaticImages();
updateFrame();
setBackground();
enhancePointer();
