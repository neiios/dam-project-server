-- User Data (including one admin)
-- Password is 'password'
INSERT INTO "user" (name, password, email, role)
VALUES 
    ('Maksim', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'max@sgf.lt', 'user'),
    ('Alice Johnson', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'alice@sgf.lt', 'user'),
    ('Bob Smith', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'bob@sgf.lt', 'user'),
    ('Charlie Brown', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'charlie@sgf.lt', 'admin'),
    ('David Lee', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'david@sgf.lt', 'user'),
    ('Emily Davis', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'emily@sgf.lt', 'user');

-- Conference Data
INSERT INTO conference (name, longitude, latitude, start_date, end_date, image_url, description, city)
VALUES
    ('React Conf 2024', -122.4194, 37.7749, '2024-08-12T09:00:00Z', '2024-08-13T17:30:00Z', 'https://conf.react.dev/social-image.png', 'Join Meta, Callstack, and the React team for the 7th React Conf as we celebrate over 10 years of React. Hear about the vision for React''s future from the multi-company team that builds React, some announcements, and from some of your favorite community members. Enjoy time with people who love React. Learn from the people building the tools you use every day. Share your own story. If you can''t join us in person, you can watch the event on our free livestream or catch up later with the recorded talks.', 'San Francisco'),
    ('JSConf EU',  13.404954, 52.520008 , '2024-07-20', '2024-07-24', 'https://www.devoxx.fr/wp-content/uploads/2022', 'JSConf EU 2019, our 10th anniversary, was the last edition of the event in its current form. We will not return in 2020. And neither will our sister conference CSSconf EU. We still love organizing community events, but we''ll take a break to consider what''s next.', 'Berlin, Germany');

INSERT INTO track (name, room, description, conference_id)
VALUES
    ('React 19', 'H.1234', 'Discover the latest updates and features in React 19. This track focuses on the enhancements and new capabilities of React 19, providing insights and practical examples to help developers leverage the newest improvements.', 1),
    ('SSR', 'M.1204', 'Server-side rendering in React allows developers to create dynamic web applications with interactive and performant user interfaces without relying on client-side JavaScript execution.', 1),
    ('Manifest V3', 'P.12514-S2', 'Learn about the upcoming changes in Chrome Extensions with Manifest V3, focusing on improved privacy, security, and performance.', 2),
    ('TDCD', 'P.1104', 'Test Driven Component Development (TDCD) helps you build and verify React components through rigorous testing, ensuring robust and reliable applications.', 2);

INSERT INTO article (title, authors, abstract, start_date, end_date, conference_id, track_id)
VALUES
    ('Cross Platform React', 'O. Zinoveva, N. Goel', 'React Native, over its first decade, has enabled developers to create cross-platform native apps using web-based React skills, with significant success at Meta and beyond. In this talk we will share our vision for the next decade and the building blocks we''ve already put into place to achieve this vision.', '2024-08-12T10:00:00Z', '2024-08-12T11:00:00Z', 1, 1),
    ('What''s new in React 19', 'L. Hallie', 'This visual technical talk provides a deep dive overview of React 19''s new features.', '2024-08-12T14:00:00Z', '2024-08-12T15:00:00Z', 1, 1),
    ('Vanilla React', 'R. Florence', 'In 2014, Ryan and Michael first published React Router. Over the past decade, React Router has been the backbone of countless React apps and has provided a stable foundation for anyone building with React. More recently, React Router has grown into a full-stack framework with some help from Remix and Shopify. This talk will explore what we''ve done to keep React Router up to date as React evolves, and show off some of the latest developments we''ve been working on.', '2024-08-13T09:00:00Z', '2024-08-13T10:00:00Z', 1, 1),
    ('Real-time server components', 'S. Pai', 'The evolution of Stateful Serverless infrastructure married with React Server Components is a highly compelling stack to build incredible real-time applications for the next age of User Interfaces. In this talk, we''ll see how regular React developers can take advantage of this paradigm and build amazing applications.', '2024-08-13T11:30:00Z', '2024-08-13T12:20:00Z', 1, 2),
    ('Universal Server Components in Expo Router', 'E. Bacon', 'A first-look at React Server Components for native and web with Expo Router—the universal React framework. What does it look like when data fetching and server-driven UI are first-class primitives in React Native, and what kinds of experiences does this unlock? Server rendering native views, streaming UI, bundle splitting, and parallel data fetching come together in a unified system for all platforms. It''s a new era of app development, powered by React.', '2024-08-13T14:00:00Z', '2024-08-13T15:30:00Z', 1, 2),
    ('Evolving Chrome Extensions with Manifest V3', 'S. Vincent', 'Browser extensions are a defining feature of the web experience, but they''re far from perfect. The Chrome team is planning to make a number of changes to improve privacy, security, and performance. In this session, we''ll dive into some of the biggest issues with the current platform, where we''d like the platform to be, and how the next version (Manifest V3) will help us get there.', '2024-07-20T12:00:00Z', '2024-07-20T17:00:00Z', 2, 3),
    ('TDCD: Test Driven Component Development', 'S. Vincent', 'Do you test your React components? I thought not, but why not? Often developers just don''t know how. CSS is hard. HTML is hard. JavaScript is hard. Conflating CSS, HTML, and JavaScript is exponentially harder. TDD can help! Learn how to drive a component''s behavior, agnostic of presentational concerns, with tests. Learn how to focus on the look and feel once you have a passing test suite. Learn that it''s possible to build and verify an entire web application, before even looking at it in a browser.', '2024-07-22T09:00:00Z', '2024-07-22T11:00:00Z', 2, 4);

-- Conference Questions
INSERT INTO questions (question, answer, status, conference_id, user_id)
VALUES
    ('What are the keynote speakers?', '', 'pending', 1, 1),
    ('Will there be a virtual option?', 'Yes, virtual tickets available', 'answered', 1, 2),
    ('How can I submit a paper?', 'Deadline has passed', 'answered', 2, 3),
    ('Are meals included with the ticket?', 'Yes, breakfast and lunch are provided.', 'answered', 1, 4),
    ('Can I get a refund if I cancel?', 'Refunds are available up to 30 days before the event.', 'answered', 2, 5),
    ('Is there a dress code for the conference?', 'Business casual is recommended.', 'answered', 1, 1),
    ('Will there be networking opportunities?', 'Yes, several networking sessions are scheduled.', 'answered', 1, 2),
    ('Are there any workshops available?', 'Yes, pre-conference workshops are available for an additional fee.', 'answered', 2, 3);

-- Article Questions
INSERT INTO article_questions (question, answer, status, article_id, user_id)
VALUES
    ('Are the slides available?', '', 'pending', 1, 1),
    ('Will there be breaks?', '', 'pending', 2, 1),
    ('Is there a video recording?', 'Yes, available on our YouTube channel', 'answered', 2, 5),
    ('How does this relate to real-world problems?', 'Applications in healthcare, finance, etc.', 'answered', 3, 1),
    ('Can I get a copy of the paper?', 'Yes, the paper is available for download on the conference website.', 'answered', 4, 2),
    ('Will there be a Q&A session?', 'Yes, a live Q&A session will follow the presentation.', 'answered', 5, 3),
    ('What prerequisites are needed to understand this talk?', 'Basic knowledge of React and JavaScript is recommended.', 'answered', 1, 4),
    ('How can I contact the author?', 'You can reach the author via email provided in the conference program.', 'answered', 2, 5),
    ('Are there any related articles?', 'Yes, references to related articles will be provided during the talk.', 'answered', 3, 1);
