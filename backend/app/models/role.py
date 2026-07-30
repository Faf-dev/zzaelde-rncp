import enum

class Role(str, enum.Enum):
    ADMIN = "admin"
    ZZAELDE = "zzaelde"
    STAGIAIRE = "stagiaire"