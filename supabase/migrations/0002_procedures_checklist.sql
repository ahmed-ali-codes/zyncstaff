-- Create procedures_checklist table
CREATE TABLE IF NOT EXISTS procedures_checklist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE procedures_checklist ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users"
ON procedures_checklist FOR SELECT
TO authenticated
USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access to authenticated users"
ON procedures_checklist FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow update access to authenticated users
CREATE POLICY "Allow update access to authenticated users"
ON procedures_checklist FOR UPDATE
TO authenticated
USING (true);

-- Allow delete access to authenticated users
CREATE POLICY "Allow delete access to authenticated users"
ON procedures_checklist FOR DELETE
TO authenticated
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_procedures_checklist_updated_at 
BEFORE UPDATE ON procedures_checklist 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
