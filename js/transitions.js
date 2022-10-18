const Cursor = {
  delay: 8,
  _x: 0,
  _y: 0,
  endX: window.innerWidth / 2,
  endY: window.innerHeight / 2,
  cursorVisible: true,
  cursorEnlarged: false,
  cursorSwatch: false,
  cursorAnchor: false,
  $dot: document.querySelector(".cursor-dot"),
  $outline: document.querySelector(".cursor-dot-outline"),
  // $wrapper: document.querySelector(".wrapper"),

  init: function () {
    // Set up element sizes
    this.dotSize = this.$dot.offsetWidth;
    this.outlineSize = this.$outline.offsetWidth;

    this.setupEventListeners();
    this.animateDotOutline();
  },

  setupEventListeners: function () {
    var self = this;

    // Anchor sticking
    document.querySelectorAll(".capture").forEach((a) => {
      self.capture(a);
    });

    // Click events
    document.addEventListener("mousedown", function () {
      self.cursorEnlarged = true;
      self.toggleCursorSize();
    });
    document.addEventListener("mouseup", function () {
      self.cursorEnlarged = false;
      self.toggleCursorSize();
    });

    document.addEventListener("mousemove", function (e) {
      // Show the cursor
      self.cursorVisible = true;
      self.toggleCursorVisibility();

      // Position the dot
      if (!self.cursorSwatch && !self.cursorAnchor) {
        self.endX = e.pageX;
        self.endY = e.pageY;
        self.$dot.style.top = self.endY + "px";
        self.$dot.style.left = self.endX + "px";
      }
    });

    // Hide/show cursor
    document.addEventListener("mouseenter", function (e) {
      self.cursorVisible = true;
      self.toggleCursorVisibility();
      self.$dot.style.opacity = 1;
      self.$outline.style.opacity = 1;
    });

    document.addEventListener("mouseleave", function (e) {
      self.cursorVisible = true;
      self.toggleCursorVisibility();
      self.$dot.style.opacity = 0;
      self.$outline.style.opacity = 0;
    });
  },

  capture: function (a) {
    var self = this;
    a.addEventListener("mouseover", function (e) {
      self.cursorAnchor = true;
      self.toggleCursorAnchor(e.target.getBoundingClientRect(), e.target.id);
    });
    a.addEventListener("mouseout", function () {
      self.cursorAnchor = false;
      self.toggleCursorAnchor();
    });
  },

  animateDotOutline: function () {
    var self = this;

    if (!self.cursorSwatch && !self.cursorAnchor) {
      self._x += (self.endX - self._x) / self.delay;
      self._y += (self.endY - self._y) / self.delay;
      self.$outline.style.top = self._y + "px";
      self.$outline.style.left = self._x + "px";
    }

    requestAnimationFrame(this.animateDotOutline.bind(self));
  },

  toggleCursorSize: function () {
    var self = this;

    if (self.cursorEnlarged) {
      self.$dot.style.borderColor = "black";
      self.$dot.style.transform = "translate(-50%, -50%) scale(2.5)";
      if (!self.cursorSwatch && !self.cursorAnchor) {
        self.$outline.style.transform = "translate(-50%, -50%) scale(1.4)";
      } else {
        self.$outline.style.transform = "translate(-50%, -50%) scale(1.1)";
      }
    } else {
      self.$dot.style.transform = "translate(-50%, -50%) scale(1)";
      self.$dot.style.borderColor = "transparent";
      self.$outline.style.transform = "translate(-50%, -50%) scale(1)";
    }
  },

  toggleCursorVisibility: function () {
    var self = this;

    if (self.cursorVisible) {
      self.$dot.style.opacity = 1;
      self.$outline.style.opacity = 1;
    } else {
      self.$dot.style.opacity = 0.5;
      self.$outline.style.opacity = 0.5;
    }
  },

  toggleCursorAnchor: function (e, id) {
    var self = this;

    if (self.cursorAnchor && id !== Transitions.pageState) {
      self.$dot.style.top = `${e.top + e.height / 2}px`;
      self.$dot.style.left = `${e.x + e.width / 2}px`;
      self.$dot.style.transition = "all 0.2s ease-in-out";
      self.$outline.style.top = `${e.top + e.height / 2}px`;
      self.$outline.style.left = `${e.x + e.width / 2}px`;
      self.$outline.style.backgroundColor = "transparent";
      self.$outline.style.border = ".05rem solid #000";
      self.$outline.style.width = `${e.width + 3}px`;
      self.$outline.style.height = `${e.height + 1}px`;
      self.$outline.style.borderRadius = "3px";
      self.$outline.style.transform = "translate(-50%, -50%)";
      // self.$outline.style.mixBlendMode = "color-burn";
    } else {
      self.$dot.style.transition =
        "opacity 0.3s ease-in-out, transform 0.1s ease-in-out, border-color 0.3s ease-in-out";
      self.$outline.style.width = "1.5rem";
      self.$outline.style.height = "1.5rem";
      self.$outline.style.backgroundColor = "#ffffff88";
      self.$outline.style.border = "none";
      self.$outline.style.borderRadius = "50%";
    }
  },
};

export const Transitions = {
  pageState: "",
  $loader: document.querySelector(".loading-screen"),
  $wrapper: document.querySelector(".wrapper"),
  $nav: document.querySelector("nav"),
  $navLinks: document.querySelectorAll(".nav-link"),
  $colorSwap: document.querySelector(".colorSwap"),
  $contact: document.querySelector(".reveal"),
  directions: {
    home: {
      trans: ["0vh", "10%"],
    },
    projects: {
      trans: ["-100vh", "30%"],
    },
    contact: {
      trans: ["-200vh", "40%"],
    },
    arr: ["home", "projects", "contact"],
  },
  transitionDisabled: false,
  synonyms: [
    "change",
    "modify",
    "alter",
    "transform",
    "amend",
    "adjust",
    "doctor",
    "revise",
    "rework",
    "reshape",
    "remodel",
    "transmute",
    "affect",
    "tweak",
    "mutate",
    "distort",
    "reform",
    "refashion",
    "interpolate",
    "manipulate",
    "tailor",
    "transfigure",
    "transmogrify",
    "shift",
    "restyle",
    "shift",
    "update",
    "vary",
    "transubstantiate",
  ],

  init: function () {
    window.onload = async () => {
      const path = window.location.pathname.substring(
        1,
        window.location.pathname.length
      );
      if (path && !this.pageState) {
        this.handleTransition(path);
        this.pageState = path;
      } else if (!this.pageState) {
        this.pageState = "home";
        this.$nav.className = "home";
      }
      this.$colorSwap.textContent =
        this.synonyms[Math.floor(Math.random() * this.synonyms.length)];
      await this.sleep(2000);
      this.$loader.style.opacity = 0;
      this.$loader.style.pointerEvents = 0;
      await this.sleep(500);
      this.$loader.style.display = "none";
    };

    this.setupEventListeners();
  },

  setupEventListeners: function () {
    var self = this;

    window.onpopstate = (e) => {
      const page = e.target.window.location.pathname.replace("/", "");
      this.handleTransition(page);
    };

    document
      .querySelector("html")
      .addEventListener("wheel", async function (e) {
        var delta = e.wheelDelta || -e.detail;
        if (
          !self.transitionDisabled &&
          e.deltaY > 25 &&
          self.pageState !== "contact"
        ) {
          self.transitionDisabled = true;
          let idx = self.directions.arr.findIndex((e) => e === self.pageState);
          self.handleTransition(self.directions.arr[idx + 1]);
          await self.sleep(1200);
          self.transitionDisabled = false;
        } else if (
          !self.transitionDisabled &&
          delta > 0 &&
          self.pageState !== "home"
        ) {
          self.transitionDisabled = true;
          let idx = self.directions.arr.findIndex((e) => e === self.pageState);
          self.handleTransition(self.directions.arr[idx - 1]);
          await self.sleep(1200);
          self.transitionDisabled = false;
        }
      });

    self.$navLinks.forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        self.handleTransition(e.target.id);
      })
    );

    self.$contact.addEventListener("click", async (e) => {
      if (!self.transitionDisabled) {
        self.transitionDisabled = true;
        self.$contact.style.opacity = 0;
        let $a = document.createElement("a");
        $a.href = "mailto:jack@jackkgeorgee.xyz";
        $a.textContent = "jack@jackkgeorgee.xyz";
        $a.className = "capture";
        Cursor.capture($a);
        await self.sleep(300);
        const $h2 = self.$contact.firstElementChild;
        $h2.removeChild($h2.firstElementChild);
        $h2.textContent = "";
        Cursor.cursorAnchor = false;
        Cursor.toggleCursorAnchor();
        $h2.appendChild($a);
        self.$contact.style.opacity = 1;
        self.transitionDisabled = false;
      }
    });

    this.$colorSwap.addEventListener("click", async (e) => {
      const $e = self.$colorSwap;
      $e.style.opacity = 0;
      $e.style.transform = "translateX(5rem)";
      await self.sleep(200);
      Cursor.cursorAnchor = false;
      Cursor.toggleCursorAnchor();
      $e.style.display = "none";
      $e.textContent =
        this.synonyms[Math.floor(Math.random() * this.synonyms.length)];
      $e.style.transform = "translateX(0)";
      await self.sleep(200);
      $e.style.display = "block";
      $e.style.opacity = 0.3;
    });
  },

  sleep: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  handleTransition: function (dir) {
    if (dir && this.pageState !== dir && this.directions.arr.includes(dir)) {
      this.$wrapper.style.top = this.directions[dir].trans[0];
      this.$nav.style.top = this.directions[dir].trans[1];
      this.$colorSwap.style.bottom = this.directions[dir].trans[1];
      window.history.pushState("", "", dir === "home" ? "/" : dir);
      this.pageState = dir;
      this.$nav.className = dir;
    }
  },
};

Cursor.init();

Transitions.init();
