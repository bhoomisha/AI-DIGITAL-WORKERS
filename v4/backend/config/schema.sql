-- =============================================
-- AI Digital Workers — Complete Database Schema
-- Run this in phpMyAdmin → SQL tab
-- =============================================

CREATE DATABASE IF NOT EXISTS labour_platform;
USE labour_platform;

CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100),
  phone        VARCHAR(15) UNIQUE NOT NULL,
  role         ENUM('worker','client'),
  skills       TEXT,
  experience   VARCHAR(50),
  location     VARCHAR(200),
  pincode      VARCHAR(10),
  daily_rate   INT DEFAULT 0,
  availability ENUM('available','busy') DEFAULT 'available',
  rating       DECIMAL(3,2) DEFAULT 0.00,
  jobs_done    INT DEFAULT 0,
  bio          TEXT,
  avatar       VARCHAR(500),
  face_data    TEXT,
  otp          VARCHAR(10),
  otp_expiry   DATETIME,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  client_id      INT NOT NULL,
  title          VARCHAR(200) NOT NULL,
  category       VARCHAR(100),
  location       VARCHAR(200) NOT NULL,
  description    TEXT,
  skills         TEXT,
  pay            INT NOT NULL,
  pay_type       ENUM('daily','fixed','hourly') DEFAULT 'daily',
  duration       VARCHAR(50),
  duration_unit  VARCHAR(20) DEFAULT 'days',
  urgency        ENUM('normal','urgent') DEFAULT 'normal',
  workers_needed INT DEFAULT 1,
  start_date     DATE,
  status         ENUM('open','assigned','in_progress','pending_approval','completed','paid','rework_required','cancelled') DEFAULT 'open',
  payment_unlocked TINYINT DEFAULT 0,
  distance       DECIMAL(5,2) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  job_id              INT NOT NULL,
  worker_id           INT NOT NULL,
  status              ENUM('pending','hired','rejected') DEFAULT 'pending',
  match_score         INT DEFAULT 0,
  skill_score         DECIMAL(4,2) DEFAULT 0,
  experience_score    DECIMAL(4,2) DEFAULT 0,
  rating_score        DECIMAL(4,2) DEFAULT 0,
  distance_score      DECIMAL(4,2) DEFAULT 0,
  availability_score  DECIMAL(4,2) DEFAULT 0,
  applied_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)    REFERENCES jobs(id)  ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_app (job_id, worker_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  job_id           INT NOT NULL,
  worker_id        INT NOT NULL,
  date             DATE NOT NULL,
  check_in_time    TIME,
  check_out_time   TIME,
  photo_url        VARCHAR(500),
  face_verified    TINYINT DEFAULT 0,
  face_match_score DECIMAL(5,2) DEFAULT 0,
  location_lat     DECIMAL(10,8),
  location_lng     DECIMAL(11,8),
  note             TEXT,
  status           ENUM('present','absent','half_day') DEFAULT 'present',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)    REFERENCES jobs(id)  ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS work_completion (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  job_id           INT NOT NULL,
  worker_id        INT NOT NULL,
  completion_note  TEXT,
  completion_photo VARCHAR(500),
  total_days_worked INT DEFAULT 0,
  ai_confidence    INT DEFAULT 0,
  ai_approved      TINYINT DEFAULT 0,
  submitted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status           ENUM('submitted','approved','rejected') DEFAULT 'submitted',
  client_remark    TEXT,
  approved_at      TIMESTAMP NULL,
  FOREIGN KEY (job_id)    REFERENCES jobs(id)  ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  job_id         INT NOT NULL,
  worker_id      INT NOT NULL,
  client_id      INT NOT NULL,
  amount         INT NOT NULL,
  platform_fee   INT DEFAULT 0,
  total_amount   INT NOT NULL,
  method         ENUM('upi','cash','bank') NOT NULL,
  upi_id         VARCHAR(100),
  transaction_id VARCHAR(200) UNIQUE,
  status         ENUM('pending','completed','failed') DEFAULT 'completed',
  paid_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)    REFERENCES jobs(id)  ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  job_id       INT,
  reviewer_id  INT NOT NULL,
  target_id    INT NOT NULL,
  rating       INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT,
  type         ENUM('client-to-worker','worker-to-client') NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id)   REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  title      VARCHAR(200),
  message    TEXT,
  type       ENUM('application','hired','rejected','payment','attendance','review','job_posted','completion','info') DEFAULT 'info',
  is_read    TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data
INSERT IGNORE INTO users (name,phone,role,location) VALUES
('Ramesh Gupta','9876543210','client','Sector 14, Noida'),
('Sunita Sharma','9812345678','client','Indirapuram, Ghaziabad');

INSERT IGNORE INTO users (name,phone,role,skills,experience,location,daily_rate,availability,rating,jobs_done) VALUES
('Raju Mistri','9900112233','worker','Painting,Wall Finishing','5','Sector 62, Noida',800,'available',0.00,0),
('Suresh Kumar','9988776655','worker','Plumbing,Pipe Fitting','8','Indirapuram',600,'available',0.00,0);

INSERT IGNORE INTO jobs (client_id,title,category,location,description,skills,pay,pay_type,duration,urgency) VALUES
(1,'House Painting','Painting','Sector 14, Noida','Need experienced painter for 2BHK interior.','Painting,Wall Finishing',800,'daily','3','normal'),
(2,'Plumbing Repair','Plumbing','Indirapuram','Kitchen and bathroom plumbing repair.','Plumbing,Pipe Fitting',600,'daily','1','urgent');
