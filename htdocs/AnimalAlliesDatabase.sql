CREATE DATABASE aa_lostandfound;

CREATE TABLE pet_lostandfound (
	entry_id 		INT(11)			NOT NULL	UNIQUE,
	description 	TEXT			NOT NULL,
	pet_image 		VARCHAR(150),
	thumbnail 		VARCHAR(150),
	date 			DATE,
PRIMARY KEY(entry_id));