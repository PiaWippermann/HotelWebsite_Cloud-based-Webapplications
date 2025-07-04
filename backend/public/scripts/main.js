// File containing especially styling and animations for the main page

// Switching the background color and text color based on section visibility
const sections = document.querySelectorAll(".section");
const sectionsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const color = entry.target.dataset.bg;
        document.body.style.backgroundColor = color;
        const textColor = entry.target.dataset.color;
        document.body.style.color = textColor;
      }
    });
  },
  { threshold: 0.5 }
);
sections.forEach((section) => {
  sectionsObserver.observe(section);
});

// Fade-in effect for items in the main section
const items = document.querySelectorAll(".fade-item");
const itemsObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const index = Array.from(items).indexOf(el);
        el.style.transitionDelay = `${0.6}s`;
        el.classList.add("visible");
        obs.unobserve(el);
      }
    });
  },
  { threshold: 0.15 }
);

items.forEach((el) => itemsObserver.observe(el));
