document.addEventListener("DOMContentLoaded", () => {
	// =========================
	// SINGLE RESPONSIVE CAROUSEL
	// =========================
	function makeCarousel(
		id,
		{ auto = 5000, breakpoints = [{ max: Infinity, count: 1 }] } = {}
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
			index =
				((to % (maxIndex() + 1)) + (maxIndex() + 1)) % (maxIndex() + 1);
			track.style.transition = animate
				? "transform .5s ease-in-out"
				: "none";
			track.style.transform = `translateX(${-index * stepX}px)`;
			dots.forEach((d, i) => d.classList.toggle("active", i === index));
		};

		const start = () => {
			stop();
			if (auto > 0) timer = setInterval(() => go(index + 1), auto);
		};
		const stop = () => {
			if (timer) clearInterval(timer);
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

		applyWidths();
		measure();
		go(0, false);
		start();
	}

	// HERO: always 1-up
	makeCarousel("carousel-section", {
		auto: 5000,
		breakpoints: [{ max: Infinity, count: 1 }],
	});

	// IMAGE CARDS: 1 / 2 / 3 across
	makeCarousel("image-card-carousel", {
		auto: 7000,
		breakpoints: [
			{ max: 520, count: 1 }, // phones
			{ max: 768, count: 2 }, // small tablets
			{ max: Infinity, count: 3 }, // desktop
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
});
