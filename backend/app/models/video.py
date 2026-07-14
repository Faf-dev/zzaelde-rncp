from app import db


class Video(db.Model):
    __tablename__ = "videos"

    id = db.Column(db.String(32), primary_key=True)             # ID youtube de la video
    playlist_id = db.Column(db.String(64), db.ForeignKey("playlists.id"), nullable=False)
    titre = db.Column(db.String(100), nullable=False)
    miniature_url = db.Column(db.Text, default="")
    date_publication = db.Column(db.String(12), nullable=False) # format YYYY-MM-DD
    url = db.Column(db.Text, default="")                        # url de la video youtube
    masquee = db.Column(db.Boolean, default=False)              # True = caché pour les utilisateur, mais toujours en BDD

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.titre,
            "miniature": self.miniature_url,
            "publishedAt": self.date_publication,
            "url": self.url,
        }
