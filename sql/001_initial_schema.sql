-- PHASE 1 — DATABASE FOUNDATION

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location VARCHAR(255),
    hire_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Themes
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Surveys
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Survey Cycles
CREATE TABLE survey_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Questions
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('likert', 'enps', 'open_text', 'multi_select')),
    weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Responses
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_cycle_id UUID REFERENCES survey_cycles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if anonymous
    numeric_value DECIMAL(10,2),
    text_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. OKRs
CREATE TABLE okrs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    objective TEXT NOT NULL,
    key_results JSONB NOT NULL DEFAULT '[]',
    progress DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Benchmarks
CREATE TABLE benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
    industry VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Reports Cache
CREATE TABLE reports_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_cycle_id UUID REFERENCES survey_cycles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_responses_survey_cycle_id ON responses(survey_cycle_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_reports_cache_survey_cycle_id ON reports_cache(survey_cycle_id);
CREATE INDEX idx_reports_cache_department_id ON reports_cache(department_id);
CREATE INDEX idx_reports_cache_manager_id ON reports_cache(manager_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin: Full Access
CREATE POLICY admin_all ON users FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_dept ON departments FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_surveys ON surveys FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_cycles ON survey_cycles FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_themes ON themes FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_questions ON questions FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_responses ON responses FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_okrs ON okrs FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_benchmarks ON benchmarks FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY admin_all_reports ON reports_cache FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- HR: Cross-department aggregated access (read-only for most, full for reports)
CREATE POLICY hr_read_users ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_dept ON departments FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_surveys ON surveys FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_cycles ON survey_cycles FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_themes ON themes FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_questions ON questions FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_responses ON responses FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_okrs ON okrs FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_read_benchmarks ON benchmarks FOR SELECT USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));
CREATE POLICY hr_all_reports ON reports_cache FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hr'));

-- Manager: Team-only access
CREATE POLICY manager_read_users ON users FOR SELECT USING (manager_id = auth.uid() OR id = auth.uid());
CREATE POLICY manager_read_dept ON departments FOR SELECT USING (TRUE);
CREATE POLICY manager_read_surveys ON surveys FOR SELECT USING (TRUE);
CREATE POLICY manager_read_cycles ON survey_cycles FOR SELECT USING (TRUE);
CREATE POLICY manager_read_themes ON themes FOR SELECT USING (TRUE);
CREATE POLICY manager_read_questions ON questions FOR SELECT USING (TRUE);
-- Managers cannot see individual responses directly to protect anonymity. They only see reports_cache.
CREATE POLICY manager_read_okrs ON okrs FOR SELECT USING (user_id IN (SELECT id FROM users WHERE manager_id = auth.uid()) OR user_id = auth.uid());
CREATE POLICY manager_read_reports ON reports_cache FOR SELECT USING (manager_id = auth.uid());

-- Employee: Self-only access
CREATE POLICY employee_read_users ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY employee_read_dept ON departments FOR SELECT USING (TRUE);
CREATE POLICY employee_read_surveys ON surveys FOR SELECT USING (TRUE);
CREATE POLICY employee_read_cycles ON survey_cycles FOR SELECT USING (TRUE);
CREATE POLICY employee_read_themes ON themes FOR SELECT USING (TRUE);
CREATE POLICY employee_read_questions ON questions FOR SELECT USING (TRUE);
CREATE POLICY employee_insert_responses ON responses FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY employee_read_own_responses ON responses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY employee_all_okrs ON okrs FOR ALL USING (user_id = auth.uid());
CREATE POLICY employee_read_reports ON reports_cache FOR SELECT USING (department_id = (SELECT department_id FROM users WHERE id = auth.uid()) AND manager_id IS NULL);
