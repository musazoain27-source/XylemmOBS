-- =====================================================================
-- Optional seed data — realistic FAQ content answered by "XylemmOBS
-- Team" so the site isn't empty on first launch. Safe to run once
-- after supabase/schema.sql. Re-running will insert duplicates (there
-- is no uniqueness constraint on title), so only run it once, ideally
-- right after the schema is created and before real users submit
-- anything (so generated XOBS-Q-0001 etc. line up with these seeds).
-- =====================================================================

do $$
declare
  q_id uuid;
  q_public_id text;
begin
  -- Each entry: title, details, category, official answer.
  -- (username/email are set generically since these are seeded FAQs,
  -- not real user submissions.)

  -- 1
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'How do I start my first recording?',
    'I just installed XylemmOBS and I''m not sure how to actually begin recording a session.',
    '1.21.1', '2.4.0', 'installation', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Open a world, press F6 to check your video settings, then Apply. Press F8 to start or stop recording, and F9 to pause or resume. Stop recording before changing settings.',
    true);

  -- 2
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'What do I need to install?',
    'What are the requirements and dependencies for running the recorder?',
    '1.21.1', '2.4.0', 'installation', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'The current recorder build targets Minecraft Java 1.21.1, Java 21, Fabric Loader 0.19.5 or later, and 64-bit Windows. Put the single recorder JAR in your instance''s mods folder. The required Fabric API modules and recording libraries are bundled. Remove older copies of the recorder and fully restart Minecraft.',
    true);

  -- 3
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'Which settings should I use for smooth video?',
    'My recordings look choppy. What settings give the smoothest output?',
    '1.21.1', '2.4.0', 'performance', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Start with 1920x1080, 60 FPS and CFR for evenly spaced output frames. Hardware encoding can help when supported. If capture cannot keep up, lower output resolution or FPS, or reduce expensive shaders and graphics settings. A 60 FPS file can still contain repeated frames when the game or encoder falls behind; performance depends on your hardware.',
    true);

  -- 4
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'How do I hide the recording overlay?',
    'I don''t want the recording indicator showing up in my footage.',
    '1.21.1', '2.4.0', 'recording', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Stop recording, then open F6 -> Overlays. Turn Recording indicator off and press Apply. This hides the recording status, dropped-frame count and file-size display.',
    true);

  -- 5
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'Where are my recordings saved?',
    'I finished a recording but can''t find the output file.',
    '1.21.1', '2.4.0', 'recording', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Open F6 -> General -> Open recordings folder. The default location is the recordings folder inside your Minecraft instance. In Modrinth, open your instance''s folder and look for recordings. If the button fails, update the recorder and check that your chosen folder exists and is writable.',
    true);

  -- 6
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'Why does "native library integrity failed" appear?',
    'I get this error on startup after installing the recorder alongside other mods.',
    '1.21.1', '2.4.0', 'compatibility', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Older builds could conflict with another mod''s recording libraries. Remove older active recorder JARs, install the latest recorder build, and fully close and restart Minecraft. If the error continues, report the exact message, your recorder version and the other recording mods you use.',
    true);

  -- 7
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'What does "cannot sustain CFR rate" mean?',
    'I see this warning during long recording sessions.',
    '1.21.1', '2.4.0', 'compatibility', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Capture or encoding is falling behind the requested frame rate. Current builds can warn and switch to variable timing for that recording. Try a lower recording FPS or resolution and check whether a supported hardware encoder is selected. Save the exact warning when reporting the issue.',
    true);

  -- 8
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'Can I record game audio and my microphone?',
    'I want both game sound and my voice in the same recording.',
    '1.21.1', '2.4.0', 'audio', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Game-process audio capture requires a supported Windows build (20348 or later). Microphone capture is optional and must be enabled. Check the Audio page before recording, and make a short test to confirm the selected devices and tracks.',
    true);

  -- 9
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'Can I recover an interrupted recording?',
    'Minecraft crashed mid-recording and I''m hoping the footage isn''t lost.',
    '1.21.1', '2.4.0', 'compatibility', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'Open F6 -> Diagnostics -> Recover unfinished recordings. Recovery creates new files and preserves the originals. It is best effort: data that was never written cannot be recovered.',
    true);

  -- 10
  q_public_id := next_public_id('question');
  insert into questions (public_id, username, title, details, minecraft_version, xylemmobs_version, category, status)
  values (q_public_id, 'community', 'What are the default keyboard shortcuts?',
    'Is there a full list of the default hotkeys?',
    '1.21.1', '2.4.0', 'installation', 'answered')
  returning id into q_id;
  insert into replies (post_type, question_id, username, body, is_official)
  values ('question', q_id, 'XylemmOBS Team',
    'F6 opens settings. F7 captures a screenshot. F8 starts or stops recording. F9 pauses or resumes. F10 triggers replay. Key conflicts with other mods may require rebinding controls in Minecraft.',
    true);

end $$;
