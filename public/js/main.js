// Initialize activeUser to false on app start
if (!localStorage.getItem("activeUser")) {
  localStorage.setItem("activeUser", JSON.stringify({ title: "CoinEdge" }));
}

// Create a reusable method to check if user is logged in
function isUserLoggedIn() {
  try {
    const authData = localStorage.getItem("activeUser");
    const userData = JSON.parse(authData);
    return userData.isLoggedIn === true && userData.token;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Particle effects disabled for better performance

  // Initialize super UI enhancements
  initializeSuperUI();
  // Smooth scrolling for anchor links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Navbar is now completely fixed - no scroll effects

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe feature cards - Disabled animations to prevent overlap
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach((card) => {
    card.style.opacity = "1";
    card.style.transform = "none";
    card.style.transition = "none";
  });

  // Wallet connection simulation
  const walletButtons = document.querySelectorAll('[href="#"]');
  walletButtons.forEach((button) => {
    if (button.textContent.includes("Connect Wallet")) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        showWalletModal();
      });
    }
  });

  // Footer icon hover effects
  const footerIcons = document.querySelectorAll(".footer-icon");
  footerIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px) scale(1.1)";
    });

    icon.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Popup close handlers
  document.getElementById("popupButton").addEventListener("click", closePopup);
  checkLoginStatus();
  // Add logout button click handler
  document.getElementById("loginBtn").addEventListener("click", function (e) {
    const authData = localStorage.getItem("activeUser");
    const userData = JSON.parse(authData);

    if (userData.isLoggedIn === true && userData.token) {
      e.preventDefault(); // Prevent default link behavior
      logout();
    }
    // If not logged in, let the default link behavior work (go to login page)
  });
});

// Particle Effect System - Disabled for better performance

// Super UI Enhancements
function initializeSuperUI() {
  // Simple button styling - no glow effects

  // Add gradient text to headings
  const headings = document.querySelectorAll("h1, h2, h3, h4");
  headings.forEach((heading) => {
    if (heading.textContent.includes("MetaCash")) {
      heading.classList.add("gradient-text");
    }
  });
  // Initialize slider
  initializeSlider();
}

// Slider functionality
let currentSlideIndex = 0;
const totalSlides = 10;
let slideInterval;

function initializeSlider() {
  // Remove this check to always initialize slider
  // if (isUserLoggedIn()) {
  //     return; // Don't initialize slider if user is logged in
  // }

  // Auto-advance slides every 4 seconds
  slideInterval = setInterval(() => {
    changeSlide(1);
  }, 4000);

  // Pause auto-advance on hover
  const sliderContainer = document.querySelector(".slider-container");
  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", () => {
      clearInterval(slideInterval);
    });

    sliderContainer.addEventListener("mouseleave", () => {
      slideInterval = setInterval(() => {
        changeSlide(1);
      }, 4000);
    });
  }
}

function changeSlide(direction) {
  const images = document.querySelectorAll(".slider-image");
  const dots = document.querySelectorAll(".dot");

  // Remove active class from current slide
  images[currentSlideIndex].classList.remove("active");
  dots[currentSlideIndex].classList.remove("active");

  // Calculate new slide index
  currentSlideIndex += direction;

  // Handle wrap-around
  if (currentSlideIndex >= totalSlides) {
    currentSlideIndex = 0;
  } else if (currentSlideIndex < 0) {
    currentSlideIndex = totalSlides - 1;
  }

  // Add active class to new slide
  images[currentSlideIndex].classList.add("active");
  dots[currentSlideIndex].classList.add("active");
}

function currentSlide(slideNumber) {
  const images = document.querySelectorAll(".slider-image");
  const dots = document.querySelectorAll(".dot");

  // Remove active class from current slide
  images[currentSlideIndex].classList.remove("active");
  dots[currentSlideIndex].classList.remove("active");

  // Set new slide index
  currentSlideIndex = slideNumber - 1;

  // Add active class to new slide
  images[currentSlideIndex].classList.add("active");
  dots[currentSlideIndex].classList.add("active");

  // Reset auto-advance timer
  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    changeSlide(1);
  }, 4000);
}

function authCondition(buttonId) {
  try {
    const authData = localStorage.getItem("activeUser");
    const userData = JSON.parse(authData);
    // console.log(userData.isLoggedIn);

    if (userData.isLoggedIn === true && userData.token) {
      // Redirect based on button clicked
      switch (buttonId) {
        case "homeBtn":
          window.location.href = "/user/dashboard";
          break;
        case "tradingBtn":
          window.location.href = "/user/trading";
          break;
        case "portfolioBtn":
          window.location.href = "/user/portfolio";
          break;
        case "marketBtn":
          window.location.href = "/user/market";
          break;
        case "settingsBtn":
          window.location.href = "/user/settings";
          break;
      }
    } else {
      showPopup("Login Required", "Please login to access this feature");
    }
  } catch (error) {
    console.error("Authentication check error:", error);
    return false;
  }
}

// ===========================================
// POPUP FUNCTIONS
// ===========================================
function showPopup(title, message) {
  Swal.fire({
    title: title,
    text: message,
    icon: 'warning', 
    confirmButtonText: 'OK'
  });
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
  window.location.href = "/auth/login";
}

function logout() {
  Swal.fire({
    title:"Logout",
    text:'Do you wnat to logout',
    icon:'question',
    showCancelButton:true,
    showConfirmButton:true,
  }).then((res) =>{
    if(res.isConfirmed){

    localStorage.removeItem("activeUser");

  checkLoginStatus();
  window.location.href = "/";
  setTimeout(()=>{
     Swal.fire({
    title:"Logged Out",
    text:"Logged Out Successfully",
    icon:'success',
    timer:5000
  }),2000

  })
 

    }
  });

}

function checkLoginStatus() {
  try {
    const authData = localStorage.getItem("activeUser");
    const userData = JSON.parse(authData);
    const loginSpan = document.getElementById("loginSpan");
const loginSpanpic = document.getElementById("loginSpanpic");
const loginSpanname = document.getElementById("loginSpanname");
const loginBtn = document.getElementById("loginBtn");

if (userData.isLoggedIn === true && userData.token) {
  console.log(userData.profilePicture);
  
  loginSpanpic.innerHTML = `<img src="${userData.profilePicture}" alt=" " class="profile-img">`;
  loginSpan.textContent = `Hi,`;
    loginSpanname.textContent = `${userData.userName.toUpperCase()}!`;
  loginBtn.textContent = "LogOut";
} else {
  loginSpan.textContent = "CoinEdge";
  loginBtn.textContent = "LogIn";
}
  } catch (error) {
    console.error("Error checking login status:", error);
  }
}

function showSweetLoader(title = "Loading...", text = "Please wait") {
  Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

function hideSweetLoader() {
  Swal.close();
}
