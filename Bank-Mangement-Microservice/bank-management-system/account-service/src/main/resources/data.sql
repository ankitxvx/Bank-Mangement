-- Seed accounts and transactions for demo

-- Savings account for SSN 1234567
INSERT INTO bank_accounts (account_number, account_holder_name, balance, customer_ssn, account_type, minimum_balance, interest_rate)
VALUES ('111222333444', 'Test User', 50000.00, '1234567', 'SAVINGS', 1000.00, 3.50);

-- Current account for SSN 7654321
INSERT INTO bank_accounts (account_number, account_holder_name, balance, customer_ssn, account_type, overdraft_limit, maintenance_fee)
VALUES ('555666777888', 'Demo User', 25000.00, '7654321', 'CURRENT', 10000.00, 500.00);

-- Some transactions
INSERT INTO transactions (source_account, destination_account, amount, transaction_type, timestamp, status, description)
VALUES ('111222333444', '555666777888', 1500.00, 'TRANSFER', CURRENT_TIMESTAMP(), 'SUCCESS', 'Initial transfer');
INSERT INTO transactions (source_account, destination_account, amount, transaction_type, timestamp, status, description)
VALUES ('111222333444', '111222333444', 3000.00, 'DEPOSIT', CURRENT_TIMESTAMP(), 'SUCCESS', 'Cash deposit');
INSERT INTO transactions (source_account, destination_account, amount, transaction_type, timestamp, status, description)
VALUES ('111222333444', '111222333444', 1200.00, 'WITHDRAWAL', CURRENT_TIMESTAMP(), 'SUCCESS', 'ATM withdrawal');
