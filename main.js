// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// Create Lenis instance
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);

// Use GSAP's ticker instead of requestAnimationFrame
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Used for breakpoints
const mm = gsap.matchMedia();

// Prevent lag smoothing from interfering
gsap.ticker.lagSmoothing(0);

/* ==========================================================================
    Split text anims
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const targetText = document.querySelector(".SplashText h1");
  let split;

  function createTextAnimation() {
    if (split) {
      split.revert();
    }
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

  document.fonts.ready.then(() => {
    createTextAnimation();
  });

  let windowWidth = window.innerWidth;
  let resizeTimer;

  window.addEventListener("resize", () => {
    if (window.innerWidth !== windowWidth) {
      windowWidth = window.innerWidth;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        createTextAnimation();
      }, 250);
    }
  });
});

/* ==========================================================================
    Video Container Grow
   ========================================================================== */

// Desktop (> 768px)
mm.add("(min-width: 769px)", () => {
  gsap.fromTo(
    ".VideoContainer",
    { width: "60%" }, // CHANGE THIS to match your base CSS width
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

// Mobile / Tablet (<= 768px)
mm.add("(max-width: 768px)", () => {
  gsap.fromTo(
    ".VideoContainer",
    { width: "90%" }, // CHANGE THIS to match your base mobile CSS width
    {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: ".VideoContainer",
        start: "top 60%",
        end: "bottom 50%",
        scrub: 1.5,
        invalidateOnRefresh: true,
        // markers: true,
      },
    },
  );
});

// Force ScrollTrigger to lock dimensions on page load frame
ScrollTrigger.refresh();

/* ==========================================================================
    Portfolio Controls
   ========================================================================== */

// const portfolioSection = document.querySelector(".PortfolioSection");
// const projects = document.querySelectorAll(".Pfol_ProjectHeader");
// const preview = document.querySelector(".PreviewImage");

// // --- DESKTOP: Hover Effect (> 1024px) ---
// mm.add("(min-width: 1025px)", () => {
//   const handleMouseEnter = (e) => {
//     const p = e.currentTarget;

//     // Set both Color and Image
//     preview.style.backgroundColor = p.dataset.color;
//     preview.style.backgroundImage = `url(${p.dataset.image})`;

//     preview.classList.add("visible");
//   };

//   const handleMouseLeave = () => {
//     preview.classList.remove("visible");
//   };

//   projects.forEach((p) => {
//     p.addEventListener("mouseenter", handleMouseEnter);
//     p.addEventListener("mouseleave", handleMouseLeave);
//   });

//   return () => {
//     projects.forEach((p) => {
//       p.removeEventListener("mouseenter", handleMouseEnter);
//       p.removeEventListener("mouseleave", handleMouseLeave);
//     });
//     preview.classList.remove("visible");
//   };
// });

// // --- MOBILE/TABLET: Scroll Spy Effect (<= 1024px) ---
// mm.add("(max-width: 1024px)", () => {
//   // 1. MASTER TRIGGER: Show/Hide preview
//   ScrollTrigger.create({
//     trigger: portfolioSection,
//     // Triggers when the TOP of the section reaches the CENTER of the screen
//     start: "top 50%%",
//     // Ends when the BOTTOM of the section reaches the CENTER of the screen
//     end: "bottom 55%",
//     toggleClass: { targets: preview, className: "visible" },
//     // markers: true,
//   });

//   // 2. CHILD TRIGGERS: Swap color/image for each project
//   projects.forEach((p) => {
//     ScrollTrigger.create({
//       trigger: p,
//       start: "top 55%",
//       end: "bottom 55%",

//       onEnter: () => {
//         preview.style.backgroundColor = p.dataset.color;
//         preview.style.backgroundImage = `url(${p.dataset.image})`;
//       },
//       onEnterBack: () => {
//         preview.style.backgroundColor = p.dataset.color;
//         preview.style.backgroundImage = `url(${p.dataset.image})`;
//       },
//     });
//   });
// });
// // --- ACCORDION STATE LOGIC ---
// let isPreviewDisabled = false;
// let activeProject = null;

// // NEW: Target the entire header div instead of just the button
// const headers = document.querySelectorAll(".Pfol_ProjectHeader");

// headers.forEach((header) => {
//   header.addEventListener("click", (e) => {
//     const currentProject = e.target.closest(".Pfol_Project");
//     const currentContent = currentProject.querySelector(".Pfol_ProjectContent");

//     // SCENARIO 1: Clicking the currently open project (Close it)
//     if (currentProject === activeProject) {
//       currentProject.classList.remove("is-open");
//       activeProject = null;

//       gsap.to(currentContent, {
//         height: 0,
//         duration: 0.4,
//         ease: "power2.out",
//         onComplete: () => {
//           ScrollTrigger.refresh();
//           isPreviewDisabled = false;
//           preview.classList.remove("force-hidden");
//         },
//       });
//       return;
//     }

//     // SCENARIO 2: Opening a new project
//     if (activeProject) {
//       const activeContent = activeProject.querySelector(".Pfol_ProjectContent");
//       activeProject.classList.remove("is-open");
//       gsap.to(activeContent, { height: 0, duration: 0.4, ease: "power2.out" });
//     }

//     // Assign the new project
//     activeProject = currentProject;
//     currentProject.classList.add("is-open");

//     // Instantly kill the preview image and apply the CSS brick wall
//     isPreviewDisabled = true;
//     preview.classList.remove("visible");
//     preview.classList.add("force-hidden");

//     // Animate the new content open
//     gsap.to(currentContent, {
//       height: "80dvh",
//       duration: 0.4,
//       ease: "power2.out",
//       onComplete: () => ScrollTrigger.refresh(),
//     });
//   });
// });

const portfolioSection = document.querySelector(".PortfolioSection");
const projects = document.querySelectorAll(".Pfol_ProjectHeader");
const preview = document.querySelector(".PreviewImage");

// --- STATE TRACKERS ---
let isPreviewDisabled = false; // Accordion kill-switch
let activeHover = null; // Stores the project currently being hovered
let activeScroll = null; // Stores the project currently in the center of the screen
let isPortfolioInView = false; // Is the main section on screen?

// --- THE MASTER UPDATE FUNCTION ---
// This handles the priority: Hover always beats Scroll
function updatePreview() {
  if (isPreviewDisabled) return; // Stop updates if a project is opened

  // 1. Determine Priority (Hover wins if it exists)
  const targetProject = activeHover || activeScroll;

  // 2. Set the Image and Color
  if (targetProject) {
    preview.style.backgroundColor = targetProject.dataset.color;
    preview.style.backgroundImage = `url(${targetProject.dataset.image})`;
  }

  // 3. Handle Visibility (Show if hovering, OR if scrolling inside the section)
  if (activeHover || (isPortfolioInView && activeScroll)) {
    preview.classList.add("visible");
  } else {
    preview.classList.remove("visible");
  }
}

// --- HOVER LOGIC (All Devices) ---
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

// --- SCROLL SPY LOGIC (All Devices) ---
// 1. MASTER TRIGGER: Tracks if the user is in the portfolio zone
ScrollTrigger.create({
  trigger: portfolioSection,
  start: "top 50%",
  end: "bottom 65%",
  // markers: "true",
  onEnter: () => {
    isPortfolioInView = true;
    updatePreview();
  },
  onLeave: () => {
    isPortfolioInView = false;
    updatePreview();
  },
  onEnterBack: () => {
    isPortfolioInView = true;
    updatePreview();
  },
  onLeaveBack: () => {
    isPortfolioInView = false;
    updatePreview();
  },
});

// 2. CHILD TRIGGERS: Tracks which project is in the center of the screen
projects.forEach((p) => {
  ScrollTrigger.create({
    trigger: p,
    start: "top 55%",
    end: "bottom 55%",
    onEnter: () => {
      activeScroll = p;
      updatePreview();
    },
    onEnterBack: () => {
      activeScroll = p;
      updatePreview();
    },
  });
});

// --- ACCORDION STATE LOGIC ---
let activeProject = null;
const headers = document.querySelectorAll(".Pfol_ProjectHeader");

headers.forEach((header) => {
  header.addEventListener("click", (e) => {
    const currentProject = e.target.closest(".Pfol_Project");
    const currentContent = currentProject.querySelector(".Pfol_ProjectContent");

    // SCENARIO 1: Clicking the currently open project (Close it)
    if (currentProject === activeProject) {
      currentProject.classList.remove("is-open");
      activeProject = null;

      gsap.to(currentContent, {
        height: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          ScrollTrigger.refresh();
          isPreviewDisabled = false;
          preview.classList.remove("force-hidden");
          updatePreview(); // Re-evaluate state when closing!
        },
      });
      return;
    }

    // SCENARIO 2: Opening a new project
    if (activeProject) {
      const activeContent = activeProject.querySelector(".Pfol_ProjectContent");
      activeProject.classList.remove("is-open");
      gsap.to(activeContent, { height: 0, duration: 0.4, ease: "power2.out" });
    }

    // Assign the new project
    activeProject = currentProject;
    currentProject.classList.add("is-open");

    // Instantly kill the preview image and apply the CSS brick wall
    isPreviewDisabled = true;
    preview.classList.remove("visible");
    preview.classList.add("force-hidden");

    // Animate the new content open
    gsap.to(currentContent, {
      height: "80dvh",
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => ScrollTrigger.refresh(),
    });
  });
});

const followerPreview = document.querySelector(".PreviewImage");

// --- INTERACTION SETTINGS ---
// 0.5 = Moves exactly 50% of the distance towards the mouse (Half-way attracted)
// 1.0 = Tries to track the mouse exactly 0.2 = Barely moves from the center
const attractionStrength = 0.3;

// How "heavy" or delayed the image feels.
// 0.05 = Very slow and smooth (high lag) 0.15 = Snappy and fast
const followSpeed = 0.08;

// --- INTERNAL PHYSICS VARIABLES ---
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

// 1. Track the mouse position
window.addEventListener("mousemove", (e) => {
  // Calculate how far the cursor is from the exact center of the screen
  const xDistanceFromCenter = e.clientX - window.innerWidth / 2;
  const yDistanceFromCenter = e.clientY - window.innerHeight / 2;

  // Apply your 50% strength limit to the target destination
  targetX = xDistanceFromCenter * attractionStrength;
  targetY = yDistanceFromCenter * attractionStrength;
});

// 2. The Animation Loop
function animateFollower() {
  // Lerp formula: smoothly glides the current position towards the target position
  currentX += (targetX - currentX) * followSpeed;
  currentY += (targetY - currentY) * followSpeed;

  // Apply the movement while preserving your original CSS centering!
  followerPreview.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;

  // Loop infinitely at 60fps
  requestAnimationFrame(animateFollower);
}

// Start the engine
animateFollower();
