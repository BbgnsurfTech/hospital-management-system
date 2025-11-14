-- Seed Data for Hospital Management System
-- Password for all demo users: Admin@123 (hashed with bcrypt)

-- Insert Sample Users
INSERT INTO users (email, password, first_name, last_name, role, phone, specialization, license_number, department) VALUES
-- Admin
('admin@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'John', 'Admin', 'admin', '+1234567890', NULL, NULL, 'Administration'),

-- Doctors
('dr.smith@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Emily', 'Smith', 'doctor', '+1234567891', 'Cardiology', 'MD-12345', 'Cardiology'),
('dr.jones@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Michael', 'Jones', 'doctor', '+1234567892', 'Orthopedics', 'MD-12346', 'Orthopedics'),
('dr.williams@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Sarah', 'Williams', 'doctor', '+1234567893', 'Pediatrics', 'MD-12347', 'Pediatrics'),

-- Nurses
('nurse.brown@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Jennifer', 'Brown', 'nurse', '+1234567894', NULL, 'RN-5001', 'Emergency'),
('nurse.davis@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Lisa', 'Davis', 'nurse', '+1234567895', NULL, 'RN-5002', 'General Ward'),

-- Receptionist
('reception@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Maria', 'Garcia', 'receptionist', '+1234567896', NULL, NULL, 'Front Desk'),

-- Pharmacist
('pharmacist@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'David', 'Martinez', 'pharmacist', '+1234567897', NULL, 'PH-3001', 'Pharmacy'),

-- Lab Technician
('lab@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Robert', 'Wilson', 'lab_technician', '+1234567898', 'Clinical Laboratory', 'LT-4001', 'Laboratory'),

-- Radiologist
('radio@hospital.com', '$2a$10$rG5YqZ9KzZYqYQKzKzZYqeZqZqZqZqZqZqZqZqZqZqZqZqZqZqZ', 'Patricia', 'Anderson', 'radiologist', '+1234567899', 'Radiology', 'RD-6001', 'Radiology');

-- Insert Sample Patients
INSERT INTO patients (registration_number, first_name, last_name, date_of_birth, gender, email, phone, address, blood_group, allergies, emergency_contact, insurance_info) VALUES
('PAT-2024-001', 'James', 'Johnson', '1985-05-15', 'male', 'james.j@email.com', '+1987654321', '123 Main St, City, State 12345', 'O+', '["Penicillin"]',
'{"name": "Mary Johnson", "phone": "+1987654322", "relationship": "Spouse"}',
'{"provider": "HealthFirst Insurance", "policyNumber": "HF123456", "validUntil": "2025-12-31"}'),

('PAT-2024-002', 'Linda', 'Taylor', '1990-08-22', 'female', 'linda.t@email.com', '+1987654323', '456 Oak Ave, City, State 12345', 'A+', '[]',
'{"name": "Robert Taylor", "phone": "+1987654324", "relationship": "Spouse"}',
'{"provider": "MediCare Plus", "policyNumber": "MC789012", "validUntil": "2025-12-31"}'),

('PAT-2024-003', 'William', 'Moore', '1978-03-10', 'male', 'william.m@email.com', '+1987654325', '789 Pine Rd, City, State 12345', 'B+', '["Sulfa drugs"]',
'{"name": "Susan Moore", "phone": "+1987654326", "relationship": "Spouse"}',
NULL);

-- Insert Sample Inventory Items
INSERT INTO inventory (item_name, item_type, category, quantity, unit, reorder_level, unit_price, supplier, location) VALUES
('Paracetamol 500mg', 'medication', 'Analgesics', 1000, 'tablets', 100, 0.05, 'PharmaCorp', 'Pharmacy-A1'),
('Amoxicillin 250mg', 'medication', 'Antibiotics', 500, 'capsules', 50, 0.15, 'MediSupply', 'Pharmacy-A2'),
('Ibuprofen 400mg', 'medication', 'NSAIDs', 800, 'tablets', 100, 0.08, 'PharmaCorp', 'Pharmacy-A1'),
('Insulin Injection', 'medication', 'Antidiabetic', 200, 'vials', 20, 25.00, 'DiabetesCare Inc', 'Pharmacy-B1'),
('Surgical Gloves', 'supply', 'PPE', 5000, 'pairs', 500, 0.20, 'MedSupplies Ltd', 'Storage-C1'),
('Syringes 5ml', 'supply', 'Consumables', 2000, 'pieces', 200, 0.15, 'MedSupplies Ltd', 'Storage-C2'),
('Blood Collection Tubes', 'supply', 'Lab Supplies', 1500, 'pieces', 150, 0.30, 'LabEquip Co', 'Lab-Storage');

COMMENT ON TABLE users IS 'Stores all staff members including doctors, nurses, and other hospital personnel';
COMMENT ON TABLE patients IS 'Stores patient demographic and contact information';
COMMENT ON TABLE visits IS 'Tracks individual patient visits/encounters';
COMMENT ON TABLE prescriptions IS 'Stores prescriptions issued by doctors';
COMMENT ON TABLE lab_tests IS 'Manages laboratory test orders and results';
COMMENT ON TABLE notifications IS 'Real-time notification system for staff';
COMMENT ON TABLE queue IS 'Manages patient queue across different departments';
