'use strict';

// Element toggle function helper
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

// Sidebar variables & toggle for mobile
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebarBtn) {
  sidebarBtn.addEventListener("click", function () {
    elementToggleFunc(sidebar);
  });
}

// Portfolio Custom Select & Filtering Logic
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

if (select) {
  select.addEventListener("click", function () {
    elementToggleFunc(this.parentElement);
  });
}

// Filter Function
const filterFunc = function (selectedValue) {
  const normVal = selectedValue.toLowerCase().trim();

  filterItems.forEach((item) => {
    const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase().trim() : "";
    
    if (normVal === "all" || normVal === itemCategory) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};

// Select item click (Mobile Dropdown)
selectItems.forEach((item) => {
  item.addEventListener("click", function () {
    let selectedValue = this.innerText;
    if (selectValue) selectValue.innerText = selectedValue;
    if (select) elementToggleFunc(select.parentElement);
    filterFunc(selectedValue);
  });
});

// Filter button click (Desktop / Larger screens)
let lastClickedBtn = filterBtn[0];

filterBtn.forEach((btn) => {
  btn.addEventListener("click", function () {
    let selectedValue = this.innerText;
    if (selectValue) selectValue.innerText = selectedValue;
    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
});

// Page Navigation Logic (About, Resume, Portfolio, Contact)
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navigationLinks.forEach((navLink) => {
  navLink.addEventListener("click", function () {
    const targetPage = this.dataset.target
      ? this.dataset.target.toLowerCase().trim()
      : this.innerText.toLowerCase().trim();

    pages.forEach((page) => {
      if (targetPage === page.dataset.page) {
        page.classList.add("active");
        window.scrollTo(0, 0);
      } else {
        page.classList.remove("active");
      }
    });

    // Every page has its own copy of the navbar, so sync the active
    // state across all of them by matching data-target, not just the
    // exact button that was clicked.
    navigationLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.target === targetPage);
    });
  });
});








// Agar project screenshot load na ho to simple placeholder dikhao
const fallbackImage = (img) => {
  img.onerror = null; // baar baar retry se bachne ke liye
  const title = (img.alt || 'Project Preview')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  img.src =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
        <rect width="100%" height="100%" fill="#1e1e1e"/>
        <text x="50%" y="50%" fill="#ffdb70" font-size="26" font-family="Arial"
          text-anchor="middle" dominant-baseline="middle">${title}</text>
      </svg>`
    );
};

document.querySelectorAll('.project-img img').forEach((img) => {
  img.onerror = () => fallbackImage(img);
  // Agar image script chalne se pehle hi fail ho chuki thi
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fallbackImage(img);
});







// Testimonials Slider Setup
const testimonialsSwiper = new Swiper('.testimonials-slider', {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  breakpoints: {
    // Mobile: 1
    0: {
      slidesPerView: 1,
      spaceBetween: 15
    },
    // Tablet: 2
    640: {
      slidesPerView: 2,
      spaceBetween: 20
    },
    // Desktop: 3
    1024: {
      slidesPerView: 3,
      spaceBetween: 25
    }
  }
});



(function () {
    var track = document.querySelector('[data-marquee-track]');
    if (!track || track.dataset.cloned) return;
    track.querySelectorAll('img').forEach(function (img) { img.loading = 'eager'; });
    Array.from(track.children).forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
      track.appendChild(c);
    });
    track.dataset.cloned = 'true';
  })();
