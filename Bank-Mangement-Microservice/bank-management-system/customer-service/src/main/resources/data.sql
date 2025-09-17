-- Seed customers for demo
INSERT INTO customers (ssn_id, customer_name, email, address, contact_number, aadhar_number, pan_number, account_number, initial_deposit, age, date_of_birth, city, gender, account_type, balance)
VALUES ('1234567', 'Test User', 'test@example.com', '123 Main St', '9998887776', '999988887777', 'ABCDE1234F', '111222333444', 50000.00, 35, DATE '1990-01-01', 'Pune', 'M', 'Savings', 50000.00);

INSERT INTO customers (ssn_id, customer_name, email, address, contact_number, aadhar_number, pan_number, account_number, initial_deposit, age, date_of_birth, city, gender, account_type, balance)
VALUES ('7654321', 'Demo User', 'demo@example.com', '456 Central Ave', '8887776665', '888877776666', 'PQRSX5678Z', '555666777888', 25000.00, 30, DATE '1995-05-15', 'Mumbai', 'F', 'Current', 25000.00);
