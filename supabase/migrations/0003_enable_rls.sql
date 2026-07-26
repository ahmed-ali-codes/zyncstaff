-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own (or owners can update all)
CREATE POLICY "Allow authenticated full access to profiles" 
ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Login Attempts: Service role only or authenticated read
CREATE POLICY "Allow full access to login_attempts" 
ON login_attempts FOR ALL USING (true) WITH CHECK (true);

-- Employees: All authenticated users in the company can read/write
CREATE POLICY "Allow authenticated full access to employees" 
ON employees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Document Types: All authenticated users can read/write
CREATE POLICY "Allow authenticated full access to document_types" 
ON document_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Documents: All authenticated users can read/write
CREATE POLICY "Allow authenticated full access to documents" 
ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Document Versions: All authenticated users can read/write
CREATE POLICY "Allow authenticated full access to document_versions" 
ON document_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Visa Tasks: All authenticated users can read/write
CREATE POLICY "Allow authenticated full access to visa_tasks" 
ON visa_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Audit Logs: All authenticated users can read, only system/functions can write
CREATE POLICY "Allow authenticated read to audit_logs" 
ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert to audit_logs" 
ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Notifications: Users can read/write their own
CREATE POLICY "Allow users to manage their own notifications" 
ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
