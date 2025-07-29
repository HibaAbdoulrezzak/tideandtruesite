document.addEventListener("DOMContentLoaded", () => {
	// Function to initialize a single carousel
	function initializeCarousel(
		carouselId,
		numVisibleSlides = 1,
		autoSlideIntervalTime = 5000
	) {
		const carouselSection = document.getElementById(carouselId);
		if (!carouselSection) {
			console.warn(`Carousel section with ID '${carouselId}' not found.`);
			return; // Exit if section doesn't exist
		}

		const slidesContainer =
			carouselSection.querySelector(".carousel-slides");
		const slides = carouselSection.querySelectorAll(".carousel-slide");
		const dots = carouselSection.querySelectorAll(".dot");
		const prevBtn = carouselSection.querySelector(".carousel-prev");
		const nextBtn = carouselSection.querySelector(".carousel-next");

		let currentSlideIndex = 0;
		let autoSlideTimer;

		// Set the width for each slide based on how many are visible
		slides.forEach((slide) => {
			// This sets a base width, but CSS min-width/margin will further refine for multi-slide carousels
			slide.style.minWidth = `${100 / numVisibleSlides}%`;
		});

		function updateCarouselPosition() {
			// Calculate the transform value based on the current slide index and number of visible slides
			const translateXValue = -(
				currentSlideIndex *
				(100 / numVisibleSlides)
			);
			slidesContainer.style.transform = `translateX(${translateXValue}%)`;

			// Update active dot
			dots.forEach((dot, index) => {
				// The 'active' dot corresponds to the starting slide of the currently visible group.
				if (index === currentSlideIndex) {
					dot.classList.add("active");
				} else {
					dot.classList.remove("active");
				}
			});
		}

		function nextSlide() {
			// Determine the maximum index we can move to before looping
			// For 3 visible slides, if there are 4 slides total (0, 1, 2, 3), max index to start from is 1 (to show 1, 2, 3).
			const maxIndex = slides.length - numVisibleSlides;

			if (currentSlideIndex < maxIndex) {
				currentSlideIndex++;
			} else {
				currentSlideIndex = 0; // Loop back to the start
			}
			updateCarouselPosition();
		}

		function prevSlide() {
			if (currentSlideIndex > 0) {
				currentSlideIndex--;
			} else {
				// If at the beginning, go to the last possible starting position
				currentSlideIndex = slides.length - numVisibleSlides;
				if (currentSlideIndex < 0) currentSlideIndex = 0; // Safety for carousels with fewer slides than visible count
			}
			updateCarouselPosition();
		}

		function startAutoSlide() {
			stopAutoSlide(); // Clear any existing interval before starting a new one
			autoSlideTimer = setInterval(nextSlide, autoSlideIntervalTime); // Change slide at the specified interval
		}

		function stopAutoSlide() {
			clearInterval(autoSlideTimer);
		}

		// Add event listeners for navigation (buttons and dots)
		if (nextBtn) {
			nextBtn.addEventListener("click", () => {
				stopAutoSlide(); // Stop auto-slide on manual interaction
				nextSlide();
				startAutoSlide(); // Restart auto-slide after a moment
			});
		}

		if (prevBtn) {
			prevBtn.addEventListener("click", () => {
				stopAutoSlide(); // Stop auto-slide on manual interaction
				prevSlide();
				startAutoSlide(); // Restart auto-slide
			});
		}

		dots.forEach((dot, index) => {
			dot.addEventListener("click", () => {
				stopAutoSlide(); // Stop auto-slide on manual interaction
				currentSlideIndex = index; // Go directly to the clicked slide's index
				updateCarouselPosition();
				startAutoSlide(); // Restart auto-slide
			});
		});

		// Initial setup when the page loads
		if (slides.length > 0) {
			// Only run if there are slides
			updateCarouselPosition();
			startAutoSlide(); // Start auto-sliding when the page loads
		}
	}

	// --- Initialize ALL Carousels ---

	// Initialize the main hero carousel (1 slide visible at a time)
	// ID: 'carousel-section', 1 visible slide, 5 second auto-slide
	initializeCarousel("carousel-section", 1, 5000);

	// Initialize the new image card carousel (3 slides visible at a time)
	// ID: 'image-card-carousel', 3 visible slides, 7 second auto-slide
	initializeCarousel("image-card-carousel", 3, 7000);
});
