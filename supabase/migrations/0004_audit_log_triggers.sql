-- Function to process audit logs
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_action TEXT;
    v_entity_type TEXT;
    v_entity_id UUID;
    v_details JSONB;
BEGIN
    -- Get user ID from auth context (works when using Supabase authenticated client)
    v_user_id := auth.uid();
    
    v_entity_type := TG_TABLE_NAME;
    v_action := TG_OP; -- 'INSERT', 'UPDATE', 'DELETE'
    
    IF (TG_OP = 'DELETE') THEN
        v_entity_id := OLD.id;
        v_details := row_to_json(OLD)::jsonb;
    ELSE
        v_entity_id := NEW.id;
        v_details := row_to_json(NEW)::jsonb;
    END IF;

    -- Only log if we have a valid entity_id
    IF v_entity_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (v_user_id, v_action, v_entity_type, v_entity_id, v_details);
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the original transaction if audit logging fails
        RAISE WARNING 'Audit log failed: %', SQLERRM;
        IF (TG_OP = 'DELETE') THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for tables
DROP TRIGGER IF EXISTS audit_employees_trigger ON employees;
CREATE TRIGGER audit_employees_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_documents_trigger ON documents;
CREATE TRIGGER audit_documents_trigger
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_visa_tasks_trigger ON visa_tasks;
CREATE TRIGGER audit_visa_tasks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON visa_tasks
    FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_document_versions_trigger ON document_versions;
CREATE TRIGGER audit_document_versions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON document_versions
    FOR EACH ROW EXECUTE FUNCTION process_audit_log();
