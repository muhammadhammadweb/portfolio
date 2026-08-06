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








// Append this to assets/js/script.js if image screenshots are missing
document.querySelectorAll('.project-img img').forEach((img) => {
  img.onerror = function () {
    const title = this.alt || 'Project Preview';
    this.src = `https://via.placeholder.com/600x400/1e1e1e/ffdb70?text=${encodeURIComponent(title)}`;
  };
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

// Clients Logo Slider Setup
const clientsSwiper = new Swiper('.clients-slider', {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  breakpoints: {
    0: {
      slidesPerView: 2,
      spaceBetween: 15
    },
    640: {
      slidesPerView: 3,
      spaceBetween: 20
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 25
    }
  }
});
