import { UxAuditReport } from '../models/ux-audit.model';

export const PANKAJ_PEDE_MOCK_AUDIT: UxAuditReport = {
  audit: {
    id: 'UXA-2026-0001',
    url: 'https://pankajpede.github.io/aboutme/',
    domain: 'pankajpede.github.io',
    date: '2026-09-09',
    status: 'completed',
    crawlDepth: 2,
    pagesCount: 8,
    viewportSizes: ['1440x900 (Desktop)', '768x1024 (Tablet)', '390x844 (Mobile)']
  },

  website: {
    title: 'Pankaj Pede — Lead Product Designer & UX Architect Portfolio',
    description: 'Personal portfolio highlighting UX architecture, design systems, and product strategy projects.',
    pagesAnalyzed: 8,
    primaryCategory: 'Portfolio & Professional Profile',
    heroHeadline: 'Crafting Enterprise Product Experiences & Design Systems',
    heroSubheadline: 'Lead Product Designer with 8+ years experience in SaaS, FinTech, and Design Tokens.'
  },

  scores: {
    overall: {
      score: 6.6,
      rationale: 'Solid baseline visual quality and strong project case studies, but held back by minor accessibility gaps, subtle contrast issues on dark backgrounds, and lack of immediate primary CTA above fold on mobile viewports.',
      evidence: ['DOM analysis across 8 pages', '14 automated accessibility checks', 'Viewport comparison'],
      confidence: 0.95
    },
    firstImpression: {
      score: 7.0,
      rationale: 'Clean hero presentation with clear value statement, though primary call-to-action is visually secondary to background elements.',
      evidence: ['H1 headline present', 'Hero image loaded in 320ms', 'Subheadline text visible above fold'],
      confidence: 0.92
    },
    informationArchitecture: {
      score: 6.5,
      rationale: 'Primary navigation is concise (5 items), but portfolio categories lack clear filtering breadcrumbs.',
      evidence: ['5 header nav links parsed', 'No secondary breadcrumb elements on deep project pages'],
      confidence: 0.90
    },
    navigation: {
      score: 6.8,
      rationale: 'Sticky header provides persistent navigation on desktop, mobile menu requires 2 taps to reach core projects.',
      evidence: ['Header fixed position confirmed', 'Mobile hamburger menu element detected'],
      confidence: 0.94
    },
    visualHierarchy: {
      score: 7.2,
      rationale: 'Strong font weight contrast between H1/H2 and body text. Good use of whitespace around portfolio cards.',
      evidence: ['Inter typography family computed', 'Heading ratio 2.4x body size'],
      confidence: 0.96
    },
    content: {
      score: 6.1,
      rationale: 'Well-written project summaries, but some technical jargon reduces readability for HR/recruiter scans.',
      evidence: ['Readability index calculated', 'Word count average 450 per project page'],
      confidence: 0.88
    },
    portfolioProduct: {
      score: 7.5,
      rationale: 'High quality case study breakdowns with clear problem statements and visual outcomes.',
      evidence: ['4 detailed case study pages scanned', 'High image-to-text balance'],
      confidence: 0.93
    },
    conversion: {
      score: 6.0,
      rationale: 'Contact form is located at page footer only; lacks quick scheduling or inline resume download CTA in hero.',
      evidence: ['Contact form at bottom of page', 'No sticky CTA bar on mobile scroll'],
      confidence: 0.91
    },
    trustCredibility: {
      score: 7.8,
      rationale: 'Verified social profiles (LinkedIn, GitHub), clear professional timeline, and client testimonials present.',
      evidence: ['External social links with rel attributes', 'Testimonial section detected with 3 quotes'],
      confidence: 0.97
    },
    accessibility: {
      score: 5.5,
      rationale: '3 images missing alt attribute, 2 link elements lack aria-label descriptions, contrast ratio on sub-nav muted text is 3.8:1 (WCAG AA requires 4.5:1).',
      evidence: ['Automated accessibility scanner output', 'Computed color contrast evaluation'],
      confidence: 0.98
    },
    mobileUX: {
      score: 6.5,
      rationale: 'Layout responds cleanly down to 390px, but 2 interactive buttons have touch targets under 44x44px.',
      evidence: ['Mobile viewport 390x844 rendering test', 'Computed bounding rect dimensions'],
      confidence: 0.94
    },
    interactionDesign: {
      score: 6.9,
      rationale: 'Smooth micro-interactions on button hover, but tab switching animation lacks focus outline indicators.',
      evidence: ['CSS transition styles detected', 'Focus indicator state inspection'],
      confidence: 0.89
    }
  },

  executiveSummary: {
    overallAssessment: 'The website demonstrates a high design standard with strong visual presentation and compelling portfolio case studies. However, conversion efficiency and accessibility compliance can be improved significantly through targeted micro-optimizations without rebuilding the site structure.',
    overallScore: 6.6,
    strongestAreas: [
      'Visual Hierarchy & Typography Scaling',
      'Portfolio & Case Study Content Storytelling',
      'Trust & Professional Credibility Signals'
    ],
    biggestProblems: [
      'Sub-optimal CTA placement on mobile viewports (Contact CTA only in footer)',
      'Accessibility gaps (missing image alt tags & low contrast on secondary text)',
      'Lack of quick interactive filters on portfolio showcase items'
    ],
    primaryOpportunities: [
      'Add a floating "Get in Touch / Resume" CTA bar on mobile screens',
      'Elevate contrast ratios on body subtext from 3.8:1 to >4.5:1',
      'Introduce interactive tag filtering (SaaS, Design System, FinTech) on Case Studies'
    ],
    p0Priorities: [
      'UX-001: Fix low contrast on secondary metadata text (WCAG 1.4.3 AA compliance)',
      'UX-002: Add prominent primary contact CTA in mobile header'
    ],
    finalRecommendation: 'Improve, do not redesign from scratch'
  },

  pages: [
    {
      url: 'https://pankajpede.github.io/aboutme/',
      title: 'Home / Overview',
      pageType: 'Homepage',
      status: 200,
      wordCount: 850,
      headingCount: 8,
      imageCount: 6,
      linkCount: 24,
      score: 7.2,
      primaryStrength: 'Strong hero message & modern visual typography',
      primaryIssue: 'Primary CTA button lacks high-contrast visual focus on dark theme header',
      recommendation: 'Use primary brand accent color fill for "Hire Me / Contact" button in header'
    },
    {
      url: 'https://pankajpede.github.io/aboutme/#/projects',
      title: 'Projects Showcase',
      pageType: 'Portfolio',
      status: 200,
      wordCount: 1200,
      headingCount: 12,
      imageCount: 14,
      linkCount: 18,
      score: 6.8,
      primaryStrength: 'Rich visual project previews with clean card layouts',
      primaryIssue: 'No category filter tabs for quick recruiter navigation',
      recommendation: 'Add filter tags: [All] [Design Systems] [UX Research] [Mobile]'
    },
    {
      url: 'https://pankajpede.github.io/aboutme/#/case-study-1',
      title: 'Case Study: Enterprise Design System',
      pageType: 'Case Study',
      status: 200,
      wordCount: 1600,
      headingCount: 10,
      imageCount: 8,
      linkCount: 12,
      score: 7.5,
      primaryStrength: 'Comprehensive problem statement, methodology and metrics',
      primaryIssue: 'Images lack zoom modal / enlarged lightbox viewing',
      recommendation: 'Implement click-to-enlarge lightbox for high-res design system artifacts'
    },
    {
      url: 'https://pankajpede.github.io/aboutme/#/about',
      title: 'About & Experience',
      pageType: 'About',
      status: 200,
      wordCount: 650,
      headingCount: 5,
      imageCount: 2,
      linkCount: 10,
      score: 6.9,
      primaryStrength: 'Clear chronological experience timeline & skill tags',
      primaryIssue: 'PDF Resume download link is buried in body text',
      recommendation: 'Add dedicated "Download Resume (PDF)" primary button at top of bio'
    },
    {
      url: 'https://pankajpede.github.io/aboutme/#/contact',
      title: 'Contact',
      pageType: 'Contact',
      status: 200,
      wordCount: 220,
      headingCount: 3,
      imageCount: 0,
      linkCount: 8,
      score: 6.0,
      primaryStrength: 'Clean input form with quick email backup',
      primaryIssue: 'Form fields lack explicit label elements (relying on placeholders only)',
      recommendation: 'Add accessible <label> elements for input accessibility'
    }
  ],

  findings: [
    {
      id: 'UX-001',
      category: 'Accessibility',
      priority: 'P0',
      severity: 'high',
      confidence: 0.98,
      page: '/',
      element: 'Secondary Metadata Text (.text-muted)',
      title: 'Subtext fails WCAG 2.1 AA minimum contrast requirement',
      description: 'The computed color ratio for secondary timestamps and sub-labels (#8A8F99 on #1A1D24 background) is 3.8:1, which falls below the mandatory 4.5:1 minimum ratio for standard body text.',
      evidence: [
        'Foreground color: #8A8F99, Background color: #1A1D24',
        'Computed contrast ratio: 3.82:1 (Required: 4.5:1)',
        'Affected elements: 14 text spans across hero and portfolio cards'
      ],
      uxImpact: 'Users with mild visual impairments or viewing on mobile screens in sunlight cannot read key project dates and metadata.',
      recommendation: [
        'Increase text color brightness to #A0A6B2 (achieving a 4.8:1 contrast ratio)',
        'Ensure all sub-labels maintain minimum 4.5:1 ratio across light and dark themes'
      ],
      principle: 'Perceivable (WCAG 1.4.3 Contrast Minimum)',
      evidenceType: 'automated',
      owner: 'UI Lead / Frontend'
    },
    {
      id: 'UX-002',
      category: 'Conversion UX',
      priority: 'P0',
      severity: 'high',
      confidence: 0.94,
      page: '/',
      element: 'Mobile Header Navigation',
      title: 'Primary Contact CTA missing from mobile viewport sticky header',
      description: 'On mobile screen widths (390px), the header only displays a hamburger menu icon without a persistent action button. Users must open the menu to find contact options.',
      evidence: [
        'Viewport: 390x844 mobile breakpoint',
        'Header DOM tree: logo + hamburger icon only',
        'Contact link requires 2 interaction steps (Tap Menu -> Tap Contact)'
      ],
      uxImpact: 'Recruiters and prospective clients browsing on mobile devices experience high friction when trying to send an inquiry or call.',
      recommendation: [
        'Add a compact "Contact" pill button directly in the sticky mobile navbar next to the menu icon',
        'Include a fixed bottom sticky bar on mobile with "View Case Studies" and "Book Call"'
      ],
      principle: 'Conversion Efficiency & Friction Reduction',
      evidenceType: 'heuristic',
      owner: 'Product Designer / UX Architect'
    },
    {
      id: 'UX-003',
      category: 'Visual Hierarchy',
      priority: 'P1',
      severity: 'medium',
      confidence: 0.91,
      page: '/#projects',
      element: 'Portfolio Grid Cards',
      title: 'Project card hover triggers lack keyboard focus state indicator',
      description: 'Portfolio cards feature CSS transform hover states for pointer devices, but keyboard navigation via Tab key does not render a visible outline or focus ring.',
      evidence: [
        'CSS rule :focus-visible is unset or set to outline: none',
        'Keyboard navigation simulation failed visual focus check on 4 card links'
      ],
      uxImpact: 'Keyboard-only and screen reader users cannot visually track their active position while scanning project cards.',
      recommendation: [
        'Add distinct :focus-visible focus ring style: outline: 2px solid #4F46E5; outline-offset: 4px;',
        'Ensure focus order matches visual DOM flow'
      ],
      principle: 'Operable (WCAG 2.4.7 Focus Visible)',
      evidenceType: 'accessibility',
      owner: 'Frontend Engineer'
    },
    {
      id: 'UX-004',
      category: 'Information Architecture',
      priority: 'P1',
      severity: 'medium',
      confidence: 0.89,
      page: '/#projects',
      element: 'Portfolio Showcase Section',
      title: 'Missing category filtering mechanism for diverse project types',
      description: 'All 8 portfolio projects are presented in a single vertical stream without category tabs, requiring users to scroll through all items to find specific domain expertise.',
      evidence: [
        '8 projects listed in single column/grid',
        'No filter component present in DOM above grid'
      ],
      uxImpact: 'Hiring managers seeking specifically "Design System" or "FinTech" work must inspect cards manually.',
      recommendation: [
        'Implement animated filter tabs: [All] [Design Systems] [Enterprise SaaS] [Mobile Apps]',
        'Add project tags on card previews for instant scanning'
      ],
      principle: 'Recognition Over Recall & Choice Reduction',
      evidenceType: 'heuristic',
      owner: 'UX Architect'
    },
    {
      id: 'UX-005',
      category: 'Mobile UX',
      priority: 'P2',
      severity: 'medium',
      confidence: 0.92,
      page: '/#about',
      element: 'Skills Badge Group',
      title: 'Touch target size for skill tags falls below 44x44px threshold',
      description: 'Interactive skill filter pills have computed dimensions of 32x26px with a padding of 4px, violating mobile ergonomics standards.',
      evidence: [
        'Skill pill computed dimensions: 32px width x 26px height',
        'Minimum recommended touch target: 44px x 44px (Apple HIG & Android Material)'
      ],
      uxImpact: 'Users tapping skill tags on mobile frequently trigger adjacent tags by mistake.',
      recommendation: [
        'Increase tag padding to py-2 px-3 and add minimum height of 40px',
        'Ensure touch target buffer spacing of at least 8px between tags'
      ],
      principle: 'Mobile Ergonomics & Touch Accuracy',
      evidenceType: 'automated',
      owner: 'UI Designer'
    },
    {
      id: 'UX-006',
      category: 'Content Strategy',
      priority: 'P2',
      severity: 'low',
      confidence: 0.86,
      page: '/#about',
      element: 'Resume Callout Section',
      title: 'Resume download lacks file metadata (size, format, updated date)',
      description: 'The resume callout button reads "Download Resume" without indicating format (.pdf), file size (1.2 MB), or last update date (2026).',
      evidence: [
        'Anchor text parsed: "Download Resume"',
        'No metadata span attached to CTA button'
      ],
      uxImpact: 'Users are reluctant to click download buttons when file type and security information is unspecified.',
      recommendation: [
        'Update CTA label to: "Download Resume (PDF • 1.2 MB)"',
        'Add small inline badge: "Updated Sept 2026"'
      ],
      principle: 'Predictability & Informed Interaction',
      evidenceType: 'heuristic',
      owner: 'Content Strategist'
    }
  ],

  firstImpression: {
    heroClarity: 'High clarity. The primary hero headline immediately communicates executive role ("Lead Product Designer") and target industry.',
    positioning: 'Positioned as an experienced enterprise product designer specializing in design systems and complex SaaS tools.',
    visualImpact: 'Clean dark mode theme with modern crisp typography (Inter) creates a professional consulting vibe.',
    firstCTA: 'Secondary outline style button ("View Work") blends slightly into dark background.',
    valueProposition: 'Strong headline statement: "Crafting Enterprise Product Experiences & Design Systems".',
    keyObservations: [
      'Hero text loads instantly without layout shifts',
      'Value statement is clear within 3 seconds of scanning',
      'Primary CTA would benefit from higher background contrast fill'
    ]
  },

  informationArchitecture: {
    currentIA: [
      'Home (Overview)',
      'Projects (Grid list)',
      'Case Studies (Individual pages)',
      'About / Experience',
      'Contact'
    ],
    recommendedIA: [
      'Home (Hero + Featured Case Studies + Metric Highlights)',
      'Work / Portfolio (With filter tags: Design Systems, SaaS, FinTech)',
      'About (Bio + Career Timeline + Resume Download)',
      'Insights / Articles (Optional thought leadership)',
      'Contact (Inline form + Calendly scheduling widget)'
    ],
    decisionJourney: [
      'Discover (Land on Hero & absorb value proposition)',
      'Understand (Scan core competencies & key metrics)',
      'Evaluate (Deep-dive into 1-2 detailed Case Studies)',
      'Trust (Review client testimonials & career timeline)',
      'Convert (Download Resume or Send Direct Message)'
    ],
    navigationIssues: [
      'No secondary breadcrumb trail on deep case study pages',
      'Footer links duplicate header links without group titles'
    ]
  },

  visualHierarchy: {
    typographyObservations: [
      'Heading hierarchy is well-structured using Inter font family',
      'Line height on body text is comfortable at 1.6x font size',
      'Subtext color contrast requires brightness boost for AA compliance'
    ],
    spacingLayout: [
      'Grid container max-width set to 1280px with uniform 24px margins',
      'Vertical section spacing is consistent at 80px (desktop)'
    ],
    ctaProminence: [
      'Header CTA uses outline style; recommendation to switch to solid accent fill',
      'Footer contact CTA has good size (48px height) and bold weight'
    ],
    cardConsistency: [
      'Portfolio cards maintain consistent 16:9 image aspect ratio',
      'Hover elevation animation adds pleasant tactile feedback'
    ],
    interactionPatterns: [
      'Transitions use smooth 200ms cubic-bezier timing',
      'Focus rings are missing on interactive card links'
    ]
  },

  contentAndTrust: {
    messagingClarity: [
      'Clear, concise headline writing without fluff',
      'Case study summaries include concrete problem statements'
    ],
    readabilityScore: 'Grade 10 (Flesch-Kincaid) — Suitable for executive tech audience',
    trustSignals: [
      'Verified LinkedIn & GitHub profile links',
      'Client logos displayed for enterprise credibility',
      '3 recommendations with author name, title, and avatar'
    ],
    socialProof: [
      'Featured case study metrics: "+35% design velocity", "Used by 40+ engineers"',
      'Testimonial quotes from Design Directors and Product VPs'
    ],
    credibilityGaps: [
      'No mention of security clearance or design system governance process',
      'Resume update date absent on main CTA'
    ]
  },

  accessibility: {
    summary: 'The site achieves a basic accessibility score of 5.5/10. Fundamental HTML elements are present (lang="en", single H1 per page), but contrast ratios on secondary text and missing keyboard focus outlines prevent full WCAG 2.1 AA compliance.',
    wcagComplianceEstimate: 'Partial Conformance (WCAG 2.1 AA)',
    checks: [
      {
        id: 'A11Y-01',
        category: 'Language & Document',
        item: 'Document Language Attribute',
        status: 'PASS',
        details: '<html lang="en"> is explicitly set on root document.'
      },
      {
        id: 'A11Y-02',
        category: 'Headings',
        item: 'H1 Hierarchy & Order',
        status: 'PASS',
        details: 'Single H1 tag per page with sequential H2 -> H3 hierarchy.'
      },
      {
        id: 'A11Y-03',
        category: 'Images',
        item: 'Image Alt Text Descriptions',
        status: 'REVIEW',
        details: '3 of 14 images missing explicit alt attributes (decorative vs informative).'
      },
      {
        id: 'A11Y-04',
        category: 'Color Contrast',
        item: 'Body & Secondary Text Contrast',
        status: 'FAIL',
        details: 'Secondary text ratio #8A8F99 on #1A1D24 is 3.8:1 (Minimum 4.5:1 required).'
      },
      {
        id: 'A11Y-05',
        category: 'Navigation',
        item: 'Keyboard Focus Visibility',
        status: 'FAIL',
        details: ':focus-visible outline missing on portfolio grid card links.'
      },
      {
        id: 'A11Y-06',
        category: 'Forms',
        item: 'Form Input Label Association',
        status: 'REVIEW',
        details: 'Contact inputs rely on placeholder attributes without explicit <label> tags.'
      },
      {
        id: 'A11Y-07',
        category: 'Mobile Ergonomics',
        item: 'Touch Target Minimum Dimensions',
        status: 'REVIEW',
        details: 'Skill tags are 32x26px; requires 44x44px minimum touch target size.'
      },
      {
        id: 'A11Y-08',
        category: 'Screen Reader',
        item: 'Aria Landmarks & Regions',
        status: 'PASS',
        details: '<header>, <main>, <nav>, and <footer> semantic regions detected.'
      }
    ]
  },

  mobile: {
    summary: 'Mobile responsiveness is technically sound with zero horizontal scrolling at 390px width. Primary UX improvements relate to navigation efficiency and touch target padding.',
    viewports: [
      {
        device: 'Desktop',
        resolution: '1440 × 900',
        navigationState: 'Full header navigation visible with inline links',
        layoutObservations: ['3-column portfolio grid', '80px section padding', 'Optimal reading line length (70 characters)'],
        touchTargetPass: true,
        horizontalOverflow: false,
        typographyLegibility: 'Excellent (16px base font size)'
      },
      {
        device: 'Tablet',
        resolution: '768 × 1024',
        navigationState: 'Header shrinks to compact bar, logo + menu link',
        layoutObservations: ['2-column portfolio grid', '48px section padding', 'Clean tablet portrait stack'],
        touchTargetPass: true,
        horizontalOverflow: false,
        typographyLegibility: 'Good'
      },
      {
        device: 'Mobile',
        resolution: '390 × 844',
        navigationState: 'Hamburger slide-over drawer',
        layoutObservations: ['Single column stacked layout', '24px horizontal padding', 'Contact form inputs full width'],
        touchTargetPass: false,
        horizontalOverflow: false,
        typographyLegibility: 'Good (15px mobile body size)'
      }
    ],
    keyIssues: [
      'Contact CTA requires opening hamburger menu on mobile viewports',
      'Skill filter tags on About page are difficult to tap accurately',
      'Case study screenshots appear small without zoom/lightbox capability'
    ]
  },

  conversion: {
    journeys: [
      {
        persona: 'Recruiter',
        steps: [
          { stepName: 'Land on Hero', page: '/', recommendation: 'See role, years experience & top skill tags immediately' },
          { stepName: 'View Resume', page: '/#about', frictionPoint: 'Resume link buried in body text', recommendation: 'Prominent "Download Resume (PDF)" button in hero sub-header' },
          { stepName: 'Scan Work', page: '/#projects', recommendation: 'Filter by "Enterprise SaaS" case studies' },
          { stepName: 'Reach Out', page: '/#contact', frictionPoint: 'Must scroll to footer', recommendation: 'Sticky contact button in nav header' }
        ],
        overallFriction: 'Medium — Recruiter journey takes ~4 clicks to download resume or reach out.',
        conversionOpportunity: 'High — Adding top-level Resume & Contact CTAs will increase recruiter contact rate by ~30%.'
      },
      {
        persona: 'Client',
        steps: [
          { stepName: 'Land on Hero', page: '/', recommendation: 'Understand design system & consulting capabilities' },
          { stepName: 'Inspect Case Study', page: '/#case-study-1', recommendation: 'Verify problem solving methodology & business impact' },
          { stepName: 'Check Testimonials', page: '/#about', recommendation: 'Validate credibility with client quotes' },
          { stepName: 'Book Consultation', page: '/#contact', frictionPoint: 'Form only, no direct call calendar link', recommendation: 'Add Calendly widget or direct email link' }
        ],
        overallFriction: 'Medium — High quality case studies build trust, but contact form is passive.',
        conversionOpportunity: 'Medium — Integrating a direct calendar booking CTA can capture high-intent clients faster.'
      }
    ],
    conversionFriction: [
      'Primary CTA ("Contact Me") is placed exclusively in the page footer',
      'No instant resume download CTA in hero section',
      'Form fields lack instant inline validation feedback'
    ],
    ctaHierarchyRecommendation: [
      'Primary CTA: Solid Accent Fill "Get in Touch" / "Hire Me" (Header & Hero)',
      'Secondary CTA: Outline Style "Explore Case Studies" (Hero)',
      'Tertiary CTA: Text Link + Icon "Download Resume (PDF • 1.2MB)"'
    ]
  },

  priorityMatrix: [
    {
      id: 'UX-001',
      category: 'Accessibility',
      priority: 'P0',
      severity: 'high',
      confidence: 0.98,
      page: '/',
      element: 'Subtext (.text-muted)',
      title: 'Fix color contrast ratio on secondary text spans to >4.5:1',
      description: 'Brighten subtext hex code from #8A8F99 to #A0A6B2 to satisfy WCAG AA contrast rules.',
      evidence: ['Contrast computed at 3.8:1', 'Fails WCAG 1.4.3 AA'],
      uxImpact: 'Essential for readability across devices & ambient light.',
      recommendation: ['Update global CSS variable --color-text-muted to #A0A6B2'],
      principle: 'Perceivable',
      evidenceType: 'automated',
      owner: 'Frontend Dev (Est: 30 mins)'
    },
    {
      id: 'UX-002',
      category: 'Conversion UX',
      priority: 'P0',
      severity: 'high',
      confidence: 0.94,
      page: '/',
      element: 'Mobile Header Nav',
      title: 'Add primary Contact CTA button to mobile sticky header bar',
      description: 'Ensure mobile visitors can access contact options without opening the navigation menu.',
      evidence: ['Hamburger menu conceals primary action', 'Mobile viewport 390px'],
      uxImpact: 'Reduces friction for recruiters and prospective clients on mobile.',
      recommendation: ['Render mini "Contact" button beside hamburger icon'],
      principle: 'Conversion Efficiency',
      evidenceType: 'heuristic',
      owner: 'UX Architect / UI Dev (Est: 2 hours)'
    },
    {
      id: 'UX-003',
      category: 'Accessibility',
      priority: 'P1',
      severity: 'medium',
      confidence: 0.91,
      page: '/#projects',
      element: 'Portfolio Grid Cards',
      title: 'Add visible :focus-visible ring indicator for keyboard navigation',
      description: 'Provide a clear outline indicator when keyboard users tab through project cards.',
      evidence: ['Outline: none detected', 'Focus state visual check failed'],
      uxImpact: 'Critical for keyboard accessibility compliance.',
      recommendation: ['Apply 2px solid outline on :focus-visible pseudo class'],
      principle: 'Operable',
      evidenceType: 'accessibility',
      owner: 'UI Dev (Est: 1 hour)'
    },
    {
      id: 'UX-004',
      category: 'Information Architecture',
      priority: 'P1',
      severity: 'medium',
      confidence: 0.89,
      page: '/#projects',
      element: 'Projects Section',
      title: 'Add interactive category filter tabs on portfolio showcase',
      description: 'Allow visitors to filter projects by specialization (Design Systems, SaaS, FinTech).',
      evidence: ['8 items listed in continuous grid', 'No filter controls'],
      uxImpact: 'Speeds up scanning for specific domain expertise.',
      recommendation: ['Add filter bar component above portfolio grid'],
      principle: 'Recognition Over Recall',
      evidenceType: 'heuristic',
      owner: 'Product Designer (Est: 4 hours)'
    },
    {
      id: 'UX-005',
      category: 'Mobile UX',
      priority: 'P2',
      severity: 'medium',
      confidence: 0.92,
      page: '/#about',
      element: 'Skill Badges',
      title: 'Expand skill badge touch targets to minimum 44x44px size',
      description: 'Increase touch area padding to prevent mis-taps on mobile devices.',
      evidence: ['Skill tag height: 26px', 'Minimum standard: 44px'],
      uxImpact: 'Improves touch ergonomics on smartphones.',
      recommendation: ['Increase padding and touch target hit area'],
      principle: 'Mobile Ergonomics',
      evidenceType: 'automated',
      owner: 'UI Dev (Est: 1 hour)'
    },
    {
      id: 'UX-006',
      category: 'Content Strategy',
      priority: 'P2',
      severity: 'low',
      confidence: 0.86,
      page: '/#about',
      element: 'Resume Button',
      title: 'Attach file metadata to Resume download callout button',
      description: 'Inform users of format (.pdf), file size, and last update timestamp.',
      evidence: ['Plain "Download Resume" text', 'Missing file details'],
      uxImpact: 'Builds user trust and sets clear expectations before download.',
      recommendation: ['Update button label with PDF & size badge'],
      principle: 'Predictability',
      evidenceType: 'heuristic',
      owner: 'Content Strategist (Est: 30 mins)'
    }
  ],

  roadmap: [
    {
      timeframe: '0–2 weeks',
      phaseTitle: 'Phase 1: Critical Fixes & Accessibility Baseline (P0)',
      tasks: [
        {
          title: 'Color Contrast Ratio Fix',
          priority: 'P0',
          category: 'Accessibility',
          expectedImpact: 'Achieve WCAG 2.1 AA contrast compliance across all pages',
          successMetrics: '100% text elements pass 4.5:1 ratio test',
          owner: 'Frontend Lead',
          estimatedEffort: '0.5 days'
        },
        {
          title: 'Mobile Header Contact CTA',
          priority: 'P0',
          category: 'Conversion UX',
          expectedImpact: 'Instant access to contact options on mobile viewports',
          successMetrics: '+25% mobile contact form initiation rate',
          owner: 'UI Engineer',
          estimatedEffort: '1 day'
        },
        {
          title: 'Keyboard Focus Visibility',
          priority: 'P1',
          category: 'Accessibility',
          expectedImpact: 'Seamless keyboard navigation through portfolio cards',
          successMetrics: 'Zero focus indicator warnings in audit scanner',
          owner: 'Frontend Dev',
          estimatedEffort: '0.5 days'
        }
      ]
    },
    {
      timeframe: '2–5 weeks',
      phaseTitle: 'Phase 2: Portfolio Filtering & Conversion Enhancement (P1)',
      tasks: [
        {
          title: 'Portfolio Filter Tabs',
          priority: 'P1',
          category: 'Information Architecture',
          expectedImpact: 'Faster recruiter navigation by domain specialization',
          successMetrics: '-40% time to view relevant case study',
          owner: 'Product Designer',
          estimatedEffort: '2 days'
        },
        {
          title: 'Hero CTA Hierarchy Refinement',
          priority: 'P1',
          category: 'Conversion UX',
          expectedImpact: 'Clearer primary vs secondary visual action emphasis',
          successMetrics: '+15% overall hero CTA click-through rate',
          owner: 'UX Designer',
          estimatedEffort: '1 day'
        },
        {
          title: 'Case Study Lightbox / Zoom',
          priority: 'P2',
          category: 'Interaction Design',
          expectedImpact: 'Full resolution inspection of design artifacts',
          successMetrics: 'Increased engagement time per case study page',
          owner: 'Frontend Dev',
          estimatedEffort: '2 days'
        }
      ]
    },
    {
      timeframe: '5–8 weeks',
      phaseTitle: 'Phase 3: Content Optimization & Trust Building (P2)',
      tasks: [
        {
          title: 'Resume Download Metadata Callout',
          priority: 'P2',
          category: 'Content Strategy',
          expectedImpact: 'Increased user confidence before initiating download',
          successMetrics: '+20% resume download conversion rate',
          owner: 'Content Strategist',
          estimatedEffort: '0.5 days'
        },
        {
          title: 'Mobile Touch Target Ergonomics',
          priority: 'P2',
          category: 'Mobile UX',
          expectedImpact: 'Zero accidental taps on skill pills and tags',
          successMetrics: '100% interactive elements meeting 44x44px spec',
          owner: 'UI Designer',
          estimatedEffort: '1 day'
        }
      ]
    },
    {
      timeframe: '8–12 weeks',
      phaseTitle: 'Phase 4: Advanced Interaction Polish & Analytics (P3)',
      tasks: [
        {
          title: 'Calendly Direct Booking Integration',
          priority: 'P3',
          category: 'Conversion UX',
          expectedImpact: 'Frictionless consultation scheduling for high-intent leads',
          successMetrics: 'Direct calendar bookings recorded',
          owner: 'Full Stack Dev',
          estimatedEffort: '1.5 days'
        },
        {
          title: 'Micro-interaction Feedback Tuning',
          priority: 'P3',
          category: 'Interaction Design',
          expectedImpact: 'Polished micro-animations across hover and active states',
          successMetrics: 'Positive feedback in user testing sessions',
          owner: 'UX Engineer',
          estimatedEffort: '2 days'
        }
      ]
    }
  ],

  components: [
    {
      name: 'Hero Header Pattern',
      description: 'Top overview block introducing role, specialty, and quick CTA buttons.',
      currentIssues: [
        'Outline button lacks strong visual contrast against dark background',
        'Mobile breakpoint drops contact CTA into hamburger drawer'
      ],
      recommendedPattern: 'Dual CTA cluster: Solid primary fill button ("Get in Touch") + Secondary outline button ("Explore Work"). On mobile, show a compact sticky header bar with an inline Contact pill.',
      keyAccessibilityRule: 'Maintain 4.5:1 text-to-background contrast and explicit focus rings.',
      bestPracticeSpec: 'Min height: 480px, Heading ratio: 2.5x body font size, CTA button height: 48px.'
    },
    {
      name: 'Navigation Bar Pattern',
      description: 'Global site navigation bar spanning top of viewport.',
      currentIssues: [
        'Muted nav link text ratio is 3.8:1',
        'Mobile hamburger menu requires 2 taps to reach contact page'
      ],
      recommendedPattern: 'Sticky header with high-contrast text links (#E2E8F0 on dark header). Include compact direct action button on mobile viewports.',
      keyAccessibilityRule: 'Use semantic <nav> element with aria-label="Main Navigation".',
      bestPracticeSpec: 'Header height: 64px, Backdrop blur: 12px, Link padding: 12px horizontal.'
    },
    {
      name: 'Portfolio Card Pattern',
      description: 'Grid item showing project thumbnail, title, tags, and summary.',
      currentIssues: [
        'Missing keyboard focus ring indicator',
        'No tag filtering controls above grid'
      ],
      recommendedPattern: 'Card wrapper with 16:9 image container, bold H3 title, skill tag pills, and explicit hover/focus state outline.',
      keyAccessibilityRule: ':focus-visible outline: 2px solid #4F46E5 with 4px offset.',
      bestPracticeSpec: 'Card aspect ratio: 16:9 thumbnail, Border radius: 16px, Hover elevation: translateY(-4px).'
    },
    {
      name: 'Form & Input Pattern',
      description: 'Contact input fields for name, email, subject, and message.',
      currentIssues: [
        'Fields rely on placeholder text without <label> tags',
        'Missing explicit field focus contrast border'
      ],
      recommendedPattern: 'Floating label or explicit top-aligned label pattern. Highlight focused field with 2px brand border.',
      keyAccessibilityRule: 'Pair every <input> with a matching <label for="..."> element.',
      bestPracticeSpec: 'Input height: 44px, Font size: 16px (prevents iOS auto-zoom), Label font weight: 600.'
    },
    {
      name: 'Footer Pattern',
      description: 'Bottom section with copyright, social links, and backup navigation.',
      currentIssues: [
        'Social icons lack aria-label attributes',
        'Duplicate navigation links without grouping headings'
      ],
      recommendedPattern: 'Clean 3-column footer: Col 1 (Brand Bio & Copyright), Col 2 (Quick Links), Col 3 (Social Links with clear aria-labels).',
      keyAccessibilityRule: 'All icon-only buttons must have aria-label="LinkedIn Profile" etc.',
      bestPracticeSpec: 'Footer padding: 64px top/bottom, Border top: 1px solid rgba(255,255,255,0.1).'
    }
  ],

  evidence: {
    verifiedEvidence: [
      'Parsed HTML DOM from https://pankajpede.github.io/aboutme/',
      'Computed CSS styles for text colors, background colors, font sizes, and spacing',
      'Automated accessibility check results for alt attributes, headings, and language tags',
      'Viewport layout measurements across Desktop (1440px), Tablet (768px), and Mobile (390px)'
    ],
    aiInterpretation: [
      'First impression clarity assessment based on hero text hierarchy and positioning',
      'Information architecture recommendation for tag-based portfolio filtering',
      'User journey friction analysis for Recruiter and Client personas',
      'Prioritised UX Roadmap phase groupings and effort estimates'
    ],
    requiresManualValidation: [
      'Screen reader VoiceOver / NVDA auditory flow validation',
      'Real user testing for content jargon comprehension among non-technical recruiters',
      'Colorblindness simulation under bright outdoor sunlight conditions'
    ],
    limitations: [
      'Automated accessibility checks evaluate roughly 30-40% of WCAG guidelines',
      'Performance measurements reflect client browser environment and proxy load times',
      'Full WCAG 2.1 AA compliance certification requires manual human audit'
    ],
    codeSnippets: [
      {
        id: 'SNIP-01',
        title: 'Secondary Metadata Low Contrast (WCAG 1.4.3)',
        category: 'Accessibility & Contrast',
        language: 'css',
        selector: 'header .nav-subtitle, .project-card .date-badge',
        xpath: '/html/body/div[1]/header/div/span[2]',
        code: `/* Computed CSS Extract from https://pankajpede.github.io/aboutme/ */
.nav-subtitle {
  color: #94a3b8;           /* Light gray text */
  background-color: #ffffff; /* White background */
  font-size: 11px;
}

/* AUDIT CHECK: Contrast Ratio = 2.81:1 */
/* REQUIRED (WCAG AA): 4.5:1 Minimum Ratio */
/* STATUS: FAILS AA COMPLIANCE */`,
        provenanceTag: 'DOM Computed Style Extractor',
        confidence: 0.98,
        status: 'FAIL',
        issueRef: 'UX-001',
        explanation: 'Extracted computed text color #94a3b8 against white background fails WCAG 2.1 AA 4.5:1 minimum threshold.'
      },
      {
        id: 'SNIP-02',
        title: 'Hero CTA Contact Trigger Missing Mobile Placement',
        category: 'Mobile UX & Conversion',
        language: 'html',
        selector: 'header nav .nav-actions',
        xpath: '/html/body/header/nav/div[2]',
        code: `<!-- Live DOM HTML Extract from Mobile Viewport (390px) -->
<nav class="flex items-center justify-between px-4 py-3">
  <a href="/" class="brand-logo font-bold">Pankaj Pede</a>
  
  <!-- ISSUE: Contact CTA button is omitted on mobile header -->
  <!-- Navigation relies solely on hidden drawer toggle -->
  <button class="mobile-menu-toggle" aria-expanded="false">
    <svg class="w-6 h-6"><!-- Hamburger Icon --></svg>
  </button>
</nav>`,
        provenanceTag: 'Mobile Viewport Crawler (390px)',
        confidence: 0.95,
        status: 'WARN',
        issueRef: 'UX-002',
        explanation: 'Header CTA action button is suppressed under 768px breakpoint, forcing mobile users to open drawer to contact.'
      },
      {
        id: 'SNIP-03',
        title: 'Portfolio Card Focus Outline Unset',
        category: 'Keyboard Navigation',
        language: 'css',
        selector: '.project-card-link:focus',
        xpath: '/html/body/main/section[2]/div/a[1]',
        code: `/* CSS Rule Analysis */
.project-card-link:focus,
.project-card-link:focus-visible {
  outline: none; /* ⚠️ Removes native browser focus ring */
  box-shadow: none;
}

/* RECOMMENDED FIX */
.project-card-link:focus-visible {
  outline: 2px solid #4F46E5;
  outline-offset: 4px;
}`,
        provenanceTag: 'Keyboard Navigation Inspector',
        confidence: 0.91,
        status: 'FAIL',
        issueRef: 'UX-003',
        explanation: 'Explicit outline:none suppresses focus indication when tabbing through project showcase grid.'
      }
    ],
    screenshotProofs: [
      {
        id: 'PROOF-01',
        title: 'Header Contact Button Contrast & Mobile Omission',
        componentName: 'Main Top Header Bar',
        page: 'Home Page (/)',
        selector: 'header.site-header',
        tag: 'Mobile CTA Friction',
        status: 'FAIL',
        elementMockType: 'cta',
        description: 'Header CTA is hidden on screens <768px. Mobile users must navigate 3 clicks down to reach contact info.',
        computedStyleProof: 'Display: hidden on sm viewports; Text contrast: 3.4:1'
      },
      {
        id: 'PROOF-02',
        title: 'Project Card Focus Outline Suppression',
        componentName: 'Portfolio Grid Showcase',
        page: 'Projects (/ #projects)',
        selector: '.portfolio-grid > .card',
        tag: 'WCAG 2.4.7 Focus Ring',
        status: 'FAIL',
        elementMockType: 'focus',
        description: 'Keyboard tab focus does not highlight active project card links due to outline:none CSS rule.',
        computedStyleProof: 'Outline: none; Focus-visible: 0px'
      },
      {
        id: 'PROOF-03',
        title: 'Skill Tag Touch Target Sizing',
        componentName: 'About Me Skill Pills',
        page: 'About (/ #about)',
        selector: '.skill-tags > span.pill',
        tag: 'Touch Target Target 44px',
        status: 'WARN',
        elementMockType: 'contrast',
        description: 'Skill pills measure 28px height on touch screens, below the 44px recommended mobile tap target size.',
        computedStyleProof: 'Height: 28px; Padding: 4px 8px'
      }
    ]
  },

  methodology: {
    crawlDepth: 2,
    viewportSizes: ['1440x900', '768x1024', '390x844'],
    automatedCheckCount: 24,
    aiModelUsed: 'OX Heuristic UX Intelligence Engine (Powered by Gemini & Deterministic Rules)',
    scoringMethodology: 'Weighted multi-factor scoring algorithm evaluating 12 key UX dimensions from 0 to 10 based on evidence count, severity impact, and WCAG AA pass rates.',
    disclaimer: 'This UX Audit Report is generated through automated DOM extraction, deterministic heuristic rule checking, and AI-assisted UX analysis. It is intended to guide design improvements and does not replace formal legal WCAG compliance certification.'
  }
};
