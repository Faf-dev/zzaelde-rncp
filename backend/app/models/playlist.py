from app import db


class Playlist(db.Model):
    __tablename__ = "playlists"

    id = db.Column(db.String(64), primary_key=True)  # id youtube de la playlist
    titre = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text, default="", nullable=True)
    miniature_url = db.Column(db.Text, default="", nullable=False)  # url de la miniature (ytb ou local)
    ordre = db.Column(db.Integer, default=0, unique=True, nullable=False)   # ordre d'affichage dans le slider

    videos = db.relationship(
        "Video",
        backref="playlist",
        lazy=True,
        order_by="Video.date_publication.desc()",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.titre,
            "description": self.description,
            "miniature": self.miniature_url,
            "ordre": self.ordre,
            "videos": [video.to_dict() for video in self.videos if not video.masquee],
        }
