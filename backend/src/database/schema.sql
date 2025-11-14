-- Hospital Management System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Staff members)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'radiologist', 'billing')),
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100),
    license_number VARCHAR(100),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    blood_group VARCHAR(10),
    allergies JSONB,
    emergency_contact JSONB NOT NULL,
    insurance_info JSONB,
    medical_history TEXT,
    current_status VARCHAR(50) DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visits Table (Patient visits/encounters)
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    visit_number VARCHAR(50) UNIQUE NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'registered',
    chief_complaint TEXT NOT NULL,
    vitals JSONB,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id),
    appointment_date TIMESTAMP NOT NULL,
    duration INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'scheduled',
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    medications JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispensed_at TIMESTAMP,
    dispensed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Tests Table
CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    ordered_by UUID NOT NULL REFERENCES users(id),
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ordered',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sample_collected_at TIMESTAMP,
    completed_at TIMESTAMP,
    reported_at TIMESTAMP,
    performed_by UUID REFERENCES users(id),
    results JSONB,
    normal_range VARCHAR(255),
    is_critical BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Radiology/Imaging Tests Table
CREATE TABLE radiology_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    ordered_by UUID NOT NULL REFERENCES users(id),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ordered',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP,
    performed_at TIMESTAMP,
    reported_at TIMESTAMP,
    performed_by UUID REFERENCES users(id),
    findings TEXT,
    images JSONB,
    is_urgent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing Table
CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    insurance_coverage DECIMAL(10, 2) DEFAULT 0,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    balance DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    items JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    recipient_id UUID NOT NULL REFERENCES users(id),
    recipient_role VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queue Management Table
CREATE TABLE queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    queue_number INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'emergency')),
    status VARCHAR(50) NOT NULL,
    estimated_wait_time INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table (for pharmacy and medical supplies)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    reorder_level INTEGER DEFAULT 10,
    unit_price DECIMAL(10, 2),
    expiry_date DATE,
    supplier VARCHAR(255),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better performance
CREATE INDEX idx_patients_registration ON patients(registration_number);
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_doctor ON visits(doctor_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_visit ON prescriptions(visit_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_lab_tests_visit ON lab_tests(visit_id);
CREATE INDEX idx_lab_tests_status ON lab_tests(status);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read);
CREATE INDEX idx_queue_department ON queue(department);
CREATE INDEX idx_queue_status ON queue(status);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Updated At Trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_tests_updated_at BEFORE UPDATE ON lab_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radiology_tests_updated_at BEFORE UPDATE ON radiology_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
