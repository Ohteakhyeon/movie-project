-- DB Tier: MariaDB schema
CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  runtime INT NOT NULL,
  genre VARCHAR(100) NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  poster_color VARCHAR(20) NOT NULL,
  poster_url VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  seats JSON NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservations_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reservations_movie_id ON reservations (movie_id);
