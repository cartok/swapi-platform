# Frontend Roadmap

- [x] Fix slider swipe behavior (mobile and Firefox on desktop).
- Add a global page cursor style and use it while dragging the image slider.
- [x] Add image placeholders and fallbacks.
- Improve accessibility.
- Fix console warnings related to images.
- Improve the `DeviceService` API.
- Add a fallback for device feature detection (Firefox and Safari).
- Finish the link-list component as defined in the designs.
- Evaluate URL rewriting instead of redirecting for device feature routing, if cache configuration allows it.
- Add SVG sprite-sheet generation.
- Optimize composition and boundaries of UI components.
- Try out Angulars dedicated App Shell feature.
- Emphasize which breakpoints to focus on for mobile/tablet opimization in context.ts
  - desktop prio:

    "800x600",9.01
    "1280x1200",7.44
    "1280x720",3.67
    "1366x768",6.32
    "1536x864",7.53
    "1920x1080",19.39
    "2560x1440",3.08
    "3840x2160",5.26

  - tablet prio:

    "601x1007",3.65
    "601x962",3.07
    "768x1024",13.34
    "800x1280",7.45
    "810x1080",9.32
    "820x1180",9.28
    "1280x800",6.67

    --- flipped

    "800x1280",6.67
    "962x601",3.07
    "1007x601",3.65
    "1024x768",13.34
    "1080x810",9.32
    "1180x820",9.28
    "1280x800",7.45

  - mobile prio:

    "360x780",3.39
    "360x800",10.21
    "375x812",4.36
    "384x832",3.97
    "390x844",6.2
    "393x852",3.12
    "393x873",4.75
    "412x915",3.49
    "414x896",6.81

    --- flipped

    "780x360",3.39
    "800x360",10.21
    "812x375",4.36
    "832x384",3.97
    "844x390",6.2
    "852x393",3.12
    "873x393",4.75
    "896x414",6.81
    "915x412",3.49
