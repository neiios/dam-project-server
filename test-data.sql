-- User Data (including one admin)
-- Password is 'password'
INSERT INTO "user" (name, password, email, role)
VALUES 
    ('Alice Johnson', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'alice@sgf.lt', 'user'),
    ('Bob Smith', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'bob@sgf.lt', 'user'),
    ('Charlie Brown', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'charlie@sgf.lt', 'admin'),
    ('David Lee', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'david@sgf.lt', 'user'),
    ('Emily Davis', '$2a$05$ClNvfjLI.wobwrMgkmkSEeHnY1YcbTA1uut0y.fFLQJiCfW8369Sq', 'emily@sgf.lt', 'user');

-- Conference Data
INSERT INTO conference (name, longitude, latitude, start_date, end_date, image_url, description, city)
VALUES
    ('TechCon 2024', -122.4194, 37.7749, '2024-06-10', '2024-06-14', 'https://www.devoxx.fr/wp-content/uploads/2022/10/grand-amphi-keynote.jpg', 'The premier tech conference', 'San Francisco'),
    ('DataScience Summit', -74.0060, 40.7128, '2024-07-20', '2024-07-24', 'https://www.devoxx.fr/wp-content/uploads/2022/10/grand-amphi-keynote.jpg', 'No data, no purpose', 'New York City');

-- Track Data
INSERT INTO track (name, room, description, conference_id)
VALUES
    ('AI and ML', 'Room A', 'Artificial Intelligence and Machine Learning advancements', 1),
    ('Data Engineering', 'Room B', 'Building robust data pipelines', 1),
    ('Ethics in AI', 'Room C', 'Ethical considerations in AI development', 2);

-- Article Data
INSERT INTO article (title, authors, abstract, start_date, end_date, conference_id, track_id)
VALUES
    ('Deep Learning Breakthroughs', 'A. Turing, J. McCarthy, M. Minsky, G. Hinton, Y. LeCun, J. Epstein', 'Overview of recent deep learning advancements', '2024-06-11', '2024-06-11', 1, 1),
    ('Data Warehousing Best Practices', 'B. Kimball, W. Inmon', 'Strategies for designing and managing data warehouses', '2024-06-12', '2024-06-12', 1, 2),
    ('Bias in AI Algorithms', 'C. O Neil, J. Angwin', 'Examining the potential for bias in AI algorithms', '2024-07-21', '2024-07-21', 2, 3);

-- Conference Questions
INSERT INTO questions (question, answer, status, conference_id, user_id)
VALUES
    ('What are the keynote speakers?', '', 'pending', 1, 1),
    ('Will there be a virtual option?', 'Yes, virtual tickets available', 'answered', 1, 2),
    ('How can I submit a paper?', 'Deadline has passed', 'answered', 2, 3);

-- Article Questions
INSERT INTO article_questions (question, answer, status, article_id, user_id)
VALUES
    ('Are the slides available?', '', 'pending', 1, 4),
    ('Is there a video recording?', 'Yes, available on our YouTube channel', 'answered', 2, 5),
    ('How does this relate to real-world problems?', 'Applications in healthcare, finance, etc.', 'answered', 3, 1);
