export const categories = [
  'All topics',
  'Getting started',
  'Recording',
  'Performance',
  'Troubleshooting',
] as const;
export const faqs = [
  {
    id: 'start',
    category: 'Getting started',
    question: 'How do I start my first recording?',
    answer:
      'Open a world, press F6 to check your video settings, then Apply. Press F8 to start or stop recording, and F9 to pause or resume. Stop recording before changing settings.',
  },
  {
    id: 'install',
    category: 'Getting started',
    question: 'What do I need to install?',
    answer:
      'The current recorder build targets Minecraft Java 1.21.11, Java 21, Fabric Loader 0.19.5 or later, and 64-bit Windows. Put the single recorder JAR in your instance’s mods folder. The required Fabric API modules and recording libraries are bundled. Remove older copies of the recorder and fully restart Minecraft.',
  },
  {
    id: 'smooth',
    category: 'Performance',
    question: 'Which settings should I use for smooth video?',
    answer:
      'Start with 1920 × 1080, 60 FPS and CFR for evenly spaced output frames. Hardware encoding can help when supported. If capture cannot keep up, lower output resolution or FPS, or reduce expensive shaders and graphics settings. A 60 FPS file can still contain repeated frames when the game or encoder falls behind; performance depends on your hardware.',
  },
  {
    id: 'overlay',
    category: 'Recording',
    question: 'How do I hide the recording overlay?',
    answer:
      'Stop recording, then open F6 → Overlays. Turn Recording indicator off and press Apply. This hides the recording status, dropped-frame count and file-size display.',
  },
  {
    id: 'folder',
    category: 'Recording',
    question: 'Where are my recordings saved?',
    answer:
      'Open F6 → General → Open recordings folder. The default location is the recordings folder inside your Minecraft instance. In Modrinth, open your instance’s folder and look for recordings. If the button fails, update the recorder and check that your chosen folder exists and is writable.',
  },
  {
    id: 'native',
    category: 'Troubleshooting',
    question: 'Why does “native library integrity failed” appear?',
    answer:
      'Older builds could conflict with another mod’s recording libraries. Remove older active recorder JARs, install the latest recorder build, and fully close and restart Minecraft. If the error continues, report the exact message, your recorder version and the other recording mods you use.',
  },
  {
    id: 'cfr',
    category: 'Troubleshooting',
    question: 'What does “cannot sustain CFR rate” mean?',
    answer:
      'Capture or encoding is falling behind the requested frame rate. Current builds can warn and switch to variable timing for that recording. Try a lower recording FPS or resolution and check whether a supported hardware encoder is selected. Save the exact warning when reporting the issue.',
  },
  {
    id: 'audio',
    category: 'Recording',
    question: 'Can I record game audio and my microphone?',
    answer:
      'Game-process audio capture requires a supported Windows build (20348 or later). Microphone capture is optional and must be enabled. Check the Audio page before recording, and make a short test to confirm the selected devices and tracks.',
  },
  {
    id: 'recover',
    category: 'Troubleshooting',
    question: 'Can I recover an interrupted recording?',
    answer:
      'Open F6 → Diagnostics → Recover unfinished recordings. Recovery creates new files and preserves the originals. It is best effort: data that was never written cannot be recovered.',
  },
  {
    id: 'keys',
    category: 'Getting started',
    question: 'What are the default keyboard shortcuts?',
    answer:
      'F6 opens settings. F7 captures a screenshot. F8 starts or stops recording. F9 pauses or resumes. F10 triggers replay. Key conflicts with other mods may require rebinding controls in Minecraft.',
  },
];
