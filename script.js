document.addEventListener("DOMContentLoaded", () => {
	// =========================
	// SINGLE RESPONSIVE CAROUSEL
	// =========================
	function makeCarousel(
		id,
		{
			auto = 2500, // default auto-slide interval (ms)
			speed = 100, // default slide transition duration (ms)
			breakpoints = [{ max: Infinity, count: 1 }],
		} = {}
	) {
		const root = document.getElementById(id);
		if (!root) return;

		const track = root.querySelector(".carousel-slides");
		const slides = Array.from(root.querySelectorAll(".carousel-slide"));
		const prev = root.querySelector(".carousel-prev");
		const next = root.querySelector(".carousel-next");
		const dots = Array.from(root.querySelectorAll(".dot"));

		let index = 0,
			timer = null,
			visible = 1,
			stepX = 0;

		const getVisible = () => {
			const w = window.innerWidth;
			for (const bp of breakpoints) if (w <= bp.max) return bp.count;
			return 1;
		};

		const applyWidths = () => {
			visible = getVisible();
			const basis = `${100 / visible}%`;
			slides.forEach((s) => {
				s.style.flex = `0 0 ${basis}`;
				s.style.minWidth = basis;
				s.style.marginRight = "0";
			});
		};

		const measure = () => {
			if (!slides.length) {
				stepX = 0;
				return;
			}
			const cs = getComputedStyle(track);
			const gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;
			const w = slides[0].getBoundingClientRect().width;
			stepX = w + gap; // distance to move by 1 slide (incl. gap)
		};

		const maxIndex = () => Math.max(0, slides.length - visible);

		const go = (to, animate = true) => {
			const max = maxIndex();
			index = ((to % (max + 1)) + (max + 1)) % (max + 1);
			track.style.transition = animate
				? `transform ${speed}ms ease-in-out`
				: "none";
			track.style.transform = `translateX(${-index * stepX}px)`;
			dots.forEach((d, i) => d.classList.toggle("active", i === index));
		};

		const start = () => {
			stop();
			if (auto > 0) timer = setInterval(() => go(index + 1), auto);
		};
		const stop = () => {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		};

		next?.addEventListener("click", () => {
			stop();
			go(index + 1);
			start();
		});
		prev?.addEventListener("click", () => {
			stop();
			go(index - 1);
			start();
		});
		dots.forEach((d, i) =>
			d.addEventListener("click", () => {
				stop();
				go(i);
				start();
			})
		);

		const onResize = () => {
			applyWidths();
			measure();
			go(index, false);
		};
		window.addEventListener("resize", onResize, { passive: true });

		// Initial layout
		applyWidths();
		measure();
		go(0, false);
		start();

		// If images/fonts load after layout and width was 0, re-measure once
		if (stepX === 0) {
			requestAnimationFrame(() => {
				measure();
				go(index, false);
			});
		}
	}

	// HERO carousel: slower, smooth
	makeCarousel("carousel-section", {
		auto: 7000, // 7 seconds between slides
		speed: 600, // 0.6s transition
		breakpoints: [{ max: Infinity, count: 1 }],
	});

	// IMAGE CARD carousel: slower, still smooth
	makeCarousel("image-card-carousel", {
		auto: 6000, // 6 seconds between slides
		speed: 500, // 0.5s transition
		breakpoints: [
			{ max: 520, count: 1 },
			{ max: 768, count: 2 },
			{ max: Infinity, count: 3 },
		],
	});

	// ===================================
	// SCROLL-IN ANIMATIONS
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
	// MOBILE NAV
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

	// ==========================
	// FORM SUBMISSION FEEDBACK
	// ==========================
	(function () {
		const form = document.querySelector(".vogue-form");
		if (!form) return;
		form.addEventListener("submit", function () {
			const btn = form.querySelector('button[type="submit"]');
			if (btn) {
				btn.disabled = true;
				btn.textContent = "Sending…";
			}
		});
	})();
});

document.addEventListener("DOMContentLoaded", () => {
	const carousel = document.querySelector(".reviews-grid-carousel"); // scrollable container
	const grid = document.querySelector(".reviews-grid"); // content grid
	const prevBtn = document.querySelector(".prev-btn");
	const nextBtn = document.querySelector(".next-btn");

	if (!carousel || !grid || !prevBtn || !nextBtn) return;

	function getCardsPerPage() {
		if (window.innerWidth <= 480) return 1;
		if (window.innerWidth <= 768) return 2;
		return 3;
	}

	function updateButtons() {
		const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
		prevBtn.disabled = carousel.scrollLeft <= 0;
		nextBtn.disabled = carousel.scrollLeft >= maxScrollLeft - 1; // small buffer
	}

	prevBtn.addEventListener("click", () => {
		const cardsPerPage = getCardsPerPage();
		const card = grid.querySelector(".review-card");
		if (!card) return;
		const cardStyle = getComputedStyle(card);
		const cardWidth =
			card.offsetWidth + parseFloat(cardStyle.marginRight || 0);
		carousel.scrollBy({
			left: -cardWidth * cardsPerPage,
			behavior: "smooth",
		});
		// update after scroll animation
		setTimeout(updateButtons, 420);
	});

	nextBtn.addEventListener("click", () => {
		const cardsPerPage = getCardsPerPage();
		const card = grid.querySelector(".review-card");
		if (!card) return;
		const cardStyle = getComputedStyle(card);
		const cardWidth =
			card.offsetWidth + parseFloat(cardStyle.marginRight || 0);
		carousel.scrollBy({
			left: cardWidth * cardsPerPage,
			behavior: "smooth",
		});
		setTimeout(updateButtons, 420);
	});

	// Update buttons on scroll and resize
	carousel.addEventListener("scroll", updateButtons, { passive: true });
	window.addEventListener("resize", updateButtons);

	// ensure last card can snap fully into view on mobile
	carousel.style.scrollPaddingInline = "1rem";

	// init
	updateButtons();
});
