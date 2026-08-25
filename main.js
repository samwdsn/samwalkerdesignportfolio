/* ==========================================================================
   Setup GSAP & Lenis
   ========================================================================== */
gsap.registerPlugin(ScrollTrigger, SplitText);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const mm = gsap.matchMedia();
ScrollTrigger.config({ ignoreMobileResize: true });

// FOUC Prevention: Unhide global elements once GSAP is initialized
gsap.set(".VideoContainer", { visibility: "visible" });

/* ==========================================================================
   Input Type Detector (Fixes Sticky Mobile Hovers)
   ========================================================================== */
function watchForHover() {
  let lastTouchTime = 0;

  function enableHover() {
    // If a touch just happened, ignore the fake mousemove the browser fires
    if (new Date() - lastTouchTime < 500) return;
    document.body.classList.remove("is-touch");
  }

  function disableHover() {
    document.body.classList.add("is-touch");
    lastTouchTime = new Date();
  }

  document.addEventListener("touchstart", disableHover, true);
  document.addEventListener("mousemove", enableHover, true);
}
watchForHover();

/* ==========================================================================
   Splash Text Animation
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const targetText = document.querySelector(".SplashText h1");
  let split;
  let windowWidth = window.innerWidth;
  let resizeTimer;

  function createTextAnimation() {
    if (split) split.revert();

    // FOUC Prevention: Make the text visible exactly as GSAP takes control
    gsap.set(".SplashText", { visibility: "visible" });

    split = SplitText.create(targetText, { type: "lines" });

    gsap.from(split.lines, {
      opacity: 0,
      y: 50,
      duration: 3,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".SplashSection",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }

  document.fonts.ready.then(createTextAnimation);

  // Debounce resize to prevent animation stuttering
  window.addEventListener("resize", () => {
    if (window.innerWidth !== windowWidth) {
      windowWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(createTextAnimation, 250);
    }
  });
});

/* ==========================================================================
   Video Container Grow
   ========================================================================== */
mm.add("(min-width: 769px)", () => {
  gsap.fromTo(
    ".VideoContainer",
    { width: "60%" },
    {
      width: "70%",
      ease: "none",
      scrollTrigger: {
        trigger: ".VideoContainer",
        start: "top 65%",
        end: "top 20%",
        scrub: 1.5,
        invalidateOnRefresh: true,
      },
    },
  );
});

mm.add("(max-width: 768px)", () => {
  gsap.fromTo(
    ".VideoContainer",
    { width: "90%" },
    {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".VideoContainer",
        start: "top 60%",
        end: "bottom 50%",
        scrub: 1.5,
        invalidateOnRefresh: true,
      },
    },
  );
});

ScrollTrigger.refresh();

/* ==========================================================================
   Portfolio Preview Logic
   ========================================================================== */
const portfolioSection = document.querySelector(".PortfolioSection");
const projects = document.querySelectorAll(".Pfol_ProjectHeader");
const preview = document.querySelector(".PreviewImage");

let isPreviewDisabled = false;
let activeHover = null;
let activeScroll = null;
let isPortfolioInView = false;
let isScrollSpyLocked = false; // Locks the preview image during layout shifts

function updatePreview() {
  if (isPreviewDisabled) return;

  const targetProject = activeHover || activeScroll;

  if (targetProject) {
    preview.style.backgroundImage = `url(${targetProject.dataset.image})`;
  }

  // Show if hovering, or if actively scrolling inside the section
  if (activeHover || (isPortfolioInView && activeScroll)) {
    preview.classList.add("visible");
  } else {
    preview.classList.remove("visible");
  }
}

// Hover Event Listeners (Only active on devices with a real mouse)
if (window.matchMedia("(hover: hover)").matches) {
  projects.forEach((p) => {
    p.addEventListener("mouseenter", () => {
      activeHover = p;
      updatePreview();
    });
    p.addEventListener("mouseleave", () => {
      activeHover = null;
      updatePreview();
    });
  });
}

// Scroll Event Listeners
ScrollTrigger.create({
  trigger: portfolioSection,
  start: "top 50%",
  end: "bottom 65%",
  onToggle: (self) => {
    isPortfolioInView = self.isActive;
    updatePreview();
  },
});

projects.forEach((p) => {
  ScrollTrigger.create({
    trigger: p,
    start: "top 55%",
    end: "bottom 55%",
    onToggle: (self) => {
      // Only update the preview if not actively locked by the accordion shrinking
      if (self.isActive && !isScrollSpyLocked) {
        activeScroll = p;
        updatePreview();
      }
    },
  });
});

/* ==========================================================================
   Portfolio Accordion
   ========================================================================== */
let activeProject = null;

projects.forEach((header) => {
  header.addEventListener("click", (e) => {
    const currentProject = e.target.closest(".Pfol_Project");
    const currentHeader = currentProject.querySelector(".Pfol_ProjectHeader");
    const currentContent = currentProject.querySelector(".Pfol_ProjectContent");

    // SCENARIO 1: Close current project
    if (currentProject === activeProject) {
      currentProject.classList.remove("is-open");
      activeProject = null;

      // Force the browser to drop the CSS focus state (prevents sticky hovers)
      currentHeader.blur();

      // Lock the scroll spy from firing during the layout shrink
      isScrollSpyLocked = true;

      // Force the preview to show the project we just closed immediately
      activeScroll = currentHeader;
      isPreviewDisabled = false;
      preview.classList.remove("force-hidden");
      updatePreview();

      gsap.to(currentContent, {
        height: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          ScrollTrigger.refresh();

          // Unlock as soon as the user physically touches or scrolls again
          const unlockScrollSpy = () => {
            isScrollSpyLocked = false;
            window.removeEventListener("touchstart", unlockScrollSpy);
            window.removeEventListener("wheel", unlockScrollSpy);
          };
          window.addEventListener("touchstart", unlockScrollSpy, {
            passive: true,
          });
          window.addEventListener("wheel", unlockScrollSpy, { passive: true });
        },
      });
      return;
    }

    // SCENARIO 2: Open new project (closes old one first if necessary)
    if (activeProject) {
      const activeContent = activeProject.querySelector(".Pfol_ProjectContent");
      activeProject.classList.remove("is-open");
      gsap.to(activeContent, { height: 0, duration: 0.4, ease: "power2.out" });
    }

    activeProject = currentProject;
    currentProject.classList.add("is-open");

    // Hide preview while accordion animates
    isPreviewDisabled = true;
    preview.classList.remove("visible");
    preview.classList.add("force-hidden");

    // Expand content (using svh to avoid mobile layout shifts)
    gsap.to(currentContent, {
      height: "80svh",
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => ScrollTrigger.refresh(),
    });
  });
});

/* ==========================================================================
   Mouse Follower Physics
   ========================================================================== */
const attractionStrength = 0.3;
const followSpeed = 0.08;

let targetX = 0,
  targetY = 0,
  currentX = 0,
  currentY = 0;

window.addEventListener("mousemove", (e) => {
  if (window.innerWidth <= 1024) return; // Disable physics math on mobile

  targetX = (e.clientX - window.innerWidth / 2) * attractionStrength;
  targetY = (e.clientY - window.innerHeight / 2) * attractionStrength;
});

function animateFollower() {
  if (window.innerWidth > 1024) {
    currentX += (targetX - currentX) * followSpeed;
    currentY += (targetY - currentY) * followSpeed;
    preview.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
  } else {
    // Hard reset to absolute center on mobile
    currentX = targetX = currentY = targetY = 0;
    preview.style.transform = `translate(-50%, -50%)`;
  }
  requestAnimationFrame(animateFollower);
}

animateFollower();

/* ==========================================================================
   Background Image Preloader
   ========================================================================== */
window.addEventListener("load", () => {
  projects.forEach((header) => {
    const mediaUrl = header.dataset.image;
    if (mediaUrl && !mediaUrl.endsWith(".mp4")) {
      const preloadImg = new Image();
      preloadImg.src = mediaUrl;
    }
  });
});
