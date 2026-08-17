from app import db
import uuid

# whitelist des reseaux acceptes pour link_type (evite d'accepter n'importe quelle valeur arbitraire)
ALLOWED_LINK_TYPES = [
    "tiktok",
    "youtube",
    "instagram",
    "twitter",
    "facebook",
    "snapchat",
    "twitch",
    "linkedin",
    "discord",
    "site",
]


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))  # uuid de la review
    image = db.Column(db.String(256), default="", nullable=False)  # minia du client
    name = db.Column(db.String(256), default="", nullable=False)  # nom du client
    text = db.Column(db.String(256), default="", nullable=False)  # commentaire de la review
    link = db.Column(db.String(256), default="", nullable=False)  # url du site du client (tiktok, youtube, etc.)
    link_type = db.Column(db.String(20), default="", nullable=False)  # type de lien (youtube, tiktok, etc.)
    ordre = db.Column(db.Integer, default=0, nullable=False)  # ordre d'affichage dans le carrousel
    owner_id = db.Column(db.String(36), db.ForeignKey("user.id"), nullable=False)  # id de l'utilisateur qui a créé la review


    def to_dict(self):
        return {
            "id": self.id,
            "image": self.image,
            "name": self.name,
            "text": self.text,
            "link": self.link,
            "link_type": self.link_type,
            "ordre": self.ordre,
        }
