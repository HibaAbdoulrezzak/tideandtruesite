document.addEventListener("DOMContentLoaded", () => {
	// ====== Carousels ======
	function initializeCarousel(
		carouselId,
		numVisibleSlides = 1,
		autoSlideIntervalTime = 5000
	) {
		const carouselSection = document.getElementById(carouselId);
		if (!carouselSection) return;

		const slidesContainer =
			carouselSection.querySelector(".carousel-slides");
		const slides = carouselSection.querySelectorAll(".carousel-slide");
		const dots = carouselSection.querySelectorAll(".dot");
		const prevBtn = carouselSection.querySelector(".carousel-prev");
		const nextBtn = carouselSection.querySelector(".carousel-next");

		let currentSlideIndex = 0;
		let autoSlideTimer;

		slides.forEach((slide) => {
			slide.style.minWidth = `${100 / numVisibleSlides}%`;
		});

		function updateCarouselPosition() {
			const translateXValue = -(
				currentSlideIndex *
				(100 / numVisibleSlides)
			);
			if (slidesContainer)
				slidesContainer.style.transform = `translateX(${translateXValue}%)`;
			dots.forEach((dot, index) =>
				dot.classList.toggle("active", index === currentSlideIndex)
			);
		}

		function maxIndex() {
			return Math.max(0, slides.length - numVisibleSlides);
		}

		function nextSlide() {
			const m = maxIndex();
			currentSlideIndex =
				currentSlideIndex < m ? currentSlideIndex + 1 : 0;
			updateCarouselPosition();
		}

		function prevSlide() {
			const m = maxIndex();
			currentSlideIndex =
				currentSlideIndex > 0 ? currentSlideIndex - 1 : m;
			updateCarouselPosition();
		}

		function startAutoSlide() {
			stopAutoSlide();
			autoSlideTimer = setInterval(nextSlide, autoSlideIntervalTime);
		}
		function stopAutoSlide() {
			if (autoSlideTimer) clearInterval(autoSlideTimer);
		}

		nextBtn?.addEventListener("click", () => {
			stopAutoSlide();
			nextSlide();
			startAutoSlide();
		});
		prevBtn?.addEventListener("click", () => {
			stopAutoSlide();
			prevSlide();
			startAutoSlide();
		});
		dots.forEach((dot, index) =>
			dot.addEventListener("click", () => {
				stopAutoSlide();
				currentSlideIndex = index;
				updateCarouselPosition();
				startAutoSlide();
			})
		);

		if (slides.length) {
			updateCarouselPosition();
			startAutoSlide();
		}
	}

	// init carousels
	initializeCarousel("carousel-section", 1, 5000);
	initializeCarousel("image-card-carousel", 3, 7000);

	// ====== Scroll-in animations ======
	const els = Array.from(document.querySelectorAll("[data-animate]"));
	els.forEach((el) => {
		const parent = el.parentElement;
		if (parent?.hasAttribute("data-stagger")) {
			const siblings = Array.from(parent.children).filter((c) =>
				c.matches("[data-animate]")
			);
			siblings.forEach((sib, i) => sib.style.setProperty("--index", i));
		}
		if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay;
	});

	const onIntersect = (entries, observer) => {
		entries.forEach((entry) => {
			const el = entry.target;
			const repeat = el.dataset.repeat === "true";
			if (entry.isIntersecting) {
				el.classList.add("show");
				if (!repeat) observer.unobserve(el);
			} else if (repeat) {
				el.classList.remove("show");
			}
		});
	};

	if ("IntersectionObserver" in window) {
		const observer = new IntersectionObserver(onIntersect, {
			threshold: 0.12,
			rootMargin: "0px 0px -10% 0px",
		});
		els.forEach((el) => observer.observe(el));
	} else {
		const revealIfInView = () => {
			const vh =
				window.innerHeight || document.documentElement.clientHeight;
			els.forEach((el) => {
				if (el.getBoundingClientRect().top < vh * 0.88)
					el.classList.add("show");
			});
		};
		window.addEventListener("scroll", revealIfInView, { passive: true });
		window.addEventListener("resize", revealIfInView);
		revealIfInView();
	}

	// ====== Mobile nav (single source of truth) ======
	const btn = document.querySelector(".nav-toggle");
	const nav = document.getElementById("site-nav");
	if (btn && nav) {
		const setState = (open) => {
			document.body.classList.toggle("nav-open", open);
			btn.setAttribute("aria-expanded", String(open));
			btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		};
		btn.addEventListener("click", () =>
			setState(!document.body.classList.contains("nav-open"))
		);
		nav.addEventListener("click", (e) => {
			if (e.target.closest("a")) setState(false);
		});
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") setState(false);
		});
	}
});
