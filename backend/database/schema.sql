CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_topics_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE
);

CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'Completed', 'Missed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_topic
        FOREIGN KEY (topic_id)
        REFERENCES topics(id)
        ON DELETE CASCADE
);
