document.addEventListener("DOMContentLoaded", () => {
	// =========================
	// CAROUSELS (pixel-based)
	// =========================
	function initializeCarousel(
		carouselId,
		numVisibleSlides = 1,
		autoSlideMs = 5000
	) {
		const root = document.getElementById(carouselId);
		if (!root) return;

		const track = root.querySelector(".carousel-slides");
		const slides = Array.from(root.querySelectorAll(".carousel-slide"));
		const dots = Array.from(root.querySelectorAll(".dot"));
		const prev = root.querySelector(".carousel-prev");
		const next = root.querySelector(".carousel-next");

		let index = 0;
		let timer = null;
		let slideW = 0;

		// Each slide takes equal fraction of the track width
		slides.forEach((s) => {
			s.style.minWidth = `${100 / numVisibleSlides}%`;
		});

		function measure() {
			// width of ONE slide (based on the first)
			slideW = slides[0]?.getBoundingClientRect().width || 0;
		}

		function go(to, withAnim = true) {
			if (!slides.length || !track) return;
			const max = Math.max(0, slides.length - numVisibleSlides);
			// wrap within range [0..max]
			index = ((to % (max + 1)) + (max + 1)) % (max + 1);

			track.style.transition = withAnim
				? "transform 0.5s ease-in-out"
				: "none";
			track.style.transform = `translateX(${-index * slideW}px)`;

			// update dots if present
			dots.forEach((d, i) => d.classList.toggle("active", i === index));
		}

		function nextSlide() {
			go(index + 1);
		}
		function prevSlide() {
			go(index - 1);
		}

		function start() {
			stop();
			if (autoSlideMs > 0) timer = setInterval(nextSlide, autoSlideMs);
		}
		function stop() {
			if (timer) clearInterval(timer);
		}

		// Controls
		next?.addEventListener("click", () => {
			stop();
			nextSlide();
			start();
		});
		prev?.addEventListener("click", () => {
			stop();
			prevSlide();
			start();
		});
		dots.forEach((d, i) =>
			d.addEventListener("click", () => {
				stop();
				go(i);
				start();
			})
		);

		// Resize (handles mobile URL bar & rotation)
		let rAF;
		const onResize = () => {
			cancelAnimationFrame(rAF);
			rAF = requestAnimationFrame(() => {
				measure();
				go(index, false);
			});
		};
		window.addEventListener("resize", onResize, { passive: true });

		// Init
		if (slides.length && track) {
			measure();
			go(0, false);
			start();
		}
	}

	// Init your two carousels
	initializeCarousel("carousel-section", 1, 5000);
	initializeCarousel("image-card-carousel", 3, 7000);

	// ===================================
	// SCROLL-IN ANIMATIONS (unchanged)
	// ===================================
	const animatedEls = Array.from(document.querySelectorAll("[data-animate]"));

	animatedEls.forEach((el) => {
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
		const io = new IntersectionObserver(onIntersect, {
			threshold: 0.12,
			rootMargin: "0px 0px -10% 0px",
		});
		animatedEls.forEach((el) => io.observe(el));
	} else {
		// Fallback
		const revealIfInView = () => {
			const vh =
				window.innerHeight || document.documentElement.clientHeight;
			animatedEls.forEach((el) => {
				if (el.getBoundingClientRect().top < vh * 0.88)
					el.classList.add("show");
			});
		};
		window.addEventListener("scroll", revealIfInView, { passive: true });
		window.addEventListener("resize", revealIfInView);
		revealIfInView();
	}

	// ==========================
	// MOBILE NAV (unchanged)
	// ==========================
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
