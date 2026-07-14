CREATE TABLE IF NOT EXISTS "user" (
	"username" VARCHAR NOT NULL UNIQUE,
	"mot_de_passe" VARCHAR NOT NULL,
	PRIMARY KEY("username")
);

CREATE TABLE IF NOT EXISTS "playlists" (
	"id" VARCHAR NOT NULL,
	"titre" VARCHAR NOT NULL,
	"description" TEXT,
	"miniature_url" TEXT NOT NULL,
	"ordre" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "videos" (
	"id" INTEGER NOT NULL,
	"playlist_id" VARCHAR NOT NULL,
	"titre" VARCHAR NOT NULL,
	"miniature_url" VARCHAR DEFAULT '""',
	"date_publication" VARCHAR,
	"url" TEXT NOT NULL,
	"masquee" BOOLEAN NOT NULL DEFAULT False,
	PRIMARY KEY("id"),
	FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id")
	ON UPDATE NO ACTION ON DELETE CASCADE
);
